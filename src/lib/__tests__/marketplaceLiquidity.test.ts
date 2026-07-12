import { describe, it, expect } from 'vitest'
import {
  buildKpis,
  buildProjectQueue,
  buildSupplierQueue,
  computeProfileCompletion,
  countMatchingSuppliers,
  median,
  medianHoursToFirstOffer,
  pickNextStep,
  scoreProjectRisk,
  type ProjectRow,
  type SupplierRow,
  type OfferAgg,
  type UnlockAgg,
} from '../marketplaceLiquidity'

const NOW = Date.parse('2026-07-12T20:00:00Z')

const makeProject = (over: Partial<ProjectRow> = {}): ProjectRow => ({
  id: 'p1',
  title: 'Ny webbplats',
  category: 'webb',
  status: 'active',
  created_at: new Date(NOW - 24 * 3_600_000).toISOString(),
  offer_count: 0,
  max_offers: 5,
  buyer_id: 'buyer',
  guest_lead_id: null,
  ...over,
})

const makeSupplier = (over: Partial<SupplierRow> = {}): SupplierRow => ({
  id: 's1',
  slug: 'byra',
  bio: 'x'.repeat(50),
  logo_url: 'https://x',
  categories: ['webb'],
  services: [],
  portfolio_urls: ['https://y'],
  website_url: 'https://z',
  contact_email: 'a@b.se',
  contact_phone: null,
  contact_name: null,
  org_number: '556677-1122',
  is_verified: true,
  has_fskatt: true,
  plan: 'trial',
  trial_ends_at: null,
  lead_credits: 0,
  created_at: new Date(NOW - 60 * 24 * 3_600_000).toISOString(),
  profiles: { full_name: 'X', company_name: 'Byrå AB', email: 'a@b.se', updated_at: null },
  ...over,
})

describe('helpers on zero data', () => {
  it('median returns null for empty', () => {
    expect(median([])).toBeNull()
    expect(median([2, 4, 6])).toBe(4)
    expect(median([1, 3])).toBe(2)
  })
  it('medianHoursToFirstOffer returns null when no offers', () => {
    expect(medianHoursToFirstOffer([], [])).toBeNull()
    expect(medianHoursToFirstOffer([makeProject()], [])).toBeNull()
  })
  it('buildKpis is safe with empty input', () => {
    const k = buildKpis([], [], [], [], NOW)
    expect(k.activeProjects).toBe(0)
    expect(k.offerRatePct).toBe(0)
    expect(k.medianHoursToFirstOffer).toBeNull()
    expect(Number.isNaN(k.offerRatePct)).toBe(false)
  })
  it('buildProjectQueue empty', () => {
    expect(buildProjectQueue([], [], [], [], NOW)).toEqual([])
  })
  it('buildSupplierQueue empty', () => {
    expect(buildSupplierQueue([], [], [], NOW)).toEqual([])
  })
})

describe('project risk + queue sorting', () => {
  it('pending with no matching suppliers ranks above healthy active', () => {
    const projects: ProjectRow[] = [
      makeProject({ id: 'ok', status: 'active', category: 'webb' }),
      makeProject({ id: 'bad', status: 'pending', category: 'ai',
        created_at: new Date(NOW - 96 * 3_600_000).toISOString() }),
    ]
    const suppliers: SupplierRow[] = [makeSupplier({ categories: ['webb'] })]
    const offers: OfferAgg[] = [{ supplier_id: 's1', project_id: 'ok',
      created_at: new Date(NOW - 20 * 3_600_000).toISOString() }]
    const unlocks: UnlockAgg[] = [{ supplier_id: 's1', project_id: 'ok', created_at: null }]
    const queue = buildProjectQueue(projects, unlocks, offers, suppliers, NOW)
    expect(queue.map(q => q.id)).toEqual(['bad', 'ok'])
    expect(queue[0].flags).toEqual(
      expect.arrayContaining(['pending_review', 'no_matching_suppliers', 'no_unlock', 'no_offer', 'older_than_72h']),
    )
  })
  it('scoreProjectRisk grows with severity', () => {
    const low = scoreProjectRisk({ status: 'active', ageHours: 1, unlocks: 3, offers: 2, matchingSuppliers: 5 })
    const high = scoreProjectRisk({ status: 'pending', ageHours: 120, unlocks: 0, offers: 0, matchingSuppliers: 0 })
    expect(high).toBeGreaterThan(low)
  })
  it('countMatchingSuppliers ignores inactive and other categories', () => {
    const suppliers: SupplierRow[] = [
      makeSupplier({ id: 'a', categories: ['webb'], is_verified: true, plan: 'none' }),
      makeSupplier({ id: 'b', categories: ['webb'], is_verified: false, plan: 'none' }),
      makeSupplier({ id: 'c', categories: ['ai'], is_verified: true, plan: 'none' }),
      makeSupplier({ id: 'd', categories: ['webb'], is_verified: false, plan: 'trial' }),
    ]
    expect(countMatchingSuppliers('webb', suppliers)).toBe(2)
    expect(countMatchingSuppliers(null, suppliers)).toBe(0)
  })
  it('skips closed and completed projects', () => {
    const projects = [makeProject({ id: 'closed', status: 'closed' })]
    expect(buildProjectQueue(projects, [], [], [], NOW)).toEqual([])
  })
})

