import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.99.0'

const allowedCategories = new Set([
  'Webbutveckling', 'E-handel', 'Digital marknadsföring', 'Grafisk design/UX',
  'SEO', 'App-utveckling', 'IT-konsult', 'Sociala medier', 'Mjukvaruutveckling',
  'Video & foto', 'Varumärke & PR', 'UX/Webbdesign', 'Underhåll/IT Support',
  'Affärsutveckling', 'AI-utveckling',
])
const allowedBudgets = new Set(['under_10k', '10k_50k', '50k_150k', 'over_150k', 'unknown'])
const allowedStarts = new Set(['asap', 'within_month', 'within_3months', 'flexible'])
const gatewayUrl = 'https://connector-gateway.lovable.dev/resend'
const fromEmail = 'Updro <info@auroramedia.se>'
const siteUrl = 'https://updro.se'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})

const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character] || character))

const clientIp = (request: Request) =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-real-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'unknown'

async function hashIp(ip: string) {
  try {
    const salt = Deno.env.get('RATE_LIMIT_SALT') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'updro'
    const buffer = new TextEncoder().encode(`${salt}:${ip}`)
    const digest = await crypto.subtle.digest('SHA-256', buffer)
    return Array.from(new Uint8Array(digest)).slice(0, 12).map(byte => byte.toString(16).padStart(2, '0')).join('')
  } catch { return 'unknown' }
}

