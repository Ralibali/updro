import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  trackAgencySelected,
  trackAgencySignupStarted,
  trackCategorySelected,
  trackFirstOfferReceived,
  trackLeadPurchaseCompleted,
  trackLeadUnlockStarted,
  trackLeadUnlocked,
  trackLeadViewed,
  trackOnceInSession,
  trackPurchaseCompleted,
  trackUppdragDetailsCompleted,
  trackUppdragQualified,
} from '@/lib/analytics'

type PlausibleCall = [string, unknown?]

declare global {
  interface Window {
    plausible?: (...args: unknown[]) => void
  }
}

const setupPlausibleSpy = () => {
  const calls: PlausibleCall[] = []
  window.plausible = ((event: string, options?: unknown) => {
    calls.push([event, options])
  }) as unknown as Window['plausible']
  return calls
}

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  delete window.plausible
  sessionStorage.clear()
})

describe('funnel event helpers', () => {
  it('fires new funnel events with sanitized props', () => {
    const calls = setupPlausibleSpy()
    trackCategorySelected('SEO')
    trackUppdragDetailsCompleted({ category: 'SEO', budgetRange: '10k_50k' })
    trackUppdragQualified({ category: 'SEO', city: 'Malmö', budgetRange: '50k_150k' })
    trackFirstOfferReceived('SEO', 'Malmö')
    trackAgencySelected('SEO', 'Malmö')
    trackAgencySignupStarted()
    trackLeadViewed('project-key', { category: 'SEO', city: 'Malmö' })
    trackLeadUnlockStarted({ category: 'SEO', city: 'Malmö' })
    trackLeadUnlocked('SEO', 'Malmö')
    trackLeadPurchaseCompleted()

    const names = calls.map(call => call[0])
    expect(names).toEqual([
      'Category Selected',
      'Uppdrag Details Completed',
      'Uppdrag Qualified',
      'First Offer Received',
      'Agency Selected',
      'Agency Signup Started',
      'Lead Viewed',
      'Lead Unlock Started',
      'Lead Unlocked',
      'Lead Purchase Completed',
    ])
    const details = calls[1][1] as { props?: Record<string, string> }
    expect(details.props).toMatchObject({ category: 'SEO', project_value_segment: '10k_50k' })
    const purchase = calls[9][1] as { props?: Record<string, string> }
    expect(purchase.props).toMatchObject({ plan: 'lead', pricing_model: 'lead', billing_interval: 'one_time' })
  })

  it('fires Category Selected and Agency Signup Started only once per session', () => {
    const calls = setupPlausibleSpy()
    trackCategorySelected('SEO')
    trackCategorySelected('E-handel')
    trackAgencySignupStarted()
    trackAgencySignupStarted()
    expect(calls.map(call => call[0])).toEqual(['Category Selected', 'Agency Signup Started'])
  })

  it('splits lead purchases from subscription purchases', () => {
    const calls = setupPlausibleSpy()
    trackPurchaseCompleted('lead')
    trackPurchaseCompleted('monthly')
    trackPurchaseCompleted('yearly')
    expect(calls.map(call => call[0])).toEqual([
      'Lead Purchase Completed',
      'Subscription Purchased',
      'Subscription Purchased',
    ])
    const monthly = calls[1][1] as { props?: Record<string, string> }
    expect(monthly.props).toMatchObject({ plan: 'monthly', pricing_model: 'monthly' })
  })

  it('dedupes Lead Viewed per project key', () => {
    const calls = setupPlausibleSpy()
    trackLeadViewed('a', { category: 'SEO' })
    trackLeadViewed('a', { category: 'SEO' })
    trackLeadViewed('b', { category: 'SEO' })
    expect(calls.filter(call => call[0] === 'Lead Viewed')).toHaveLength(2)
  })

  it('trackOnceInSession only runs the callback once', () => {
    let count = 0
    expect(trackOnceInSession('once', () => { count += 1 })).toBe(true)
    expect(trackOnceInSession('once', () => { count += 1 })).toBe(false)
    expect(count).toBe(1)
  })
})
