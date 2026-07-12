// Types + pure helpers for the Marketplace Liquidity admin panel.
// All functions are safe for zero-data inputs and never return NaN.

export type SupplierPlan = 'none' | 'trial' | 'payg' | 'standard' | 'premium' | string

export type ProjectRow = {
  id: string
  title: string | null
  category: string | null
  status: string | null
  created_at: string | null
  offer_count: number | null
  max_offers: number | null
  buyer_id: string | null
  guest_lead_id: string | null
}

export type SupplierRow = {
  id: string
  slug: string | null
  bio: string | null
  logo_url: string | null
  categories: string[] | null
  services: string[] | null
  portfolio_urls: string[] | null
  website_url: string | null
  contact_email: string | null
  contact_phone: string | null
  contact_name: string | null
  org_number: string | null
  is_verified: boolean | null
  has_fskatt: boolean | null
  plan: SupplierPlan | null
  trial_ends_at: string | null
  lead_credits: number | null
  created_at: string | null
  profiles?: {
    full_name: string | null
    company_name: string | null
    email: string | null
    updated_at: string | null
  } | null
}

export type UnlockAgg = { supplier_id: string; project_id: string; created_at: string | null }
export type OfferAgg = { supplier_id: string; project_id: string; created_at: string | null }

// ----- Project queue -----

export type ProjectFlag =
  | 'pending_review'
  | 'no_matching_suppliers'
  | 'no_unlock'
  | 'no_offer'
  | 'older_than_72h'

export type ProjectQueueRow = {
  id: string
  title: string
  category: string
  status: string
  ageHours: number
  unlocks: number
  offers: number
  maxOffers: number
  matchingSuppliers: number
  flags: ProjectFlag[]
  risk: number
}

const hoursSince = (iso: string | null, now: number): number => {
  if (!iso) return 0
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return 0
  return Math.max(0, Math.floor((now - t) / 3_600_000))
}

/** Count how many active suppliers list this category (verified or with plan). */
export const countMatchingSuppliers = (
  category: string | null,
  suppliers: SupplierRow[],
): number => {
  if (!category) return 0
  const cat = category.trim().toLowerCase()
  if (!cat) return 0
  let n = 0
  for (const s of suppliers) {
    const cats = (s.categories ?? []).map(c => (c || '').toLowerCase())
    if (!cats.includes(cat)) continue
    const active = s.is_verified === true || (s.plan && s.plan !== 'none')
    if (active) n += 1
  }
  return n
}

export const scoreProjectRisk = (row: {
  status: string
  ageHours: number
  unlocks: number
  offers: number
  matchingSuppliers: number
}): number => {
  let score = 0
  if (row.status === 'pending') score += 60
  if (row.matchingSuppliers === 0) score += 50
  if (row.offers === 0) score += 30
  if (row.unlocks === 0) score += 20
  if (row.ageHours >= 72) score += Math.min(40, Math.floor(row.ageHours / 24) * 5)
  return score
}

export const buildProjectQueue = (
  projects: ProjectRow[],
  unlocks: UnlockAgg[],
  offers: OfferAgg[],
  suppliers: SupplierRow[],
  now: number = Date.now(),
): ProjectQueueRow[] => {
  const unlocksByProject = new Map<string, number>()
  for (const u of unlocks) unlocksByProject.set(u.project_id, (unlocksByProject.get(u.project_id) ?? 0) + 1)
  const offersByProject = new Map<string, number>()
  for (const o of offers) offersByProject.set(o.project_id, (offersByProject.get(o.project_id) ?? 0) + 1)

  const rows: ProjectQueueRow[] = []
  for (const p of projects) {
    const status = (p.status ?? '').trim() || 'unknown'
    if (status !== 'pending' && status !== 'active') continue

    const ageHours = hoursSince(p.created_at, now)
    const unlocksN = unlocksByProject.get(p.id) ?? 0
    const offersN = offersByProject.get(p.id) ?? (Number(p.offer_count ?? 0) || 0)
    const matching = countMatchingSuppliers(p.category, suppliers)

    const flags: ProjectFlag[] = []
    if (status === 'pending') flags.push('pending_review')
    if (matching === 0) flags.push('no_matching_suppliers')
    if (unlocksN === 0) flags.push('no_unlock')
    if (offersN === 0) flags.push('no_offer')
    if (ageHours >= 72) flags.push('older_than_72h')

    rows.push({
      id: p.id,
      title: (p.title ?? '').trim() || 'Uppdrag utan titel',
      category: (p.category ?? '').trim() || 'Okänd',
      status,
      ageHours,
      unlocks: unlocksN,
      offers: offersN,
      maxOffers: Number(p.max_offers ?? 0) || 0,
      matchingSuppliers: matching,
      flags,
      risk: scoreProjectRisk({ status, ageHours, unlocks: unlocksN, offers: offersN, matchingSuppliers: matching }),
    })
  }

  rows.sort((a, b) => b.risk - a.risk || b.ageHours - a.ageHours || a.title.localeCompare(b.title, 'sv'))
  return rows
}