async function logCall(entry: {
  status: number
  duration_ms: number
  error?: string | null
  meta?: Record<string, unknown>
  ip_hash?: string | null
}) {
  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) return
    const admin = createClient(url, key, { auth: { persistSession: false } })
    await admin.from('edge_function_logs').insert({
      function_name: 'submit-guest-lead',
      status_code: entry.status,
      duration_ms: entry.duration_ms,
      ok: entry.status >= 200 && entry.status < 400,
      error: entry.error || null,
      meta: entry.meta || {},
      ip_hash: entry.ip_hash || null,
    })
  } catch (error) {
    console.error('log insert failed', error)
  }
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (request.method !== 'POST') return respond({ error: 'Metoden stöds inte.' }, 405)

  const started = Date.now()
  const ipHash = await hashIp(clientIp(request))
  const finish = (response: Response, error?: string, meta: Record<string, unknown> = {}) => {
    const duration_ms = Date.now() - started
    console.log(JSON.stringify({ fn: 'submit-guest-lead', status: response.status, duration_ms, error: error || null, ...meta }))
    void logCall({ status: response.status, duration_ms, error, meta, ip_hash: ipHash })
    return response
  }

  try {
    const payload = await request.json().catch(() => ({}))
    if (text(payload.website, 200)) return finish(respond({ success: true }), undefined, { reason: 'honeypot' })

    const email = text(payload.email, 254).toLowerCase()
    const fullName = text(payload.full_name, 120)
    const companyName = text(payload.company_name, 160)
    const phone = text(payload.phone, 40)
    const title = text(payload.title, 100)
    const description = text(payload.description, 5000)
    const category = text(payload.category, 80)
    const budgetRange = text(payload.budget_range, 40)
    const startTime = text(payload.start_time, 40)

    if (!validEmail(email)) return finish(respond({ error: 'Ange en giltig e-postadress.' }, 400), 'invalid_email')
    if (fullName.length < 2) return finish(respond({ error: 'Ange ditt namn.' }, 400), 'missing_name')
    if (title.length < 3 || description.length < 20) return finish(respond({ error: 'Beskriv uppdraget tydligare.' }, 400), 'brief_too_short')
    if (!allowedCategories.has(category) || !allowedBudgets.has(budgetRange) || !allowedStarts.has(startTime)) {
      return finish(respond({ error: 'Kontrollera kategori, budget och önskad start.' }, 400), 'invalid_enums')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) return finish(respond({ error: 'Servern är inte korrekt konfigurerad.' }, 500), 'missing_env')

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const { data: ipAllowed, error: rateError } = await admin.rpc('consume_edge_rate_limit', {
      p_key: `submit-guest-lead:${ipHash}`,
      p_limit: 8,
      p_window_seconds: 86400,
    })
    if (rateError) throw rateError
    if (!ipAllowed) return finish(respond({ error: 'För många uppdrag har skickats från din anslutning idag.' }, 429), 'rate_limit_ip')

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const recent = await admin.from('guest_leads').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', tenMinutesAgo)
    if ((recent.count || 0) > 0) return finish(respond({ error: 'Ett uppdrag har nyligen skickats från denna e-postadress. Vänta en stund.' }, 429), 'rate_limit_10min', { category })

    const daily = await admin.from('guest_leads').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', oneDayAgo)
    if ((daily.count || 0) >= 3) return finish(respond({ error: 'För många uppdrag har skickats från denna e-postadress idag.' }, 429), 'rate_limit_24h', { category })

    const { data: createdRows, error: createError } = await admin.rpc('create_guest_project', {
      p_email: email,
      p_full_name: fullName,
      p_company_name: companyName,
      p_phone: phone,
      p_title: title,
      p_description: description,
      p_category: category,
      p_budget_range: budgetRange,
      p_start_time: startTime,
      p_is_company: Boolean(payload.is_company),
      p_source: 'publicera',
    })
    if (createError) throw createError

    const created = Array.isArray(createdRows) ? createdRows[0] : createdRows
    if (!created?.lead_id || !created?.project_id) throw new Error('Guest project was not created')

    // Persist attribution captured by the client (first/latest UTM + referrer).
    // Silently no-ops when the client sent no signal so organic leads work.
    try {
      const pickTouch = (touch: unknown) => {
        if (!touch || typeof touch !== 'object') return null
        const t = touch as Record<string, unknown>
        const str = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) || null : null
        return {
          source: str(t.source, 100),
          medium: str(t.medium, 100),
          campaign: str(t.campaign, 150),
          term: str(t.term, 150),
          content: str(t.content, 150),
          landing_path: str(t.landing_path, 300),
          referrer: str(t.referrer, 500),
          timestamp: typeof t.timestamp === 'string' ? t.timestamp : null,
        }
      }
      const first = pickTouch((payload as Record<string, unknown>).first_touch)
      const latest = pickTouch((payload as Record<string, unknown>).latest_touch)
      if (first || latest) {
        const { error: attrError } = await admin.from('project_attributions').insert({
          project_id: created.project_id,
          first_source: first?.source ?? null,
          first_medium: first?.medium ?? null,
          first_campaign: first?.campaign ?? null,
          first_term: first?.term ?? null,
          first_content: first?.content ?? null,
          first_landing_path: first?.landing_path ?? null,
          first_referrer: first?.referrer ?? null,
          first_touch_at: first?.timestamp ?? null,
          latest_source: latest?.source ?? null,
          latest_medium: latest?.medium ?? null,
          latest_campaign: latest?.campaign ?? null,
          latest_term: latest?.term ?? null,
          latest_content: latest?.content ?? null,
          latest_landing_path: latest?.landing_path ?? null,
          latest_referrer: latest?.referrer ?? null,
          latest_touch_at: latest?.timestamp ?? null,
        })
        if (attrError) console.error('Attribution insert failed', attrError)
      }
    } catch (attrErr) {
      console.error('Attribution capture failed', attrErr)
    }

    const { data: admins, error: adminLookupError } = await admin.from('profiles').select('id').eq('role', 'admin')
    if (adminLookupError) {
      console.error('Could not read admins for lead notification', adminLookupError)
    } else if (admins?.length) {
      const { error: notificationError } = await admin.from('notifications').insert(admins.map(row => ({
        user_id: row.id,
        type: 'new_guest_project',
        title: 'Nytt uppdrag väntar på granskning',
        message: `${title} · ${category}`,
        link: `/admin/uppdrag`,
      })))
      if (notificationError) console.error('Could not create admin lead notification', notificationError)
    }

    let emailSent = false
    let adminEmailSent = false
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (lovableKey && resendKey) {
      const sendEmail = (to: string, subject: string, message: string, html: string) => fetch(`${gatewayUrl}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': resendKey,
        },
        body: JSON.stringify({ from: fromEmail, to: [to], subject, text: message, html }),
      })

      const safeName = escapeHtml(fullName)
      const safeTitle = escapeHtml(title)
      const registerUrl = `${siteUrl}/registrera?email=${encodeURIComponent(email)}&project=${encodeURIComponent(created.project_id)}`
      const safeRegisterUrl = escapeHtml(registerUrl)
      const customerMessage = `Hej ${fullName}! Vi har tagit emot ditt uppdrag “${title}”. Vi granskar det nu och matchar det med relevanta byråer. Skapa ett gratis konto med samma e-postadress för att följa offerterna: ${registerUrl}`
      const customerResponse = await sendEmail(
        email,
        'Vi har tagit emot ditt uppdrag – Updro',
        customerMessage,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Uppdraget är mottaget</h1><p>Hej ${safeName}!</p><p>Vi har tagit emot ditt uppdrag <strong>${safeTitle}</strong>. Vi granskar det nu och matchar det med relevanta byråer.</p><p><a href="${safeRegisterUrl}">Skapa ett gratis konto</a> med samma e-postadress för att följa offerterna.</p><p>Vänliga hälsningar<br>Updro</p></div>`,
      )
      emailSent = customerResponse.ok
      if (!customerResponse.ok) console.error('Confirmation email failed', await customerResponse.text())

      const adminEmail = Deno.env.get('UPDRO_ADMIN_EMAIL') || 'info@auroramedia.se'
      const adminProjectUrl = `${siteUrl}/admin/uppdrag`
      const safeCompany = escapeHtml(companyName || 'Privatperson')
      const safeEmail = escapeHtml(email)
      const safePhone = escapeHtml(phone || 'Ej angivet')
      const adminResponse = await sendEmail(
        adminEmail,
        `Nytt Updro-uppdrag: ${title}`,
        `Nytt uppdrag väntar på granskning. ${title} · ${category} · ${email}. Öppna ${adminProjectUrl}`,
        `<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto"><h1>Nytt uppdrag väntar</h1><p><strong>${safeTitle}</strong></p><p>Kategori: ${escapeHtml(category)}<br>Beställare: ${safeName}<br>Företag: ${safeCompany}<br>E-post: ${safeEmail}<br>Telefon: ${safePhone}</p><p><a href="${adminProjectUrl}">Granska uppdraget i admin</a></p></div>`,
      )
      adminEmailSent = adminResponse.ok
      if (!adminResponse.ok) console.error('Admin lead email failed', await adminResponse.text())
    }

    return finish(respond({
      success: true,
      lead_id: created.lead_id,
      project_id: created.project_id,
      email_sent: emailSent,
    }, 201), undefined, { category, budget_range: budgetRange, email_sent: emailSent, admin_email_sent: adminEmailSent })
  } catch (error) {
    console.error('submit-guest-lead failed', error)
    return finish(respond({ error: 'Kunde inte skicka in uppdraget. Försök igen.' }, 500), error instanceof Error ? error.message : 'unknown_error')
  }
})
