export type CompanyIntelligence = {
  version: 1
  summary: string
  technology_signals: string[]
  commercial_signals: string[]
  growth_signals: string[]
  risk_signals: string[]
  evidence: string[]
  confidence: number
}

type IntelligenceInput = {
  markdown?: string | null
  links?: string[] | null
  observedSignals?: string[] | null
  contactPageUrl?: string | null
  industry?: string | null
  location?: string | null
}

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)))

function includesAny(haystack: string, needles: RegExp[]): boolean {
  return needles.some((needle) => needle.test(haystack))
}

export function buildCompanyIntelligence(input: IntelligenceInput): CompanyIntelligence {
  const markdown = (input.markdown ?? '').toLowerCase()
  const links = (input.links ?? []).join(' ').toLowerCase()
  const source = `${markdown}\n${links}`

  const technologySignals: string[] = []
  const commercialSignals: string[] = []
  const growthSignals: string[] = []
  const riskSignals: string[] = []

  const technologyMatchers: Array<[string, RegExp[]]> = [
    ['Shopify', [/shopify/i, /cdn\.shopify\.com/i]],
    ['WooCommerce', [/woocommerce/i, /\/product-category\//i]],
    ['WordPress', [/wordpress/i, /wp-content/i, /wp-includes/i]],
    ['Wix', [/wixstatic/i, /wixsite/i]],
    ['Webflow', [/webflow/i]],
    ['Squarespace', [/squarespace/i]],
  ]
  for (const [label, patterns] of technologyMatchers) {
    if (includesAny(source, patterns)) technologySignals.push(label)
  }

  if (includesAny(markdown, [/webbshop/i, /e-handel/i, /ecommerce/i, /köp\s+online/i, /lägg\s+i\s+varukorg/i])) {
    commercialSignals.push('E-handel eller direktköp')
  }
  if (includesAny(markdown, [/boka\s+(tid|möte|demo|konsultation)/i, /booking/i, /appointment/i])) {
    commercialSignals.push('Digital bokning')
  }
  if (includesAny(markdown, [/begär\s+offert/i, /be\s+om\s+offert/i, /request\s+(a\s+)?quote/i, /kostnadsfri\s+offert/i])) {
    commercialSignals.push('Offert-/leadflöde')
  }
  if (includesAny(markdown, [/nyhetsbrev/i, /newsletter/i])) {
    commercialSignals.push('Nyhetsbrev/CRM-insamling')
  }
  if (input.contactPageUrl) commercialSignals.push('Publik kontaktsida')

  if (includesAny(markdown, [/lediga\s+jobb/i, /karriär/i, /career/i, /we['’]?re\s+hiring/i, /vi\s+söker\s+(nu|dig|fler)/i])) {
    growthSignals.push('Rekryteringssignal')
  }
  if (includesAny(markdown, [/ny\s+(butik|lokal|anläggning|etablering|kontor)/i, /öppnar\s+i/i, /expanderar/i, /expansion/i])) {
    growthSignals.push('Expansions-/etableringssignal')
  }
  if (includesAny(markdown, [/flera\s+(orter|kontor|butiker|anläggningar)/i, /våra\s+(kontor|butiker|anläggningar)/i])) {
    growthSignals.push('Flera verksamhetsställen')
  }

  for (const signal of input.observedSignals ?? []) {
    if (/gammalt copyright/i.test(signal)) riskSignals.push(signal)
    else if (/under ombyggnad|tillfällig/i.test(signal)) riskSignals.push(signal)
    else if (/ingen tydlig cta/i.test(signal)) riskSignals.push(signal)
  }

  const evidence = unique([
    ...(input.observedSignals ?? []),
    ...technologySignals.map((value) => `Tekniksignal: ${value}`),
    ...commercialSignals.map((value) => `Kommersiell signal: ${value}`),
    ...growthSignals.map((value) => `Tillväxtsignal: ${value}`),
  ]).slice(0, 20)

  const contextSignals = [input.industry, input.location].filter(Boolean).length
  const confidence = Math.min(95, Math.max(10, 20 + evidence.length * 8 + contextSignals * 5))

  const summaryParts: string[] = []
  if (commercialSignals.length) summaryParts.push(commercialSignals.slice(0, 2).join(', '))
  if (growthSignals.length) summaryParts.push(growthSignals.slice(0, 1).join(', '))
  if (riskSignals.length) summaryParts.push(`möjlighet: ${riskSignals.slice(0, 1).join(', ').toLowerCase()}`)
  const summary = summaryParts.length
    ? summaryParts.join(' · ')
    : 'Begränsad publik signalbild – kräver manuell granskning före outreach.'

  return {
    version: 1,
    summary,
    technology_signals: unique(technologySignals),
    commercial_signals: unique(commercialSignals),
    growth_signals: unique(growthSignals),
    risk_signals: unique(riskSignals),
    evidence,
    confidence,
  }
}
