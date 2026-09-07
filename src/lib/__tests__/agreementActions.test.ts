import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildDefaultAgreementContent, STANDARD_CLAUSES } from '../agreements'
import { getProjectAgreement, updateProjectAgreement } from '../agreementActions'

const rpc = vi.hoisted(() => vi.fn())
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc } }))
const id = 'd70a0000-0000-4000-8000-000000000010'
const content = { ...buildDefaultAgreementContent({ title: 'Test' }, {
  title: 'Testoffert', description: 'Testbeskrivning komplett', price: 1000, payment_plan: 'fixed', delivery_weeks: 4,
}, 'Kund AB', 'Byrå AB', new Date('2026-09-07T12:00:00Z')), standard_clauses: STANDARD_CLAUSES }
beforeEach(() => rpc.mockReset())

describe('agreement API boundary', () => {
  it('rejects empty or inconsistent success responses', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: null })
    await expect(updateProjectAgreement(id, 'create')).rejects.toThrow('kunde inte läsas')
    rpc.mockResolvedValueOnce({ data: { id, revision: 1, content: { ...content, supplier_confirmed_at: '2026-09-07T13:00:00Z' } }, error: null })
    await expect(updateProjectAgreement(id, 'confirm', 1)).rejects.toThrow('kunde inte läsas')
  })
  it('preserves the complete server snapshot and its revision', async () => {
    const row = { id, revision: 4, content: { ...content, created_at: '2026-09-07T12:00:00.123456+00:00' } }
    rpc.mockResolvedValueOnce({ data: row, error: null })
    expect(await updateProjectAgreement(id, 'edit', 3, { scope: 'Full scope', special_terms: 'Terms' })).toEqual(row)
    expect(rpc).toHaveBeenCalledWith('update_project_agreement', { p_offer_id: id, p_action: 'edit', p_expected_revision: 3, p_scope: 'Full scope', p_special_terms: 'Terms' })
  })
  it('distinguishes a missing agreement from a missing API result', async () => {
    rpc.mockResolvedValueOnce({ data: {}, error: null })
    await expect(getProjectAgreement(id, id)).rejects.toThrow('kunde inte läsas')
    rpc.mockResolvedValueOnce({ data: { context: { buyerName: 'Kund', supplierName: 'Byrå', projectTitle: 'Test', buyerId: id, supplierId: id }, agreement: null }, error: null })
    expect((await getProjectAgreement(id, id)).agreement).toBeNull()
  })
})
