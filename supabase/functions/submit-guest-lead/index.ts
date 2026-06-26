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

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (request.method !== 'POST') return respond({ error: 'Metoden stöds inte.' }, 405)

  try {
    const payload = await request.json()
    if (text(payload.website, 200)) return respond({ success: true })

    const email = text(payload.email, 254).toLowerCase()
    const fullName = text(payload.full_name, 120)
    const companyName = text(payload.company_name, 160)
    const phone = text(payload.phone, 40)
    const title = text(payload.title, 100)
    const description = text(payload.description, 5000)
    const category = text(payload.category, 80)
    const budgetRange = text(payload.budget_range, 40)
    const startTime = text(payload.start_time, 40)

    if (!validEmail(email)) return respond({ error: 'Ange en giltig e-postadress.' }, 400)
    if (fullName.length < 2) return respond({ error: 'Ange ditt namn.' }, 400)
    if (title.length < 3 || description.length < 20) return respond({ error: 'Beskriv uppdraget tydligare.' }, 400)
    if (!allowedCategories.has(category) || !allowedBudgets.has(budgetRange) || !allowedStarts.has(startTime)) {
      return respond({ error: 'Kontrollera kategori, budget och önskad start.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) return respond({ error: 'Servern är inte korrekt konfigurerad.' }, 500)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const recent = await admin.from('guest_leads').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', tenMinutesAgo)
    if ((recent.count || 0) > 0) return respond({ error: 'Ett uppdrag har nyligen skickats från denna e-postadress. Vänta en stund.' }, 429)

    const daily = await admin.from('guest_leads').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', oneDayAgo)
    if ((daily.count || 0) >= 3) return respond({ error: 'För många uppdrag har skickats från denna e-postadress idag.' }, 429)

    const inserted = await admin.from('guest_leads').insert({
      email, full_name: fullName, company_name: companyName || null, phone: phone || null,
      title, description, category, budget_range: budgetRange, start_time: startTime,
      is_company: Boolean(payload.is_company), source: 'publicera',
    }).select('id').single()
    if (inserted.error) throw inserted.error

    let emailSent = false
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (lovableKey && resendKey) {
      const safeName = escapeHtml(fullName)
      const safeTitle = escapeHtml(title)
      const message = `Hej ${fullName}! Vi har tagit emot ditt uppdrag “${title}”. Vi matchar det nu med relevanta byråer. Du kan skapa ett gratis konto med samma e-postadress för att följa offerterna.`
      const response = await fetch(`${gatewayUrl}/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': resendKey,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: 'Vi har tagit emot ditt uppdrag – Updro',
          text: message,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h1>Uppdraget är mottaget</h1><p>Hej ${safeName}!</p><p>Vi har tagit emot ditt uppdrag <strong>${safeTitle}</strong> och matchar det nu med relevanta byråer.</p><p>Skapa gärna ett gratis konto med samma e-postadress på updro.se för att följa offerterna.</p><p>Vänliga hälsningar<br>Updro</p></div>`,
        }),
      })
      emailSent = response.ok
      if (!response.ok) console.error('Confirmation email failed', await response.text())
    }

    return respond({ success: true, lead_id: inserted.data.id, email_sent: emailSent }, 201)
  } catch (error) {
    console.error('submit-guest-lead failed', error)
    return respond({ error: 'Kunde inte skicka in uppdraget. Försök igen.' }, 500)
  }
})
