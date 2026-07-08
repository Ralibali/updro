import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

const gatewayUrl = 'https://connector-gateway.lovable.dev/resend'
const fromEmail = 'Updro <info@auroramedia.se>'
const siteUrl = 'https://updro.se'
const MAX_ATTEMPTS = 5
const BATCH_SIZE = 25

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character] || character))

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

async function logCall(admin: ReturnType<typeof createClient>, entry: { status: number; duration_ms: number; error?: string | null; meta?: Record<string, unknown> }) {
  try {
    await admin.from('edge_function_logs').insert({
      function_name: 'send-guest-offer-emails',
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

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  const started = Date.now()

  const guestToken = Deno.env.get('GUEST_CRON_TOKEN')
  const cronSecret = Deno.env.get('CRON_SECRET')
  const provided = request.headers.get('x-cron-secret') || (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  const authorized = (guestToken && provided === guestToken) || (cronSecret && provided === cronSecret)
  if (!authorized) return json({ error: 'Unauthorized' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  if (!supabaseUrl || !serviceKey) return json({ error: 'Missing env' }, 500)
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!lovableKey || !resendKey) {
    await logCall(admin, { status: 500, duration_ms: Date.now() - started, error: 'missing_email_keys' })
    return json({ error: 'Email gateway not configured' }, 500)
  }

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
    const [{ data: lead }, { data: project }] = await Promise.all([
      admin.from('guest_leads').select('email, full_name').eq('id', row.guest_lead_id).single(),
      admin.from('projects').select('id, title, buyer_id').eq('id', row.project_id).single(),
    ])

    if (!lead?.email || !project) {
      await admin.from('guest_offer_email_queue').update({
        status: 'skipped', attempts, last_error: 'lead_or_project_missing',
      }).eq('id', row.id)
      skipped++
      continue
    }

    if (project.buyer_id) {
      await admin.from('guest_offer_email_queue').update({
        status: 'skipped', attempts, last_error: 'project_now_has_registered_buyer',
      }).eq('id', row.id)
      skipped++
      continue
    }

    const registerUrl = `${siteUrl}/registrera?email=${encodeURIComponent(lead.email)}&project=${encodeURIComponent(project.id)}`
    const safeName = escapeHtml(lead.full_name || '')
    const safeTitle = escapeHtml(project.title || 'ditt uppdrag')
    const safeUrl = escapeHtml(registerUrl)
    const text = `Hej ${lead.full_name || ''}! En byrå har lämnat en offert på ditt uppdrag "${project.title}" på Updro.\n\n` +
      `Skapa ett kostnadsfritt konto med samma e-postadress (${lead.email}) för att läsa offerten, ställa frågor och välja byrå. ` +
      `Ditt uppdrag kopplas automatiskt till kontot när du registrerar dig – ingen ny publicering behövs.\n\n` +
      `Registrera dig här: ${registerUrl}\n\nVänliga hälsningar\nUpdro`

    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0f172a">
      <h1 style="color:#4338CA;font-size:22px">Du har fått en offert på ditt uppdrag</h1>
      <p>Hej ${safeName || 'där'}!</p>
      <p>En byrå har lämnat en offert på <strong>${safeTitle}</strong> på Updro.</p>
      <p>Skapa ett kostnadsfritt konto med samma e-postadress (<strong>${escapeHtml(lead.email)}</strong>) för att läsa offerten, ställa frågor och välja byrå. Ditt uppdrag kopplas automatiskt till kontot när du registrerar dig – du behöver inte publicera det på nytt.</p>
      <p style="margin:24px 0"><a href="${safeUrl}" style="background:#4338CA;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">Skapa konto och se offerten</a></p>
      <p style="color:#64748b;font-size:13px">Om knappen inte fungerar, klistra in denna länk i webbläsaren:<br>${safeUrl}</p>
      <p style="margin-top:32px">Vänliga hälsningar<br>Updro</p>
    </div>`

    try {
      const response = await fetch(`${gatewayUrl}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': resendKey,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [lead.email],
          subject: 'Du har fått en offert på ditt uppdrag',
          text,
          html,
        }),
      })

      if (response.ok) {
        await admin.from('guest_offer_email_queue').update({
          status: 'sent', attempts, sent_at: new Date().toISOString(), last_error: null,
        }).eq('id', row.id)
        sent++
      } else {
        const body = await response.text()
        const isFinal = attempts >= MAX_ATTEMPTS
        await admin.from('guest_offer_email_queue').update({
          status: isFinal ? 'failed' : 'pending',
          attempts,
          last_error: `gateway_${response.status}: ${body.slice(0, 400)}`,
        }).eq('id', row.id)
        failed++
      }
    } catch (err) {
      const isFinal = attempts >= MAX_ATTEMPTS
      await admin.from('guest_offer_email_queue').update({
        status: isFinal ? 'failed' : 'pending',
        attempts,
        last_error: err instanceof Error ? err.message.slice(0, 400) : 'unknown_error',
      }).eq('id', row.id)
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
