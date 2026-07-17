import { describe, it, expect } from 'vitest'
import {
  agreementStatus,
  applyEdits,
  buildDefaultAgreementContent,
  markBuyerConfirmed,
  markSupplierConfirmed,
  parseAgreementContent,
} from '../agreements'

const project = { title: 'Ny webbplats för Bygg AB', description: 'Vi behöver en ny sajt.' }
const offer = {
  title: 'Komplett webbpaket',
  description: 'Design, utveckling och lansering av ny webbplats.',
  price: 65000,
  payment_plan: 'fixed',
  delivery_weeks: 6,
}

const NOW = new Date('2026-07-17T12:00:00Z')
const LATER = new Date('2026-07-17T14:30:00Z')

const draft = () => buildDefaultAgreementContent(project, offer, 'Bygg AB', 'Webbbyrån AB', NOW)

describe('buildDefaultAgreementContent', () => {
  it('prefills parties, price and scope from project and offer', () => {
    const c = draft()
    expect(c.buyer_name).toBe('Bygg AB')
    expect(c.supplier_name).toBe('Webbbyrån AB')
    expect(c.price_sek).toBe(65000)
    expect(c.payment_plan).toBe('fixed')
    expect(c.delivery_weeks).toBe(6)
    expect(c.scope).toContain('Komplett webbpaket')
    expect(c.buyer_confirmed_at).toBeNull()
    expect(c.supplier_confirmed_at).toBeNull()
  })

  it('falls back to a scope referencing the project when offer has no description', () => {
    const c = buildDefaultAgreementContent(project, { ...offer, description: '' }, 'Köparen', 'Byrån', NOW)
    expect(c.scope).toContain(project.title)
  })

  it('truncates very long offer descriptions', () => {
    const long = 'a'.repeat(500)
    const c = buildDefaultAgreementContent(project, { ...offer, description: long }, 'K', 'B', NOW)
    expect(c.scope.length).toBeLessThanOrEqual(330)
    expect(c.scope.endsWith('…')).toBe(true)
  })
})

describe('agreementStatus', () => {
  it('starts as draft', () => {
    expect(agreementStatus(draft())).toBe('draft')
  })
  it('becomes awaiting_supplier after buyer sends', () => {
    expect(agreementStatus(markBuyerConfirmed(draft(), NOW))).toBe('awaiting_supplier')
  })
  it('becomes signed only when both confirmed', () => {
    const sent = markBuyerConfirmed(draft(), NOW)
    expect(agreementStatus(markSupplierConfirmed(sent, LATER))).toBe('signed')
  })
})

describe('markSupplierConfirmed', () => {
  it('does nothing before the buyer has sent the agreement', () => {
    const c = draft()
    expect(markSupplierConfirmed(c, LATER)).toBe(c)
    expect(agreementStatus(markSupplierConfirmed(c, LATER))).toBe('draft')
  })
})

describe('applyEdits', () => {
  it('invalidates both confirmations when content changes', () => {
    const signed = markSupplierConfirmed(markBuyerConfirmed(draft(), NOW), LATER)
    const edited = applyEdits(signed, { scope: 'Ny omfattning', special_terms: signed.special_terms })
    expect(edited.scope).toBe('Ny omfattning')
    expect(edited.buyer_confirmed_at).toBeNull()
    expect(edited.supplier_confirmed_at).toBeNull()
    expect(agreementStatus(edited)).toBe('draft')
  })

  it('keeps confirmations untouched when nothing changed', () => {
    const signed = markSupplierConfirmed(markBuyerConfirmed(draft(), NOW), LATER)
    const same = applyEdits(signed, { scope: signed.scope, special_terms: signed.special_terms })
    expect(same).toBe(signed)
  })
})

describe('parseAgreementContent', () => {
  it('round-trips built content', () => {
    const c = draft()
    expect(parseAgreementContent(JSON.parse(JSON.stringify(c)))).toEqual(c)
  })
  it('returns null for malformed payloads', () => {
    expect(parseAgreementContent(null)).toBeNull()
    expect(parseAgreementContent('text')).toBeNull()
    expect(parseAgreementContent({ price_sek: 100 })).toBeNull()
  })
  it('fills defaults for missing optional fields', () => {
    const parsed = parseAgreementContent({ scope: 'X', price_sek: 100 })
    expect(parsed?.special_terms).toBe('')
    expect(parsed?.buyer_confirmed_at).toBeNull()
  })
})
