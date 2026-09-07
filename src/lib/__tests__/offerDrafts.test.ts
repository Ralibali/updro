import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearOfferDraft, emptyOfferForm, readOfferDraft, saveOfferDraft } from '../offerDrafts'

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })
describe('private offer drafts on this device', () => {
  it('restores only the same account and project, then clears a submitted draft', () => {
    const form = { ...emptyOfferForm(), title: 'Offert', description: 'Delvis färdigt förslag', price: '1200', payment_plan: 'hourly' }
    expect(saveOfferDraft('supplier-a', 'project-a', form)).toBe(true)
    expect(readOfferDraft('supplier-a', 'project-a')).toEqual(form)
    expect(readOfferDraft('supplier-b', 'project-a')).toBeNull()
    expect(readOfferDraft('supplier-a', 'project-b')).toBeNull()
    clearOfferDraft('supplier-a', 'project-a')
    expect(readOfferDraft('supplier-a', 'project-a')).toBeNull()
  })
  it('ignores expired and malformed saved data', () => {
    saveOfferDraft('s', 'p', emptyOfferForm())
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 15 * 86400000)
    expect(readOfferDraft('s', 'p')).toBeNull()
    localStorage.setItem('updro:offer-draft:v1:s:p', '{broken')
    expect(readOfferDraft('s', 'p')).toBeNull()
  })
  it('reports unavailable storage instead of claiming a draft was saved', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
    expect(saveOfferDraft('s', 'p', emptyOfferForm())).toBe(false)
  })
})
