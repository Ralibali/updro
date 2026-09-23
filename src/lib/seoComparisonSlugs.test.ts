import { describe, expect, it } from 'vitest'
import { COMPARISON_PAGES } from './seoComparisons'
import { COMPARISON_SLUGS } from './seoComparisonSlugs'

describe('COMPARISON_SLUGS', () => {
  it('matches the comparison pages exactly, so every page gets a route', () => {
    expect([...COMPARISON_SLUGS]).toEqual(COMPARISON_PAGES.map(page => page.slug))
  })
})