describe('supplier queue', () => {
  it('completion percentage counts filled fields', () => {
    expect(computeProfileCompletion(makeSupplier())).toBe(100)
    const bare: SupplierRow = {
      ...makeSupplier(),
      bio: null, logo_url: null, categories: [], portfolio_urls: [],
      website_url: null, contact_email: null, org_number: null,
      profiles: { full_name: null, company_name: null, email: null, updated_at: null },
    }
    expect(computeProfileCompletion(bare)).toBe(0)
  })
  it('pickNextStep prioritises profile then categories then verify then unlock then offer', () => {
    expect(pickNextStep({ completionPct: 20, isVerified: true, categoryCount: 3, unlocks: 1, offers: 1, lastActivityAt: null, now: NOW })).toBe('complete_profile')
    expect(pickNextStep({ completionPct: 80, isVerified: true, categoryCount: 0, unlocks: 1, offers: 1, lastActivityAt: null, now: NOW })).toBe('choose_categories')
    expect(pickNextStep({ completionPct: 80, isVerified: false, categoryCount: 2, unlocks: 1, offers: 1, lastActivityAt: null, now: NOW })).toBe('verify')
    expect(pickNextStep({ completionPct: 80, isVerified: true, categoryCount: 2, unlocks: 0, offers: 0, lastActivityAt: null, now: NOW })).toBe('first_unlock')
    expect(pickNextStep({ completionPct: 80, isVerified: true, categoryCount: 2, unlocks: 1, offers: 0, lastActivityAt: null, now: NOW })).toBe('first_offer')
    expect(pickNextStep({ completionPct: 90, isVerified: true, categoryCount: 2, unlocks: 1, offers: 1,
      lastActivityAt: new Date(NOW - 40 * 24 * 3_600_000).toISOString(), now: NOW })).toBe('reactivate')
    expect(pickNextStep({ completionPct: 90, isVerified: true, categoryCount: 2, unlocks: 1, offers: 1,
      lastActivityAt: new Date(NOW - 3 * 24 * 3_600_000).toISOString(), now: NOW })).toBe('ready')
  })
  it('sorts by next-step priority', () => {
    const suppliers: SupplierRow[] = [
      makeSupplier({ id: 'ready', bio: 'x'.repeat(50) }),
      makeSupplier({ id: 'incomplete', bio: null, logo_url: null, categories: [], portfolio_urls: [],
        website_url: null, contact_email: null, org_number: null,
        profiles: { full_name: null, company_name: 'A', email: null, updated_at: null } }),
    ]
    const unlocks: UnlockAgg[] = [{ supplier_id: 'ready', project_id: 'p1', created_at: new Date(NOW - 3600000).toISOString() }]
    const offers: OfferAgg[] = [{ supplier_id: 'ready', project_id: 'p1', created_at: new Date(NOW - 3600000).toISOString() }]
    const q = buildSupplierQueue(suppliers, unlocks, offers, NOW)
    expect(q[0].id).toBe('incomplete')
    expect(q[0].nextStep).toBe('complete_profile')
  })
})

describe('KPIs', () => {
  it('computes offer rate and median h', () => {
    const projects: ProjectRow[] = [
      makeProject({ id: 'a', created_at: new Date(NOW - 10 * 3_600_000).toISOString() }),
      makeProject({ id: 'b', created_at: new Date(NOW - 30 * 3_600_000).toISOString() }),
    ]
    const offers: OfferAgg[] = [
      { supplier_id: 's1', project_id: 'a', created_at: new Date(NOW - 8 * 3_600_000).toISOString() },
      { supplier_id: 's1', project_id: 'b', created_at: new Date(NOW - 26 * 3_600_000).toISOString() },
    ]
    const k = buildKpis(projects, [makeSupplier()], [], offers, NOW)
    expect(k.activeProjects).toBe(2)
    expect(k.projectsWithOffer).toBe(2)
    expect(k.offerRatePct).toBe(100)
    expect(k.medianHoursToFirstOffer).toBe(3)
  })
})