// ----- Supplier queue -----

export type SupplierNextStep =
  | 'complete_profile'
  | 'verify'
  | 'choose_categories'
  | 'first_unlock'
  | 'first_offer'
  | 'reactivate'
  | 'ready'

export type SupplierQueueRow = {
  id: string
  displayName: string
  email: string | null
  completionPct: number
  isVerified: boolean
  categoryCount: number
  hasContactEmail: boolean
  unlocks: number
  offers: number
  lastActivityAt: string | null
  plan: SupplierPlan
  trialEndsAt: string | null
  leadCredits: number
  nextStep: SupplierNextStep
  priority: number
}

const NEXT_STEP_PRIORITY: Record<SupplierNextStep, number> = {
  complete_profile: 100,
  choose_categories: 90,
  verify: 80,
  first_unlock: 70,
  first_offer: 60,
  reactivate: 50,
  ready: 0,
}

export const computeProfileCompletion = (s: SupplierRow): number => {
  const checks: boolean[] = [
    !!(s.bio && s.bio.trim().length >= 20),
    !!(s.logo_url && s.logo_url.trim().length),
    !!((s.categories ?? []).length > 0),
    !!((s.portfolio_urls ?? []).length > 0),
    !!(s.website_url && s.website_url.trim().length),
    !!(s.contact_email && s.contact_email.trim().length),
    !!(s.org_number && s.org_number.trim().length),
    !!(s.profiles?.company_name && s.profiles.company_name.trim().length),
  ]
  const done = checks.filter(Boolean).length
  return Math.round((done / checks.length) * 100)
}

export const pickNextStep = (row: {
  completionPct: number
  isVerified: boolean
  categoryCount: number
  unlocks: number
  offers: number
  lastActivityAt: string | null
  now: number
}): SupplierNextStep => {
  if (row.completionPct < 60) return 'complete_profile'
  if (row.categoryCount === 0) return 'choose_categories'
  if (!row.isVerified) return 'verify'
  if (row.unlocks === 0) return 'first_unlock'
  if (row.offers === 0) return 'first_offer'
  const last = row.lastActivityAt ? Date.parse(row.lastActivityAt) : NaN
  if (Number.isFinite(last) && row.now - last > 30 * 24 * 3_600_000) return 'reactivate'
  return 'ready'
}

const latestIso = (values: Array<string | null | undefined>): string | null => {
  let bestMs = -Infinity
  let bestIso: string | null = null
  for (const v of values) {
    if (!v) continue
    const t = Date.parse(v)
    if (Number.isFinite(t) && t > bestMs) { bestMs = t; bestIso = v }
  }
  return bestIso
}

export const buildSupplierQueue = (
  suppliers: SupplierRow[],
  unlocks: UnlockAgg[],
  offers: OfferAgg[],
  now: number = Date.now(),
): SupplierQueueRow[] => {
  const unlocksBy = new Map<string, { count: number; last: string | null }>()
  for (const u of unlocks) {
    const cur = unlocksBy.get(u.supplier_id) ?? { count: 0, last: null }
    cur.count += 1
    cur.last = latestIso([cur.last, u.created_at])
    unlocksBy.set(u.supplier_id, cur)
  }
  const offersBy = new Map<string, { count: number; last: string | null }>()
  for (const o of offers) {
    const cur = offersBy.get(o.supplier_id) ?? { count: 0, last: null }
    cur.count += 1
    cur.last = latestIso([cur.last, o.created_at])
    offersBy.set(o.supplier_id, cur)
  }

  const rows: SupplierQueueRow[] = suppliers.map(s => {
    const u = unlocksBy.get(s.id) ?? { count: 0, last: null }
    const o = offersBy.get(s.id) ?? { count: 0, last: null }
    const completion = computeProfileCompletion(s)
    const categoryCount = (s.categories ?? []).length
    const lastActivity = latestIso([u.last, o.last, s.profiles?.updated_at ?? null, s.created_at])
    const nextStep = pickNextStep({
      completionPct: completion,
      isVerified: s.is_verified === true,
      categoryCount,
      unlocks: u.count,
      offers: o.count,
      lastActivityAt: lastActivity,
      now,
    })
    const displayName = (s.profiles?.company_name || s.profiles?.full_name || s.slug || 'Byrå').trim()
    return {
      id: s.id,
      displayName,
      email: s.profiles?.email ?? null,
      completionPct: completion,
      isVerified: s.is_verified === true,
      categoryCount,
      hasContactEmail: !!(s.contact_email && s.contact_email.trim().length),
      unlocks: u.count,
      offers: o.count,
      lastActivityAt: lastActivity,
      plan: (s.plan ?? 'none') as SupplierPlan,
      trialEndsAt: s.trial_ends_at,
      leadCredits: Number(s.lead_credits ?? 0) || 0,
      nextStep,
      priority: NEXT_STEP_PRIORITY[nextStep] ?? 0,
    }
  })

  rows.sort((a, b) => b.priority - a.priority
    || a.completionPct - b.completionPct
    || a.displayName.localeCompare(b.displayName, 'sv'))
  return rows
}

