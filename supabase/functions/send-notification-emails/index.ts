import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0'
import { bearerToken, hasCronSecret } from '../_shared/auth.ts'
import { composeNotificationEmail, EMAILED_NOTIFICATION_TYPES } from '../_shared/notification-email.ts'

/**
 * send-notification-emails – mejlar viktiga notiser (ny offert, beslut,
 * avtal, påminnelser och chattmeddelanden) till inloggade beställare och byråer.
 *
 * Kön fylls av triggern enqueue_notification_email på public.notifications.
 * Chattnotiser väntar tio minuter och hoppas över om de redan lästs i appen.
 * Flera händelser till samma person samlas i ett mejl.
 *
 * Anropas av cron varannan minut med x-cron-secret (CRON_SECRET eller
 * LEAD_ALERT_CRON_SECRET), eller manuellt av en inloggad admin.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

const FUNCTION_NAME = 'send-notification-emails'
const gatewayUrl = 'https://connector-gateway.lovable.dev/resend'
const fromEmail = 'Updro <info@auroramedia.se>'
const MAX_ATTEMPTS = 5
const BATCH_SIZE = 100
const STALE_SENDING_MS = 15 * 60 * 1000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const createAdminClient = (url: string, serviceKey: string) =>
  createClient(url, serviceKey, { auth: { persistSession: false } })
type AdminClient = ReturnType<typeof createAdminClient>

type QueueRow = { id: string; notification_id: string; user_id: string; type: string; attempts: number | null }
type NotificationRow = {
  id: string; user_id: string; type: string; title: string
  message: string | null; link: string | null; is_read: boolean | null; created_at: string
}
type Recipient = { email: string; name: string }

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

async function logCall(admin: AdminClient, entry: { status: number; duration_ms: number; error?: string | null; meta?: Record<string, unknown> }) {
  try {
    await admin.from('edge_function_logs').insert({
      function_name: FUNCTION_NAME,
      status_code: entry.status,
      duration_ms: entry.duration_ms,
      ok: entry.status >= 200 && entry.status < 400,
      error: entry.error || null,
      meta: entry.meta || {},
    })
  } catch (error) {
    console.error('log insert failed', error)
  }
}

async function isAuthorized(request: Request, admin: AdminClient): Promise<boolean> {
  if (hasCronSecret(request.headers, [Deno.env.get('CRON_SECRET'), Deno.env.get('LEAD_ALERT_CRON_SECRET')])) return true
  const token = bearerToken(request.headers.get('Authorization'))
  if (!token) return false
  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) return false
  const { data: profile } = await admin.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  return (profile as { role?: string } | null)?.role === 'admin'
}

async function loadRecipients(admin: AdminClient, userIds: string[]): Promise<Map<string, Recipient>> {
  const recipients = new Map<string, Recipient>()
  if (!userIds.length) return recipients
  const [{ data: profiles }, { data: suppliers }] = await Promise.all([
    admin.from('profiles').select('id, email, full_name, role').in('id', userIds),
    admin.from('supplier_profiles').select('id, contact_email, contact_name').in('id', userIds),
  ])
  const agencyContacts = new Map(((suppliers || []) as { id: string; contact_email: string | null; contact_name: string | null }[])
    .map(row => [row.id, row]))
  for (const profile of (profiles || []) as { id: string; email: string | null; full_name: string | null; role: string | null }[]) {
    const agency = profile.role === 'supplier' ? agencyContacts.get(profile.id) : undefined
    const email = String(agency?.contact_email || profile.email || '').trim()
    if (EMAIL_PATTERN.test(email)) recipients.set(profile.id, { email, name: agency?.contact_name || profile.full_name || '' })
  }
  return recipients
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const started = Date.now()

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) return json({ error: 'Missing env' }, 500)
  const admin = createAdminClient(supabaseUrl, serviceKey)

  if (!(await isAuthorized(request, admin))) return json({ error: 'Unauthorized' }, 401)

  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!lovableKey || !resendKey) {
    await logCall(admin, { status: 500, duration_ms: Date.now() - started, error: 'missing_email_keys' })
    return json({ error: 'Email gateway not configured' }, 500)
  }

  const now = new Date().toISOString()
  // Rows left in 'sending' by a run that crashed go back to the queue.
  await admin.from('notification_email_queue')
    .update({ status: 'pending', updated_at: now })
    .eq('status', 'sending')
    .lt('updated_at', new Date(Date.now() - STALE_SENDING_MS).toISOString())

  const { data: due, error } = await admin.from('notification_email_queue')
    .select('id, notification_id, user_id, type, attempts')
    .eq('status', 'pending')
    .lt('attempts', MAX_ATTEMPTS)
    .lte('send_after', now)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)
  if (error) {
    await logCall(admin, { status: 500, duration_ms: Date.now() - started, error: error.message })
    return json({ error: error.message }, 500)
  }

  // Claim rows before sending so overlapping runs never mail anyone twice.
  const claimed: QueueRow[] = []
  const byAttempts = new Map<number, QueueRow[]>()
  for (const row of (due || []) as QueueRow[]) {
    const attempts = row.attempts || 0
    byAttempts.set(attempts, [...(byAttempts.get(attempts) || []), row])
  }
  for (const [attempts, rows] of byAttempts) {
    const { data } = await admin.from('notification_email_queue')
      .update({ status: 'sending', attempts: attempts + 1, updated_at: new Date().toISOString() })
      .in('id', rows.map(row => row.id))
      .eq('status', 'pending')
      .select('id')
    const ids = new Set(((data || []) as { id: string }[]).map(row => row.id))
    claimed.push(...rows.filter(row => ids.has(row.id)).map(row => ({ ...row, attempts: attempts + 1 })))
  }

  const finish = (ids: string[], status: 'pending' | 'sent' | 'failed' | 'skipped', extra: Record<string, unknown> = {}) =>
    ids.length
      ? admin.from('notification_email_queue').update({ status, updated_at: new Date().toISOString(), ...extra }).in('id', ids)
      : Promise.resolve()

  let sent = 0
  let failed = 0
  let skipped = 0
  if (claimed.length) {
    const { data: notificationRows } = await admin.from('notifications')
      .select('id, user_id, type, title, message, link, is_read, created_at')
      .in('id', claimed.map(row => row.notification_id))
    const notifications = new Map(((notificationRows || []) as NotificationRow[]).map(row => [row.id, row]))
    const recipients = await loadRecipients(admin, [...new Set(claimed.map(row => row.user_id))])
    const emailed = new Set<string>(EMAILED_NOTIFICATION_TYPES)

    const groups = new Map<string, { rows: QueueRow[]; items: NotificationRow[] }>()
    for (const row of claimed) {
      const notification = notifications.get(row.notification_id)
      let reason = ''
      if (!notification) reason = 'notification_missing'
      else if (!emailed.has(notification.type)) reason = 'type_not_emailed'
      else if (notification.type === 'new_message' && notification.is_read) reason = 'read_in_app'
      else if (!recipients.has(row.user_id)) reason = 'no_valid_email'
      if (reason) {
        await finish([row.id], 'skipped', { last_error: reason })
        skipped++
        continue
      }
      const group = groups.get(row.user_id) || { rows: [], items: [] }
      group.rows.push(row)
      group.items.push(notification as NotificationRow)
      groups.set(row.user_id, group)
    }

    for (const [userId, group] of groups) {
      const recipient = recipients.get(userId) as Recipient
      const ids = group.rows.map(row => row.id)
      const items = [...group.items].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
      const message = composeNotificationEmail({ recipientName: recipient.name, items })
      try {
        const response = await fetch(`${gatewayUrl}/emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableKey}`,
            'X-Connection-Api-Key': resendKey,
          },
          body: JSON.stringify({ from: fromEmail, to: [recipient.email], subject: message.subject, text: message.text, html: message.html }),
        })
        if (response.ok) {
          await finish(ids, 'sent', { sent_at: new Date().toISOString(), last_error: null })
          sent += ids.length
        } else {
          const body = (await response.text()).slice(0, 400)
          for (const row of group.rows) {
            await finish([row.id], (row.attempts || 0) >= MAX_ATTEMPTS ? 'failed' : 'pending', { last_error: `gateway_${response.status}: ${body}` })
          }
          failed += ids.length
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message.slice(0, 400) : 'unknown_error'
        for (const row of group.rows) {
          await finish([row.id], (row.attempts || 0) >= MAX_ATTEMPTS ? 'failed' : 'pending', { last_error: reason })
        }
        failed += ids.length
      }
    }
  }

  const processed = claimed.length
  await logCall(admin, { status: 200, duration_ms: Date.now() - started, meta: { processed, sent, failed, skipped } })
  return json({ ok: true, processed, sent, failed, skipped })
})
