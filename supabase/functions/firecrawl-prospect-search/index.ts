// deno-lint-ignore-file no-explicit-any
// Admin-only Firecrawl-driven prospecting search.
// Does NOT extract emails or personal names; only public company signals.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DIRECTORY_DOMAINS = [
  'linkedin.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'youtube.com', 'tiktok.com', 'pinterest.com', 'reddit.com',
  'hitta.se', 'eniro.se', 'allabolag.se', 'ratsit.se', 'bolagsfakta.se',
  'reco.se', 'yelp.com', 'yellowpages.com',
  'google.com', 'bing.com', 'duckduckgo.com',
  'wikipedia.org', 'wikimedia.org',
  'medium.com', 'substack.com',
]

const CONTACT_HINTS = ['/kontakt', '/kontakta', '/kontakta-oss', '/contact', '/contact-us']

const NEED_TERMS: Record<string, string> = {
  webb: 'ny hemsida OR "gammal hemsida" OR "bygga om webbplatsen"',
  ehandel: '"webbshop" OR "e-handel" OR "onlinebutik"',
  ai: '"vill använda AI" OR "AI-lösning" OR "automatisera"',
  valfritt: '',
}

function normalizeDomain(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const u = new URL(withProto)
    return u.hostname.toLowerCase().replace(/^www\./, '') || null
  } catch { return null }
}

function isDirectoryDomain(domain: string | null): boolean {
  if (!domain) return true
  return DIRECTORY_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))
}

function pickContactPage(baseDomain: string, links: string[] | undefined): string | null {
  if (!links) return null
  for (const link of links) {
    const d = normalizeDomain(link)
    if (!d) continue
    if (d !== baseDomain && !d.endsWith(`.${baseDomain}`)) continue
    const lower = link.toLowerCase()
    if (CONTACT_HINTS.some((h) => lower.includes(h))) return link
  }
  return null
}

function computeFitScore(input: {
  needType: string
  industry?: string | null
  location?: string | null
  markdown?: string | null
  contactPageUrl?: string | null
}): { score: number; signals: string[] } {
  const signals: string[] = []
  let score = 30
  const md = (input.markdown || '').toLowerCase()
  if (input.contactPageUrl) { score += 15; signals.push('Publik kontaktsida hittad') }
  if (input.industry && md.includes(input.industry.toLowerCase())) {
    score += 15; signals.push(`Bransch omnämnd på sidan: ${input.industry}`)
  }
  if (input.location && md.includes(input.location.toLowerCase())) {
    score += 10; signals.push(`Ort/region omnämnd: ${input.location}`)
  }
  const yearMatch = md.match(/©\s*(19\d{2}|20\d{2})/)
  const currentYear = new Date().getUTCFullYear()
  if (yearMatch) {
    const y = Number(yearMatch[1])
    if (Number.isFinite(y) && currentYear - y >= 2) {
      score += 15; signals.push(`Gammalt copyright-år: ${y}`)
    }
  }
  if (/(under\s+ombyggnad|under\s+construction|kommer\s+snart|tillfällig\s+sida)/.test(md)) {
    score += 15; signals.push('Sidan uppges vara under ombyggnad eller tillfällig')
  }
  if (input.needType === 'ehandel' && /(webbshop|e-handel|onlinebutik|köp\s+online)/.test(md)) {
    score += 5; signals.push('Text om e-handel eller onlinebutik')
  }
  if (input.needType === 'ai' && /(ai|artificiell\s+intelligens|automatiser)/.test(md)) {
    score += 5; signals.push('Text om AI eller automatisering')
  }
  if (input.needType === 'webb' && /(gammal\s+hemsida|ny\s+hemsida|bygga\s+om\s+webbplats)/.test(md)) {
    score += 5; signals.push('Text om ny/gammal hemsida')
  }
  if (md && !/(kontakta\s+oss|boka|offert|kom\s+igång|prova\s+gratis)/.test(md)) {
    score += 5; signals.push('Ingen tydlig CTA på den skannade sidan')
  }
  return { score: Math.max(0, Math.min(100, score)), signals }
}

