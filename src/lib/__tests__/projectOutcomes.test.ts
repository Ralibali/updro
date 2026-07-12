import { describe, it, expect } from 'vitest'
import { validateOutcomeForm, isProjectOutcome, MAX_ACTUAL_VALUE_SEK } from '../projectOutcomes'

const offers = ['offer-a', 'offer-b']
const base = { outcome: null, selectedOfferId: null, actualValueSek: '', comment: '' }

describe('isProjectOutcome', () => {
  it('accepts valid values', () => {
    expect(isProjectOutcome('hired')).toBe(true)
    expect(isProjectOutcome('still_deciding')).toBe(true)
    expect(isProjectOutcome('not_proceeding')).toBe(true)
  })
  it('rejects other values', () => {
    expect(isProjectOutcome('other')).toBe(false)
    expect(isProjectOutcome(null)).toBe(false)
    expect(isProjectOutcome(1)).toBe(false)
  })
})

describe('validateOutcomeForm', () => {
  it('requires an outcome', () => {
    const r = validateOutcomeForm(base, offers)
    expect(r.ok).toBe(false)
  })

  it('requires a selected offer when hired', () => {
    const r = validateOutcomeForm({ ...base, outcome: 'hired' }, offers)
    expect(r.ok).toBe(false)
  })

  it('rejects offer not in project', () => {
    const r = validateOutcomeForm({ ...base, outcome: 'hired', selectedOfferId: 'other' }, offers)
    expect(r.ok).toBe(false)
  })

  it('accepts hired with valid offer', () => {
    const r = validateOutcomeForm({ ...base, outcome: 'hired', selectedOfferId: 'offer-a' }, offers)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.selectedOfferId).toBe('offer-a')
      expect(r.value.actualValueSek).toBeNull()
      expect(r.value.comment).toBeNull()
    }
  })

  it('drops offer for non-hired outcomes', () => {
    const r = validateOutcomeForm({ ...base, outcome: 'still_deciding', selectedOfferId: 'offer-a' }, offers)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.selectedOfferId).toBeNull()
  })

  it('parses swedish-formatted values', () => {
    const r = validateOutcomeForm(
      { outcome: 'hired', selectedOfferId: 'offer-a', actualValueSek: '75 000,50', comment: '' },
      offers,
    )
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.actualValueSek).toBe(75000.5)
  })

  it('rejects zero and negative values', () => {
    expect(validateOutcomeForm({ ...base, outcome: 'not_proceeding', actualValueSek: '-1' }, offers).ok).toBe(false)
    expect(validateOutcomeForm({ ...base, outcome: 'not_proceeding', actualValueSek: '0' }, offers).ok).toBe(false)
    const positive = validateOutcomeForm({ ...base, outcome: 'not_proceeding', actualValueSek: '1' }, offers)
    expect(positive.ok).toBe(true)
    if (positive.ok) expect(positive.value.actualValueSek).toBe(1)
  })

  it('rejects excessive values', () => {
    const r = validateOutcomeForm(
      { ...base, outcome: 'not_proceeding', actualValueSek: String(MAX_ACTUAL_VALUE_SEK + 1) },
      offers,
    )
    expect(r.ok).toBe(false)
  })

  it('trims comment and enforces max length', () => {
    const r = validateOutcomeForm({ ...base, outcome: 'still_deciding', comment: '   ' }, offers)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.comment).toBeNull()
    const long = validateOutcomeForm({ ...base, outcome: 'still_deciding', comment: 'x'.repeat(1501) }, offers)
    expect(long.ok).toBe(false)
  })
})
