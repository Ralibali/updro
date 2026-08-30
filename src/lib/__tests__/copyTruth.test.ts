import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ARTICLES } from '@/lib/seoArticles'
import { COMPARISON_PAGES } from '@/lib/seoComparisons'
import { MAX_OFFERS_PER_PROJECT, STRIPE_PRODUCTS } from '@/lib/constants'

/**
 * Copy-truth guard rails.
 *
 * Background: marketplace-stats showed 0 projects / 0 offers when these claims
 * were live. Updro's real model is 119 kr/lead or 1 995 kr/month, max three
 * agencies per project and 0 % commission. Marketing copy must not claim a
 * proprietary offer dataset, verified reviews, per-close pricing, more than
 * three offers, guaranteed 24h responses or unsourced savings percentages.
 */

// Claims that must never describe Updro's own platform/data
const BANNED_PLATFORM_CLAIMS = [
  /tusentals offerter via Updro/i,
  /faktiska offerter vi sett via Updro/i,
  /offerter vi sett via Updro/i,
  /verifierade omdömen/i,
  /omdömen från verifierade kunder/i,
  /betalar per avslut/i,
  /leveranshistorik/i,
  /förbinder sig[^.]*inom 24 timmar/i,
  /spara(r)? i snitt \d+/i,
  /spara upp till \d+/i,
  /upp till fem skräddarsydda offerter/i,
  /minst (3|tre) offerter (från|via|hos) Updro/i,
  /jämför(a)? minst (3|tre) offerter via Updro/i,
]

// Source files whose rendered copy previously contained the banned claims
const COPY_FILES = [
  'src/components/seo/SEOLeadCTA.tsx',
  'src/components/seo/ArticlePage.tsx',
  'src/pages/seo/SwivrrAlternativPage.tsx',
  'src/pages/seo/AgencyCityPage.tsx',
  'src/pages/seo/AgencyCityCategoryPage.tsx',
  'src/pages/RegisterSupplierPage.tsx',
  'src/lib/seoArticles.ts',
  'src/lib/seoComparisons.ts',
  'src/lib/seoData.ts',
  'src/lib/seoDataExpanded.ts',
  'src/lib/seoCities.ts',
  'src/lib/seoCityContent.ts',
  'src/lib/seoAgencyData.ts',
]

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const readSrc = (rel: string) => readFileSync(`${repoRoot}/${rel}`, 'utf-8')

const serialize = (value: unknown): string => JSON.stringify(value)

describe('copy-truth: no unsupported claims in static SEO data', () => {
  it('articles contain no fabricated Updro dataset or savings claims', () => {
    const blob = serialize(ARTICLES)
    for (const pattern of BANNED_PLATFORM_CLAIMS) {
      expect(blob, `articles must not match ${pattern}`).not.toMatch(pattern)
    }
  })

  it('comparison pages contain no contradictory pricing/review/timing claims', () => {
    const blob = serialize(COMPARISON_PAGES)
    for (const pattern of BANNED_PLATFORM_CLAIMS) {
      expect(blob, `comparisons must not match ${pattern}`).not.toMatch(pattern)
    }
  })

  it('Updro is never described with success-fee or per-close pricing', () => {
    const blob = serialize(COMPARISON_PAGES)
    expect(blob).not.toMatch(/per avslut, inte per lead/i)
    expect(blob).not.toMatch(/slagavgift/i)
  })
})

describe('copy-truth: component and page source stays clean', () => {
  for (const rel of COPY_FILES) {
    it(`${rel} contains no banned claims`, () => {
      const src = readSrc(rel)
      for (const pattern of BANNED_PLATFORM_CLAIMS) {
        expect(src, `${rel} must not match ${pattern}`).not.toMatch(pattern)
      }
    })
  }

  it('no unhedged 24h promise remains in SEO CTA/meta copy', () => {
    const hedged = /(oftast|vanligtvis) inom 24/i
    for (const rel of COPY_FILES) {
      const src = readSrc(rel)
      for (const match of src.matchAll(/[^'"`\n]*inom 24\s?(timmar|h)/gi)) {
        expect(
          hedged.test(match[0]),
          `${rel}: unhedged 24h promise: "${match[0].trim()}"`,
        ).toBe(true)
      }
    }
  })
})

describe('copy-truth: verified business facts are preserved', () => {
  it('max three offers per project', () => {
    expect(MAX_OFFERS_PER_PROJECT).toBe(3)
  })

  it('agency pricing stays 119 kr/lead and 1 995 kr/month', () => {
    expect(STRIPE_PRODUCTS.lead.price).toBe(119)
    expect(STRIPE_PRODUCTS.monthly.price).toBe(1995)
    expect(STRIPE_PRODUCTS.yearly.price).toBe(19950)
  })

  it('comparison pages state the real pricing model instead of per-close fees', () => {
    const blob = serialize(COMPARISON_PAGES)
    expect(blob).toContain('119 kr per lead')
    expect(blob).toContain('1 995 kr/månad')
    expect(blob).toContain('0 % provision')
  })

  it('comparison pages never promise more than three offers', () => {
    const blob = serialize(COMPARISON_PAGES)
    expect(blob).not.toMatch(/(fyra|fem|fyra till fem|[4-9]) (skräddarsydda )?offerter/i)
  })
})