function buildQuery(input: {
  freeText: string; needType: string; industry?: string; location?: string
}): string {
  const parts: string[] = []
  if (input.freeText?.trim()) parts.push(input.freeText.trim())
  const need = NEED_TERMS[input.needType] ?? ''
  if (need) parts.push(`(${need})`)
  if (input.industry?.trim()) parts.push(`"${input.industry.trim()}"`)
  if (input.location?.trim()) parts.push(input.location.trim())
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

interface RequestBody {
  campaignName: string
  query: string
  location?: string
  needType: 'webb' | 'ehandel' | 'ai' | 'valfritt'
  industry?: string
  limit?: number
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY')
    if (!FIRECRAWL_API_KEY) {
      return json({ error: 'FIRECRAWL_API_KEY saknas i servermiljön.' }, 500)
    }

    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(
      authHeader.replace('Bearer ', ''),
    )
    if (claimsErr || !claimsData?.claims) return json({ error: 'Unauthorized' }, 401)
    const userId = claimsData.claims.sub as string

    // Confirm admin role server-side.
    const service = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: isAdminData, error: adminErr } = await service.rpc('is_admin', { _user_id: userId })
    if (adminErr || isAdminData !== true) return json({ error: 'Forbidden' }, 403)

    // Rate limit per admin.
    const { data: rateOk } = await service.rpc('consume_edge_rate_limit', {
      p_key: `firecrawl-prospect:${userId}`,
      p_limit: 5,
      p_window_seconds: 60,
    })
    if (rateOk === false) return json({ error: 'För många förfrågningar. Vänta en stund.' }, 429)

    const body = (await req.json().catch(() => null)) as RequestBody | null
    if (!body || typeof body.campaignName !== 'string' || typeof body.query !== 'string') {
      return json({ error: 'Ogiltig indata.' }, 400)
    }
    const needType = (['webb','ehandel','ai','valfritt'] as const).includes(body.needType as any)
      ? body.needType : 'valfritt'
    const limit = Math.max(1, Math.min(20, Math.floor(body.limit ?? 10)))
    const location = (body.location || 'Sweden').slice(0, 100)
    const industry = body.industry?.slice(0, 100) || null
    const campaignName = body.campaignName.trim().slice(0, 200)
    const query = body.query.trim().slice(0, 500)
    if (!campaignName || !query) return json({ error: 'Kampanjnamn och sökfråga krävs.' }, 400)

    // Create campaign row.
    const { data: campaign, error: campaignErr } = await service
      .from('prospecting_campaigns')
      .insert({
        admin_id: userId,
        name: campaignName,
        query,
        location,
        need_type: needType,
        industry,
        result_limit: limit,
        status: 'running',
      })
      .select('id')
      .single()
    if (campaignErr || !campaign) {
      return json({ error: `Kunde inte skapa kampanj: ${campaignErr?.message}` }, 500)
    }

    try {
      const searchResp = await fetch('https://api.firecrawl.dev/v2/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit,
          location: { country: location.toLowerCase() === 'sweden' ? 'SE' : undefined },
          scrapeOptions: { formats: ['markdown', 'links'], onlyMainContent: true },
        }),
      })
      if (!searchResp.ok) {
        const txt = await searchResp.text()
        throw new Error(`Firecrawl ${searchResp.status}: ${txt.slice(0, 300)}`)
      }
      const searchData = await searchResp.json()
      const results: any[] = Array.isArray(searchData?.data)
        ? searchData.data
        : (searchData?.web ?? searchData?.data?.web ?? [])

      const seen = new Set<string>()
      let inserted = 0
      for (const item of results) {
        const sourceUrl: string = item?.url || item?.sourceURL || item?.metadata?.sourceURL || ''
        const domain = normalizeDomain(sourceUrl)
        if (!domain || isDirectoryDomain(domain) || seen.has(domain)) continue
        seen.add(domain)

        const title: string = item?.title || item?.metadata?.title || domain
        const description: string = item?.description || item?.metadata?.description || ''
        const markdown: string = item?.markdown || ''
        const links: string[] = Array.isArray(item?.links) ? item.links : []

        const contactPageUrl = pickContactPage(domain, links)
        const { score, signals } = computeFitScore({
          needType, industry, location, markdown, contactPageUrl,
        })

        const { error: insErr } = await service
          .from('prospecting_leads')
          .insert({
            campaign_id: campaign.id,
            company_name: title.slice(0, 200),
            domain,
            website_url: `https://${domain}`,
            source_url: sourceUrl,
            city: null,
            industry,
            description: description ? description.slice(0, 500) : null,
            fit_score: score,
            observed_signals: signals,
            contact_page_url: contactPageUrl,
          })
        if (!insErr) inserted++
      }

      await service.from('prospecting_campaigns')
        .update({ status: 'completed' }).eq('id', campaign.id)

      return json({ campaign_id: campaign.id, inserted, total: results.length }, 200)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      await service.from('prospecting_campaigns')
        .update({ status: 'failed', error_message: message.slice(0, 500) })
        .eq('id', campaign.id)
      return json({ error: message }, 500)
    }
  } catch (e) {
    console.error('firecrawl-prospect-search error', e)
    return json({ error: e instanceof Error ? e.message : 'Unknown error' }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
