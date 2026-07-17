/**
 * Samarbetsavtal – domänlogik för det digitala avtal som skapas när en
 * beställare accepterat en offert. Lagras i public.project_agreements.content
 * (jsonb). Updro är inte part i avtalet – det är en dokumenterad
 * överenskommelse mellan beställare och byrå.
 */

export const AGREEMENT_VERSION = 1

export interface AgreementContent {
  version: number
  /** Kort beskrivning av omfattningen, förifylld från uppdrag + offert. */
  scope: string
  /** Köparens egna tillägg, t.ex. återkommande avstämningsmöten. */
  special_terms: string
  price_sek: number
  payment_plan: 'fixed' | 'hourly' | 'milestone' | null
  delivery_weeks: number | null
  buyer_name: string
  supplier_name: string
  project_title: string
  offer_title: string
  created_at: string
  buyer_confirmed_at: string | null
  supplier_confirmed_at: string | null
}

export type AgreementStatus = 'draft' | 'awaiting_supplier' | 'signed'

export const PAYMENT_PLAN_LABELS: Record<string, string> = {
  fixed: 'Fast pris',
  hourly: 'Löpande debitering',
  milestone: 'Betalning per milstolpe',
}

export const agreementStatus = (content: AgreementContent): AgreementStatus => {
  if (content.supplier_confirmed_at) return 'signed'
  if (content.buyer_confirmed_at) return 'awaiting_supplier'
  return 'draft'
}

export const AGREEMENT_STATUS_LABELS: Record<AgreementStatus, string> = {
  draft: 'Utkast',
  awaiting_supplier: 'Väntar på byråns bekräftelse',
  signed: 'Bekräftat av båda parter',
}

interface AgreementProjectInput {
  title: string
  description?: string | null
}

interface AgreementOfferInput {
  title: string
  description?: string | null
  price: number | string
  payment_plan?: string | null
  delivery_weeks?: number | null
}

/** Standardvillkor som alltid följer med avtalet, utöver scope/special_terms. */
export const STANDARD_CLAUSES = [
  'Priset avser det angivna omfånget. Ändringar eller tillägg avtalas skriftligen mellan parterna innan arbetet påbörjas.',
  'Moms tillkommer om inte annat anges.',
  'Parterna kommunicerar via Updros meddelandefunktion eller direkt via de kontaktuppgifter som delats.',
  'Eventuella tvister löses i första hand direkt mellan parterna. Updro är inte part i detta avtal och ansvarar inte för leveransen.',
]

export const buildDefaultAgreementContent = (
  project: AgreementProjectInput,
  offer: AgreementOfferInput,
  buyerName: string,
  supplierName: string,
  now = new Date(),
): AgreementContent => ({
  version: AGREEMENT_VERSION,
  scope: defaultScope(project, offer),
  special_terms: '',
  price_sek: Number(offer.price) || 0,
  payment_plan: (offer.payment_plan as AgreementContent['payment_plan']) || null,
  delivery_weeks: offer.delivery_weeks ?? null,
  buyer_name: buyerName,
  supplier_name: supplierName,
  project_title: project.title,
  offer_title: offer.title,
  created_at: now.toISOString(),
  buyer_confirmed_at: null,
  supplier_confirmed_at: null,
})

const defaultScope = (project: AgreementProjectInput, offer: AgreementOfferInput) => {
  const offerSummary = (offer.description || '').trim().replace(/\s+/g, ' ')
  const trimmed = offerSummary.length > 300 ? `${offerSummary.slice(0, 297)}…` : offerSummary
  return trimmed
    ? `${offer.title} – ${trimmed}`
    : `${offer.title} (enligt offert för uppdraget "${project.title}")`
}

/**
 * Köparen skickar avtalet till byrån. Returnerar nytt innehåll – sparas
 * som en update på hela content-fältet.
 */
export const markBuyerConfirmed = (content: AgreementContent, now = new Date()): AgreementContent => ({
  ...content,
  buyer_confirmed_at: now.toISOString(),
})

/** Byrån bekräftar. Kräver att köparen redan skickat avtalet. */
export const markSupplierConfirmed = (content: AgreementContent, now = new Date()): AgreementContent => {
  if (!content.buyer_confirmed_at) return content
  return { ...content, supplier_confirmed_at: now.toISOString() }
}

/**
 * Ändringar i scope/special_terms ogiltigförklarar tidigare bekräftelser,
 * så att båda parter alltid bekräftat exakt samma text.
 */
export const applyEdits = (
  content: AgreementContent,
  edits: { scope: string; special_terms: string },
): AgreementContent => {
  const changed =
    edits.scope !== content.scope || edits.special_terms !== content.special_terms
  if (!changed) return content
  return {
    ...content,
    scope: edits.scope,
    special_terms: edits.special_terms,
    buyer_confirmed_at: null,
    supplier_confirmed_at: null,
  }
}

/** Typvakter för jsonb-innehåll som kan komma från äldre versioner. */
export const parseAgreementContent = (raw: unknown): AgreementContent | null => {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Partial<AgreementContent>
  if (typeof c.scope !== 'string' || typeof c.price_sek !== 'number') return null
  return {
    version: typeof c.version === 'number' ? c.version : 1,
    scope: c.scope,
    special_terms: typeof c.special_terms === 'string' ? c.special_terms : '',
    price_sek: c.price_sek,
    payment_plan: c.payment_plan ?? null,
    delivery_weeks: typeof c.delivery_weeks === 'number' ? c.delivery_weeks : null,
    buyer_name: typeof c.buyer_name === 'string' ? c.buyer_name : '',
    supplier_name: typeof c.supplier_name === 'string' ? c.supplier_name : '',
    project_title: typeof c.project_title === 'string' ? c.project_title : '',
    offer_title: typeof c.offer_title === 'string' ? c.offer_title : '',
    created_at: typeof c.created_at === 'string' ? c.created_at : new Date().toISOString(),
    buyer_confirmed_at: c.buyer_confirmed_at ?? null,
    supplier_confirmed_at: c.supplier_confirmed_at ?? null,
  }
}
