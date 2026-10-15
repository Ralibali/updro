import { describe, expect, it } from 'vitest'
import { budgetFit, comparableOffers, offerHighlights, type ComparableOffer } from './offerComparison'

const offer = (id: string, overrides: Partial<ComparableOffer> = {}): ComparableOffer => ({
  id, price: 50_000, delivery_weeks: 6, payment_plan: 'fixed', status: 'pending', created_at: '2026-10-01T10:00:00Z',
  supplier_profiles: { avg_rating: 0, review_count: 0 }, ...overrides,
})

describe('budgetFit', () => {
  it('places a total price relative to the buyer budget', () => {
    expect(budgetFit(offer('a', { price: 8_000 }), '10k_50k')).toBe('under')
    expect(budgetFit(offer('a', { price: 45_000 }), '10k_50k')).toBe('within')
    expect(budgetFit(offer('a', { price: 60_000 }), '10k_50k')).toBe('over')
    expect(budgetFit(offer('a', { price: 900_000 }), 'over_150k')).toBe('within')
  })

  it('does not judge hourly rates or unknown budgets', () => {
    expect(budgetFit(offer('a', { payment_plan: 'hourly', price: 1_200 }), '10k_50k')).toBeNull()
    expect(budgetFit(offer('a'), 'unknown')).toBeNull()
    expect(budgetFit(offer('a'), null)).toBeNull()
  })
})

describe('comparableOffers', () => {
  it('keeps open offers in arrival order', () => {
    const result = comparableOffers([
      offer('late', { created_at: '2026-10-03T10:00:00Z' }),
      offer('declined', { status: 'declined' }),
      offer('early', { created_at: '2026-10-01T10:00:00Z' }),
    ])
    expect(result.map(o => o.id)).toEqual(['early', 'late'])
  })
})

describe('offerHighlights', () => {
  it('marks a single cheapest, fastest and best rated offer', () => {
    const highlights = offerHighlights([
      offer('a', { price: 40_000, delivery_weeks: 8, supplier_profiles: { avg_rating: 4.9, review_count: 12 } }),
      offer('b', { price: 55_000, delivery_weeks: 4, supplier_profiles: { avg_rating: 4.2, review_count: 3 } }),
    ])
    expect(highlights.get('a')).toEqual(['lowest_price', 'top_rated'])
    expect(highlights.get('b')).toEqual(['fastest'])
  })

  it('never ranks an hourly rate as the lowest price', () => {
    const highlights = offerHighlights([
      offer('hourly', { payment_plan: 'hourly', price: 950 }),
      offer('fixed', { price: 30_000 }),
      offer('fixed2', { price: 45_000 }),
    ])
    expect(highlights.get('hourly')).toBeUndefined()
    expect(highlights.get('fixed')).toContain('lowest_price')
  })

  it('skips ties and agencies without reviews', () => {
    const highlights = offerHighlights([
      offer('a', { price: 40_000, delivery_weeks: 6 }),
      offer('b', { price: 40_000, delivery_weeks: 6 }),
    ])
    expect(highlights.size).toBe(0)
  })
})
