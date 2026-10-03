import { describe, expect, it } from 'vitest'
import {
  buildSupplierPipelineMetrics,
  isSupplierFollowUpDue,
  type SupplierOfferFollowUp,
} from '../supplierSalesPipeline'

const followUp = (overrides: Partial<SupplierOfferFollowUp> = {}): SupplierOfferFollowUp => ({
  offer_id: '11111111-1111-4111-8111-111111111111',
  supplier_id: '22222222-2222-4222-8222-222222222222',
  next_action: 'Ring kunden',
  follow_up_at: '2026-10-03T10:00:00Z',
  private_note: null,
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
  ...overrides,
})

describe('supplier sales pipeline', () => {
  it('detects due follow-ups without treating invalid dates as due', () => {
    const now = Date.parse('2026-10-03T12:00:00Z')
    expect(isSupplierFollowUpDue('2026-10-03T11:59:00Z', now)).toBe(true)
    expect(isSupplierFollowUpDue('2026-10-03T12:01:00Z', now)).toBe(false)
    expect(isSupplierFollowUpDue('invalid', now)).toBe(false)
    expect(isSupplierFollowUpDue(null, now)).toBe(false)
  })

  it('summarizes pending, won and follow-up work', () => {
    const firstId = '11111111-1111-4111-8111-111111111111'
    const secondId = '33333333-3333-4333-8333-333333333333'
    const thirdId = '44444444-4444-4444-8444-444444444444'
    const now = Date.parse('2026-10-03T12:00:00Z')

    const metrics = buildSupplierPipelineMetrics([
      { id: firstId, status: 'pending', price: 12000, payment_plan: 'fixed' },
      { id: secondId, status: 'accepted', price: 25000, payment_plan: 'fixed' },
      { id: thirdId, status: 'pending', price: 8000, payment_plan: 'fixed' },
      { id: '55555555-5555-4555-8555-555555555555', status: 'declined', price: 50000, payment_plan: 'fixed' },
      { id: '66666666-6666-4666-8666-666666666666', status: 'pending', price: 1500, payment_plan: 'hourly' },
    ], {
      [firstId]: followUp({ offer_id: firstId }),
      [secondId]: followUp({ offer_id: secondId, follow_up_at: '2026-10-04T10:00:00Z' }),
    }, now)

    expect(metrics).toEqual({
      pendingValueSek: 20000,
      wonValueSek: 25000,
      dueFollowUps: 1,
      missingNextStep: 1,
    })
  })
})
