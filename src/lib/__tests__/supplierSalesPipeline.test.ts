import { describe, expect, it } from 'vitest'
import {
  buildFollowUpDedupKey,
  buildSupplierPipelineMetrics,
  getDueFollowUps,
  isSupplierFollowUpDue,
  nextFollowUpMorningIso,
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
      missingNextStep: 2,
    })
  })

  describe('getDueFollowUps', () => {
    const supplierId = '22222222-2222-4222-8222-222222222222'
    const otherSupplierId = '99999999-9999-4999-8999-999999999999'
    const now = Date.parse('2026-10-03T12:00:00Z')
    const offers = [
      { id: '11111111-1111-4111-8111-111111111111', status: 'pending', price: 12000 },
      { id: '33333333-3333-4333-8333-333333333333', status: 'accepted', price: 25000 },
      { id: '44444444-4444-4444-8444-444444444444', status: 'declined', price: 50000 },
    ]

    it('returns only due follow-ups on the supplier\'s own active offers, oldest first', () => {
      const items = getDueFollowUps([
        followUp({ offer_id: '33333333-3333-4333-8333-333333333333', follow_up_at: '2026-10-02T08:00:00Z' }),
        followUp({ offer_id: '11111111-1111-4111-8111-111111111111', follow_up_at: '2026-10-01T08:00:00Z' }),
        // Not due yet:
        followUp({ offer_id: '11111111-1111-4111-8111-111111111111', follow_up_at: '2026-10-05T08:00:00Z' }),
        // Other tenant's follow-up must never leak in:
        followUp({ offer_id: '11111111-1111-4111-8111-111111111111', supplier_id: otherSupplierId }),
        // Lost offer is not actionable:
        followUp({ offer_id: '44444444-4444-4444-8444-444444444444' }),
        // Follow-up for an offer the supplier does not own:
        followUp({ offer_id: '77777777-7777-4777-8777-777777777777' }),
        // Broken date must not crash or count as due:
        followUp({ offer_id: '11111111-1111-4111-8111-111111111111', follow_up_at: 'inte-ett-datum' }),
      ], offers, supplierId, now)

      expect(items.map(item => item.followUp.offer_id)).toEqual([
        '11111111-1111-4111-8111-111111111111',
        '33333333-3333-4333-8333-333333333333',
      ])
    })

    it('returns nothing for another tenant or a missing supplier id', () => {
      const followUps = [followUp({})]
      expect(getDueFollowUps(followUps, offers, otherSupplierId, now)).toEqual([])
      expect(getDueFollowUps(followUps, offers, '', now)).toEqual([])
    })
  })

  describe('buildFollowUpDedupKey', () => {
    it('is stable per offer and day so reminders never duplicate', () => {
      const offerId = '11111111-1111-4111-8111-111111111111'
      const morning = buildFollowUpDedupKey(offerId, '2026-10-03T06:00:00Z')
      const evening = buildFollowUpDedupKey(offerId, '2026-10-03T21:00:00Z')
      const nextDay = buildFollowUpDedupKey(offerId, '2026-10-04T06:00:00Z')
      expect(morning).toBe(evening)
      expect(morning).not.toBe(nextDay)
      expect(morning).toBe(`followup:${offerId}:2026-10-03`)
    })

    it('handles invalid dates without throwing', () => {
      expect(buildFollowUpDedupKey('abc', 'skräp')).toBe('followup:abc:unknown')
    })
  })

  describe('nextFollowUpMorningIso', () => {
    it('moves the follow-up to 08:00 local time the next day', () => {
      const result = new Date(nextFollowUpMorningIso(new Date('2026-10-03T15:30:00')))
      expect(result.getHours()).toBe(8)
      expect(result.getMinutes()).toBe(0)
      expect(result.getDate()).toBe(4)
    })
  })
})
