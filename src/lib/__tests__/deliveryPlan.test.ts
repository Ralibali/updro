import { describe, expect, it } from 'vitest'
import {
  deliveryPlanText,
  emptyDeliveryPlan,
  parseDeliveryPlan,
} from '../deliveryPlan'
import { applyEdits, parseAgreementContent } from '../agreements'
describe('delivery agreement', () => {
  it('does not invent deliverables, rounds or dates for existing agreements', () => {
    expect(
      parseAgreementContent({ scope: 'Original', price_sek: 500 })
        ?.delivery_plan
    ).toEqual(emptyDeliveryPlan())
  })
  it('preserves explicit zero included rounds', () => {
    const plan = { ...emptyDeliveryPlan(), revision_rounds: 0 }
    expect(parseDeliveryPlan(plan)).toEqual(plan)
    expect(deliveryPlanText(plan)).toContain('Korrekturrundor: 0')
  })
  it('rejects invalid dates and oversized or malformed plans', () => {
    for (const change of [
      { due_date: '2026-02-30' },
      { due_date: 'tomorrow' },
      { revision_rounds: -1 },
      { revision_rounds: 1.5 },
      { deliverables: [42] },
      { deliverables: ['a'.repeat(201)] },
      { deliverables: Array(21).fill('Film') },
    ])
      expect(
        parseDeliveryPlan({ ...emptyDeliveryPlan(), ...change })
      ).toBeNull()
  })
  it('requires renewed confirmation when only the delivery plan changes', () => {
    const content = parseAgreementContent({
      scope: 'Film',
      price_sek: 500,
      buyer_confirmed_at: '2026-09-01',
      supplier_confirmed_at: null,
    })!
    const updated = applyEdits(content, {
      scope: content.scope,
      special_terms: '',
      delivery_plan: {
        ...emptyDeliveryPlan(),
        deliverables: ['Tre filmer'],
        revision_rounds: 2,
      },
    })
    expect(updated.buyer_confirmed_at).toBeNull()
    expect(updated.supplier_confirmed_at).toBeNull()
    expect(parseAgreementContent(updated)?.delivery_plan?.deliverables).toEqual(
      ['Tre filmer']
    )
    expect(content.buyer_confirmed_at).not.toBeNull()
  })
})
