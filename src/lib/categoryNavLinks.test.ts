import { describe, expect, it } from 'vitest'
import { CATEGORY_NAV_LINKS } from './categoryNavLinks'
import { getCategoryNavLinks } from './seoData'

describe('CATEGORY_NAV_LINKS', () => {
  it('matches the category pillar pages in seoData', () => {
    expect([...CATEGORY_NAV_LINKS]).toEqual(getCategoryNavLinks())
  })
})
