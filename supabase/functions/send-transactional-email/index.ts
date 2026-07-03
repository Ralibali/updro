const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend'
const FROM_EMAIL = 'Updro <info@auroramedia.se>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Require authentication: valid Supabase JWT or the service-role key (internal callers).
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
  let authorized = false
  if (token && SERVICE_ROLE && token === SERVICE_ROLE) {
    authorized = true
  } else if (token && SUPABASE_URL && SERVICE_ROLE) {
    try {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
      const { data, error } = await admin.auth.getUser(token)
      if (!error && data?.user) authorized = true
    } catch (_) {
      authorized = false
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }


  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured')

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured')

    const { to, subject, html, text, replyTo } = await req.json()

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and html or text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: Record<string, unknown> = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
    }
    if (html) body.html = html
    if (text) body.text = text
    if (replyTo) body.reply_to = replyTo

    const response = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend API error', { status: response.status, data })
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-transactional-email error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
