import { describe, it, expect } from 'vitest'
import {
  CATEGORY_STATS_MIN_PROJECTS,
  findCategoryStats,
  formatResponseTime,
  isValidCategoryStats,
  shouldShowCategoryStats,
} from '../categoryMarketStats'

const sample = {
  category: 'Webbutveckling',
  projects: 12,
  offers: 30,
  avg_offers_per_project: 2.5,
  median_hours_to_first_offer: 18,
}

describe('isValidCategoryStats', () => {
  it('accepts a well-formed payload', () => {
    expect(isValidCategoryStats({ categories: [sample] })).toBe(true)
    expect(isValidCategoryStats({ categories: [] })).toBe(true)
  })
  it('rejects malformed payloads', () => {
    expect(isValidCategoryStats(null)).toBe(false)
    expect(isValidCategoryStats({ categories: 'x' })).toBe(false)
    expect(isValidCategoryStats({ categories: [{ category: 'X' }] })).toBe(false)
  })
})

describe('findCategoryStats', () => {
  it('finds the matching category', () => {
    expect(findCategoryStats([sample], 'Webbutveckling')).toEqual(sample)
  })
  it('returns null when the category is missing', () => {
    expect(findCategoryStats([sample], 'SEO')).toBeNull()
    expect(findCategoryStats([], 'SEO')).toBeNull()
  })
})

describe('shouldShowCategoryStats', () => {
  it('hides below the threshold', () => {
    expect(shouldShowCategoryStats({ ...sample, projects: CATEGORY_STATS_MIN_PROJECTS - 1 })).toBe(false)
  })
  it('shows at the threshold', () => {
    expect(shouldShowCategoryStats({ ...sample, projects: CATEGORY_STATS_MIN_PROJECTS })).toBe(true)
  })
  it('hides when stats are missing', () => {
    expect(shouldShowCategoryStats(null)).toBe(false)
  })
})

describe('formatResponseTime', () => {
  it('formats sub-hour as inom en timme', () => {
    expect(formatResponseTime(0)).toBe('inom en timme')
  })
  it('formats hours', () => {
    expect(formatResponseTime(18)).toBe('~18 h')
  })
  it('formats days', () => {
    expect(formatResponseTime(50)).toBe('~2 dagar')
    expect(formatResponseTime(30)).toBe('~1 dag')
  })
  it('returns null when there is no data', () => {
    expect(formatResponseTime(null)).toBeNull()
    expect(formatResponseTime(-5)).toBeNull()
  })
})