// ----- KPI helpers -----

export const median = (values: number[]): number | null => {
  const clean = values.filter(v => Number.isFinite(v)).slice().sort((a, b) => a - b)
  if (clean.length === 0) return null
  const mid = Math.floor(clean.length / 2)
  return clean.length % 2 === 0 ? (clean[mid - 1] + clean[mid]) / 2 : clean[mid]
}

/** Median hours between project.created_at and its earliest offer.created_at. */
export const medianHoursToFirstOffer = (projects: ProjectRow[], offers: OfferAgg[]): number | null => {
  const first = new Map<string, number>()
  for (const o of offers) {
    if (!o.created_at) continue
    const t = Date.parse(o.created_at)
    if (!Number.isFinite(t)) continue
    const prev = first.get(o.project_id)
    if (prev === undefined || t < prev) first.set(o.project_id, t)
  }
  const gaps: number[] = []
  for (const p of projects) {
    if (!p.created_at) continue
    const start = Date.parse(p.created_at)
    const end = first.get(p.id)
    if (!Number.isFinite(start) || end === undefined) continue
    const hours = (end - start) / 3_600_000
    if (hours >= 0 && Number.isFinite(hours)) gaps.push(hours)
  }
  const m = median(gaps)
  return m === null ? null : Math.round(m * 10) / 10
}

export type LiquidityKpis = {
  activeProjects: number
  projectsWithUnlock: number
  projectsWithOffer: number
  offerRatePct: number
  activeSuppliers30d: number
  completeSupplierProfiles: number
  suppliersWithFirstUnlock: number
  suppliersWithFirstOffer: number
  medianHoursToFirstOffer: number | null
  totalSuppliers: number
  totalProjects: number
}

export const buildKpis = (
  projects: ProjectRow[],
  suppliers: SupplierRow[],
  unlocks: UnlockAgg[],
  offers: OfferAgg[],
  now: number = Date.now(),
): LiquidityKpis => {
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'pending').length
  const projectsWithUnlock = new Set(unlocks.map(u => u.project_id)).size
  const projectsWithOffer = new Set(offers.map(o => o.project_id)).size
  const offerRatePct = activeProjects > 0
    ? Math.round((projects.filter(p => (p.status === 'active' || p.status === 'pending') && new Set(offers.filter(o => o.project_id === p.id).map(o => o.project_id)).size > 0).length / activeProjects) * 1000) / 10
    : 0
  const cutoff = now - 30 * 24 * 3_600_000
  const supplierActivity = new Map<string, number>()
  for (const u of unlocks) {
    const t = u.created_at ? Date.parse(u.created_at) : NaN
    if (Number.isFinite(t)) supplierActivity.set(u.supplier_id, Math.max(supplierActivity.get(u.supplier_id) ?? 0, t))
  }
  for (const o of offers) {
    const t = o.created_at ? Date.parse(o.created_at) : NaN
    if (Number.isFinite(t)) supplierActivity.set(o.supplier_id, Math.max(supplierActivity.get(o.supplier_id) ?? 0, t))
  }
  let activeSuppliers30d = 0
  for (const t of supplierActivity.values()) if (t >= cutoff) activeSuppliers30d += 1

  const complete = suppliers.filter(s => computeProfileCompletion(s) >= 80).length
  const withFirstUnlock = new Set(unlocks.map(u => u.supplier_id)).size
  const withFirstOffer = new Set(offers.map(o => o.supplier_id)).size

  return {
    activeProjects,
    projectsWithUnlock,
    projectsWithOffer,
    offerRatePct,
    activeSuppliers30d,
    completeSupplierProfiles: complete,
    suppliersWithFirstUnlock: withFirstUnlock,
    suppliersWithFirstOffer: withFirstOffer,
    medianHoursToFirstOffer: medianHoursToFirstOffer(projects, offers),
    totalSuppliers: suppliers.length,
    totalProjects: projects.length,
  }
}

export const PROJECT_FLAG_LABELS: Record<ProjectFlag, string> = {
  pending_review: 'Väntar på godkännande',
  no_matching_suppliers: 'Inga matchande byråer',
  no_unlock: 'Ingen upplåsning',
  no_offer: 'Ingen offert',
  older_than_72h: 'Äldre än 72 h',
}

export const NEXT_STEP_LABELS: Record<SupplierNextStep, string> = {
  complete_profile: 'Komplettera profil',
  choose_categories: 'Välj kategorier',
  verify: 'Verifiera',
  first_unlock: 'Gör första upplåsning',
  first_offer: 'Lämna första offert',
  reactivate: 'Återaktivera',
  ready: 'Aktiv',
}
