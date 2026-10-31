import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0'
import { hasCronSecret } from '../_shared/auth.ts'
import { escapeHtml, swedishCount } from '../_shared/notification-email.ts'

/**
 * send-guest-offer-emails – mejlar beställare utan konto när en byrå lämnat
 * offert. Kön fylls av triggern enqueue_guest_offer_email på public.offers.
 *
 * Anropas av cron varannan minut med x-cron-secret (GUEST_CRON_TOKEN,
 * CRON_SECRET eller LEAD_ALERT_CRON_SECRET).
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

const FUNCTION_NAME = 'send-guest-offer-emails'
const gatewayUrl = 'https://connector-gateway.lovable.dev/resend'
const fromEmail = 'Updro <info@auroramedia.se>'
const siteUrl = 'https://updro.se'
const MAX_ATTEMPTS = 5
const BATCH_SIZE = 25
const STALE_SENDING_MS = 15 * 60 * 1000
const BRAND = '#1851C3'
const TEXT = '#122B40'
const MUTED = '#5B6B7A'

const createAdminClient = (url: string, serviceKey: string) =>
  createClient(url, serviceKey, { auth: { persistSession: false } })
type AdminClient = ReturnType<typeof createAdminClient>

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

export function composeGuestOfferEmail(input: { name: string | null; email: string; projectId: string; projectTitle: string | null; offerCount: number; maxOffers: number }) {
  const registerUrl = `${siteUrl}/registrera?email=${encodeURIComponent(input.email)}&project=${encodeURIComponent(input.projectId)}`
  const name = (input.name || '').trim()
  const title = (input.projectTitle || '').trim() || 'ditt uppdrag'
  const progress = input.offerCount > 1
    ? `Du har nu ${swedishCount(input.offerCount)} av högst ${swedishCount(input.maxOffers)} offerter att jämföra.`
    : `Fler byråer kan svara – du får högst ${swedishCount(input.maxOffers)} offerter.`
  const text = `Hej ${name}! En byrå har lämnat en offert på ditt uppdrag "${title}" på Updro.\n\n` +
    `${progress}\n\n` +
    `Skapa ett kostnadsfritt konto med samma e-postadress (${input.email}) för att läsa offerten, ställa frågor och välja byrå. ` +
    `Ditt uppdrag kopplas automatiskt till kontot när du registrerar dig – ingen ny publicering behövs.\n\n` +
    `Registrera dig här: ${registerUrl}\n\nVänliga hälsningar\nUpdro`
  const safeUrl = escapeHtml(registerUrl)
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:${TEXT};line-height:1.5">
      <p style="font-size:18px;font-weight:700;margin:0 0 24px"><span style="color:${TEXT}">upd</span><span style="color:${BRAND}">ro</span></p>
      <h1 style="color:${TEXT};font-size:22px">Du har fått en offert på ditt uppdrag</h1>
      <p>Hej ${escapeHtml(name) || 'där'}!</p>
      <p>En byrå har lämnat en offert på <strong>${escapeHtml(title)}</strong> på Updro. ${escapeHtml(progress)}</p>
      <p>Skapa ett kostnadsfritt konto med samma e-postadress (<strong>${escapeHtml(input.email)}</strong>) för att läsa offerten, ställa frågor och välja byrå. Ditt uppdrag kopplas automatiskt till kontot när du registrerar dig – du behöver inte publicera det på nytt.</p>
      <p style="margin:24px 0"><a href="${safeUrl}" style="background:${BRAND};color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">Skapa konto och se offerten</a></p>
      <p style="color:${MUTED};font-size:13px">Om knappen inte fungerar, klistra in denna länk i webbläsaren:<br>${safeUrl}</p>
      <p style="margin-top:32px">Vänliga hälsningar<br>Updro</p>
    </div>`
  return { subject: 'Du har fått en offert på ditt uppdrag', text, html }
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  const started = Date.now()

  const authorized = hasCronSecret(request.headers, [
    Deno.env.get('GUEST_CRON_TOKEN'), Deno.env.get('CRON_SECRET'), Deno.env.get('LEAD_ALERT_CRON_SECRET'),
  ])
  if (!authorized) return json({ error: 'Unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) return json({ error: 'Missing env' }, 500)
  const admin = createAdminClient(supabaseUrl, serviceKey)

  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!lovableKey || !resendKey) {
    await logCall(admin, { status: 500, duration_ms: Date.now() - started, error: 'missing_email_keys' })
    return json({ error: 'Email gateway not configured' }, 500)
  }

  // Rows left in 'sending' by a run that crashed go back to the queue, unless
  // they already used their last attempt.
  const staleBefore = new Date(Date.now() - STALE_SENDING_MS).toISOString()
  await admin.from('guest_offer_email_queue')
    .update({ status: 'failed', last_error: 'stopped_while_sending' })
    .eq('status', 'sending').lt('updated_at', staleBefore).gte('attempts', MAX_ATTEMPTS)
  await admin.from('guest_offer_email_queue')
    .update({ status: 'pending' })
    .eq('status', 'sending').lt('updated_at', staleBefore)

  const { data: rows, error } = await admin
    .from('guest_offer_email_queue')
    .select('id, offer_id, project_id, guest_lead_id, attempts')
    .eq('status', 'pending')
    .lt('attempts', MAX_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    await logCall(admin, { status: 500, duration_ms: Date.now() - started, error: error.message })
    return json({ error: error.message }, 500)
  }

  let sent = 0
  let failed = 0
  let skipped = 0

  for (const row of rows || []) {
    const attempts = (row.attempts || 0) + 1

    // Claim the row first so overlapping runs never mail a guest twice.
    const { data: claimed } = await admin.from('guest_offer_email_queue')
      .update({ status: 'sending', attempts })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id')
    if (!claimed?.length) continue

    const finish = (status: 'pending' | 'sent' | 'failed' | 'skipped', extra: Record<string, unknown> = {}) =>
      admin.from('guest_offer_email_queue').update({ status, ...extra }).eq('id', row.id)

    const [{ data: lead }, { data: project }, { count: offerCount }] = await Promise.all([
      admin.from('guest_leads').select('email, full_name').eq('id', row.guest_lead_id).maybeSingle(),
      admin.from('projects').select('id, title, buyer_id, max_offers').eq('id', row.project_id).maybeSingle(),
      admin.from('offers').select('id', { count: 'exact', head: true }).eq('project_id', row.project_id),
    ])

    if (!lead?.email || !project) {
      await finish('skipped', { last_error: 'lead_or_project_missing' })
      skipped++
      continue
    }

    if (project.buyer_id) {
      await finish('skipped', { last_error: 'project_now_has_registered_buyer' })
      skipped++
      continue
    }

    const message = composeGuestOfferEmail({
      name: lead.full_name, email: lead.email, projectId: project.id, projectTitle: project.title,
      offerCount: offerCount || 1, maxOffers: project.max_offers || 3,
    })

    try {
      const response = await fetch(`${gatewayUrl}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': resendKey,
        },
        body: JSON.stringify({ from: fromEmail, to: [lead.email], subject: message.subject, text: message.text, html: message.html }),
      })

      if (response.ok) {
        await finish('sent', { sent_at: new Date().toISOString(), last_error: null })
        sent++
      } else {
        const body = await response.text()
        await finish(attempts >= MAX_ATTEMPTS ? 'failed' : 'pending', { last_error: `gateway_${response.status}: ${body.slice(0, 400)}` })
        failed++
      }
    } catch (err) {
      await finish(attempts >= MAX_ATTEMPTS ? 'failed' : 'pending', {
        last_error: err instanceof Error ? err.message.slice(0, 400) : 'unknown_error',
      })
      failed++
    }
  }

  const duration_ms = Date.now() - started
  await logCall(admin, {
    status: 200, duration_ms,
    meta: { processed: rows?.length || 0, sent, failed, skipped },
  })

  return json({ ok: true, processed: rows?.length || 0, sent, failed, skipped })
})
