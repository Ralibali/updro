import { describe, expect, it } from 'vitest'
import { computeActivationSteps, type ActivationInput } from '@/lib/supplierActivation'

const completeSupplier = {
  contact_name: 'Anna Byrå',
  bio: 'Vi bygger snabba webbplatser och webbshoppar för tillväxtbolag.',
  org_number: '5591234567',
  categories: ['Webbutveckling'],
  portfolio_urls: [],
  website_url: 'https://example.se',
  logo_url: null,
  contact_email: 'anna@example.se',
}

const base: ActivationInput = {
  profile: { full_name: 'Anna Byrå' },
  supplierProfile: completeSupplier,
  hasViewedProject: true,
  unlockedLeadCount: 1,
  offerCount: 1,
}

describe('computeActivationSteps', () => {
  it('handles a completely empty profile without crashing', () => {
    const state = computeActivationSteps({
      profile: null,
      supplierProfile: null,
      hasViewedProject: false,
      unlockedLeadCount: 0,
      offerCount: 0,
    })
    expect(state.steps).toHaveLength(5)
    expect(state.completedRequired).toBe(0)
    expect(state.requiredTotal).toBe(3)
    expect(state.nextStep?.id).toBe('categories')
    expect(state.allRequiredDone).toBe(false)
    expect(state.allDone).toBe(false)
  })

  it('marks a fully active supplier as done', () => {
    const state = computeActivationSteps(base)
    expect(state.steps.every(s => s.done)).toBe(true)
    expect(state.nextStep).toBeNull()
    expect(state.allRequiredDone).toBe(true)
    expect(state.allDone).toBe(true)
  })

  it('treats unlock and offer as optional so required progress can complete without purchase', () => {
    const state = computeActivationSteps({ ...base, unlockedLeadCount: 0, offerCount: 0 })
    expect(state.allRequiredDone).toBe(true)
    expect(state.allDone).toBe(false)
    expect(state.nextStep?.id).toBe('unlock_lead')
    expect(state.steps.find(s => s.id === 'unlock_lead')?.optional).toBe(true)
    expect(state.steps.find(s => s.id === 'send_offer')?.optional).toBe(true)
  })

  it('reacts when categories are removed', () => {
    const state = computeActivationSteps({
      ...base,
      supplierProfile: { ...completeSupplier, categories: [] },
    })
    expect(state.steps.find(s => s.id === 'categories')?.done).toBe(false)
    expect(state.nextStep?.id).toBe('categories')
    expect(state.completedRequired).toBe(2)
  })

  it('requires a real bio, valid email and org number for the profile step', () => {
    const shortBio = computeActivationSteps({
      ...base,
      supplierProfile: { ...completeSupplier, bio: 'För kort' },
    })
    expect(shortBio.steps.find(s => s.id === 'profile')?.done).toBe(false)

    const badEmail = computeActivationSteps({
      ...base,
      supplierProfile: { ...completeSupplier, contact_email: 'inte-en-mejl' },
    })
    expect(badEmail.steps.find(s => s.id === 'profile')?.done).toBe(false)
  })

  it('does not mark the project-view step done without a signal', () => {
    const state = computeActivationSteps({ ...base, hasViewedProject: false })
    expect(state.steps.find(s => s.id === 'view_project')?.done).toBe(false)
    expect(state.nextStep?.id).toBe('view_project')
  })

  it('falls back to profile full_name when contact_name is missing', () => {
    const state = computeActivationSteps({
      ...base,
      supplierProfile: { ...completeSupplier, contact_name: null },
    })
    expect(state.steps.find(s => s.id === 'profile')?.done).toBe(true)
  })

  it('points every step at a working dashboard URL', () => {
    const state = computeActivationSteps(base)
    for (const step of state.steps) {
      expect(step.href).toMatch(/^\/dashboard\/supplier\//)
    }
  })
})
