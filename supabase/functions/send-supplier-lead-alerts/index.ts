import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0'
import { bearerToken, constantTimeEqual } from '../_shared/auth.ts'

/**
 * send-supplier-lead-alerts – mejlar byråer när ett matchande uppdrag har
 * godkänts. Kön fylls av triggern notify_matching_suppliers_for_project.
 *
 * Anropas av:
 *   - adminpanelen direkt efter ett godkännande (inloggad admin), så att
 *     mejlet går ut inom några sekunder,
 *   - cron var femte minut med headern x-cron-secret: <CRON_SECRET>, som
 *     säkerhetsnät för omförsök.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

const FUNCTION_NAME = 'send-supplier-lead-alerts'
const gatewayUrl = 'https://connector-gateway.lovable.dev/resend'
const fromEmail = 'Updro <info@auroramedia.se>'
const siteUrl = 'https://updro.se'
const MAX_ATTEMPTS = 5
const BATCH_SIZE = 50
const STALE_SENDING_MS = 15 * 60 * 1000

const BUDGET_LABELS: Record<string, string> = {
  under_10k: 'Under 10 000 kr',
  '10k_50k': '10 000–50 000 kr',
  '50k_150k': '50 000–150 000 kr',
  over_150k: 'Över 150 000 kr',
  unknown: 'Vet ej / diskuteras',
}

const START_LABELS: Record<string, string> = {
  asap: 'Snarast möjligt',
  within_month: 'Inom en månad',
  within_3months: 'Inom tre månader',
  flexible: 'Flexibelt',
}

const createAdminClient = (url: string, serviceKey: string) =>
  createClient(url, serviceKey, { auth: { persistSession: false } })

type AdminClient = ReturnType<typeof createAdminClient>

type Project = {
  id: string
  title: string | null
  category: string | null
  budget_range: string | null
  start_time: string | null
  city: string | null
  status: string | null
  offer_count: number | null
  max_offers: number | null
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character] || character))

const oneLine = (value: string) => value.replace(/\s+/g, ' ').trim()

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
  // Two accepted cron secrets: the shared CRON_SECRET and a dedicated
  // LEAD_ALERT_CRON_SECRET used by this function's own pg_cron job.
  const cronSecrets = [Deno.env.get('CRON_SECRET') || '', Deno.env.get('LEAD_ALERT_CRON_SECRET') || '']
  const header = request.headers.get('x-cron-secret') || ''
  if (cronSecrets.some(secret => constantTimeEqual(header, secret))) return true

  const token = bearerToken(request.headers.get('Authorization'))
  if (!token) return false
  if (cronSecrets.some(secret => constantTimeEqual(token, secret))) return true


  const { data, error } = await admin.auth.getUser(token)
  if (error || !data?.user) return false
  const { data: profile } = await admin.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
  return (profile as { role?: string } | null)?.role === 'admin'
}

export function composeLeadAlert(project: Project, recipientName: string) {
  const url = `${siteUrl}/dashboard/supplier/uppdrag/${encodeURIComponent(project.id)}`
  const category = oneLine(project.category || '') || 'din kategori'
  const title = oneLine(project.title || '').slice(0, 120) || 'Nytt uppdrag'
  const greeting = recipientName ? `Hej ${oneLine(recipientName)}!` : 'Hej!'
  const details = [
    ['Budget', project.budget_range ? BUDGET_LABELS[project.budget_range] || project.budget_range : ''],
    ['Start', project.start_time ? START_LABELS[project.start_time] || project.start_time : ''],
    ['Ort', project.city || ''],
  ].filter(([, value]) => Boolean(value))
  const footer = 'Du får det här mejlet eftersom din byrå är registrerad på Updro. Vill du inte ha mejl om nya uppdrag? Svara på mejlet så stänger vi av dem.'

  const subject = `Nytt uppdrag inom ${category}: ${title}`.slice(0, 150)
  const text = [
    greeting,
    '',
    `Ett nytt uppdrag inom ${category} har granskats och är öppet för offerter på Updro.`,
    '',
    title,
    ...details.map(([label, value]) => `${label}: ${value}`),
    '',
    'Högst tre byråer kan lämna offert på samma uppdrag.',
    '',
    `Se uppdraget: ${url}`,
    '',
    footer,
  ].join('\n')

  const rows = details.map(([label, value]) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#64748b">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
  ).join('')
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a">
      <h1 style="color:#4338CA;font-size:22px">Nytt uppdrag inom ${escapeHtml(category)}</h1>
      <p>${escapeHtml(greeting)}</p>
      <p>Ett nytt uppdrag har granskats och är öppet för offerter på Updro.</p>
      <p style="font-size:17px;font-weight:600;margin:20px 0 8px">${escapeHtml(title)}</p>
      ${rows ? `<table style="border-collapse:collapse;font-size:14px">${rows}</table>` : ''}
      <p>Högst tre byråer kan lämna offert på samma uppdrag.</p>
      <p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#4338CA;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">Se uppdraget</a></p>
      <p style="color:#64748b;font-size:13px">Om knappen inte fungerar, klistra in denna länk i webbläsaren:<br>${escapeHtml(url)}</p>
      <p style="color:#64748b;font-size:12px;margin-top:32px">${escapeHtml(footer)}</p>
    </div>`

  return { subject, text, html }
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

  // Rows left in 'sending' by a run that crashed go back to the queue.
  await admin.from('supplier_lead_alert_queue')
    .update({ status: 'pending', updated_at: new Date().toISOString() })
    .eq('status', 'sending')
    .lt('updated_at', new Date(Date.now() - STALE_SENDING_MS).toISOString())

  const { data: rows, error } = await admin
    .from('supplier_lead_alert_queue')
    .select('id, supplier_id, project_id, attempts')
    .eq('status', 'pending')
    .lt('attempts', MAX_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) {
    await logCall(admin, { status: 500, duration_ms: Date.now() - started, error: error.message })
    return json({ error: error.message }, 500)
  }

  const projects = new Map<string, Project | null>()
  let sent = 0
  let failed = 0
  let skipped = 0

  for (const row of (rows || []) as { id: string; supplier_id: string; project_id: string; attempts: number | null }[]) {
    const attempts = (row.attempts || 0) + 1

    // Claim the row first so overlapping runs never mail an agency twice.
    const { data: claimed } = await admin.from('supplier_lead_alert_queue')
      .update({ status: 'sending', attempts, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('status', 'pending')
      .select('id')
    if (!claimed?.length) continue

    const finish = (status: 'pending' | 'sent' | 'failed' | 'skipped', extra: Record<string, unknown> = {}) =>
      admin.from('supplier_lead_alert_queue')
        .update({ status, updated_at: new Date().toISOString(), ...extra })
        .eq('id', row.id)

    if (!projects.has(row.project_id)) {
      const { data } = await admin.from('projects')
        .select('id, title, category, budget_range, start_time, city, status, offer_count, max_offers')
        .eq('id', row.project_id)
        .maybeSingle()
      projects.set(row.project_id, (data as Project | null) || null)
    }
    const project = projects.get(row.project_id)
    if (!project || project.status !== 'active' || (project.offer_count ?? 0) >= (project.max_offers ?? 3)) {
      await finish('skipped', { last_error: project ? 'project_no_longer_open' : 'project_missing' })
      skipped++
      continue
    }

    const [{ data: supplier }, { data: profile }] = await Promise.all([
      admin.from('supplier_profiles').select('contact_email, contact_name, lead_alert_emails').eq('id', row.supplier_id).maybeSingle(),
      admin.from('profiles').select('email, full_name, role').eq('id', row.supplier_id).maybeSingle(),
    ])
    const agency = supplier as { contact_email?: string | null; contact_name?: string | null; lead_alert_emails?: boolean | null } | null
    const account = profile as { email?: string | null; full_name?: string | null; role?: string | null } | null
    const email = String(agency?.contact_email || account?.email || '').trim()
    if (!agency || account?.role !== 'supplier' || agency.lead_alert_emails === false) {
      await finish('skipped', { last_error: 'not_eligible' })
      skipped++
      continue
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await finish('skipped', { last_error: 'no_valid_email' })
      skipped++
      continue
    }

    const message = composeLeadAlert(project, agency.contact_name || account?.full_name || '')
    try {
      const response = await fetch(`${gatewayUrl}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': resendKey,
        },
        body: JSON.stringify({ from: fromEmail, to: [email], subject: message.subject, text: message.text, html: message.html }),
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

  const processed = rows?.length || 0
  await logCall(admin, { status: 200, duration_ms: Date.now() - started, meta: { processed, sent, failed, skipped } })
  return json({ ok: true, processed, sent, failed, skipped })
})
