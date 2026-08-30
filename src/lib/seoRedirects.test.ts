import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  LEGACY_REDIRECTS,
  LEGACY_PREFIX_REDIRECTS,
  resolveLegacyRedirect,
} from './seoRedirects'

describe('LEGACY_REDIRECTS map integrity', () => {
  it('has no duplicate sources', () => {
    const froms = LEGACY_REDIRECTS.map(r => r.from)
    expect(new Set(froms).size).toBe(froms.length)
  })

  it('uses absolute paths without trailing slashes', () => {
    for (const { from, to } of LEGACY_REDIRECTS) {
      expect(from.startsWith('/')).toBe(true)
      expect(to.startsWith('/')).toBe(true)
      expect(from.endsWith('/')).toBe(false)
      expect(to.endsWith('/')).toBe(false)
    }
  })

  it('never creates redirect chains or self-loops', () => {
    for (const { to } of LEGACY_REDIRECTS) {
      expect(resolveLegacyRedirect(to)).toBeNull()
    }
  })
})

describe('resolveLegacyRedirect', () => {
  it('resolves every exact alias to its configured target', () => {
    for (const { from, to } of LEGACY_REDIRECTS) {
      expect(resolveLegacyRedirect(from)).toBe(to)
    }
  })

  it('covers the known legacy aliases', () => {
    expect(resolveLegacyRedirect('/landing/byra')).toBe('/for-byraer')
    expect(resolveLegacyRedirect('/guider')).toBe('/artiklar')
    expect(resolveLegacyRedirect('/kunskapsbank')).toBe('/artiklar')
    expect(resolveLegacyRedirect('/updro-vs-partna')).toBe('/partna-alternativ')
    expect(resolveLegacyRedirect('/jamfor-partna')).toBe('/partna-alternativ')
    expect(resolveLegacyRedirect('/alternativ-till-partna')).toBe('/partna-alternativ')
    expect(resolveLegacyRedirect('/updro-vs-swivrr')).toBe('/swivrr-alternativ')
    expect(resolveLegacyRedirect('/hemsida-pris-kalkylator')).toBe('/verktyg/hemsida-pris-kalkylator')
    expect(resolveLegacyRedirect('/vad-kostar-en-hemsida-kalkylator')).toBe('/verktyg/hemsida-pris-kalkylator')
    expect(resolveLegacyRedirect('/webbyra-stockholm')).toBe('/byraer/stockholm')
    expect(resolveLegacyRedirect('/seo-byra-malmo')).toBe('/seo/malmo')
  })

  it('carries a single slug segment through prefix aliases', () => {
    expect(resolveLegacyRedirect('/guider/vad-kostar-en-hemsida-2026')).toBe('/artiklar/vad-kostar-en-hemsida-2026')
    expect(resolveLegacyRedirect('/kunskapsbank/hjalp-med-hemsida')).toBe('/artiklar/hjalp-med-hemsida')
    expect(resolveLegacyRedirect('/stader/stockholm')).toBe('/byraer/stockholm')
  })

  it('ignores query strings and trailing slashes', () => {
    expect(resolveLegacyRedirect('/guider?foo=bar')).toBe('/artiklar')
    expect(resolveLegacyRedirect('/guider/')).toBe('/artiklar')
    expect(resolveLegacyRedirect('/stader/umea/')).toBe('/byraer/umea')
  })

  it('leaves valid routes and unknown paths alone', () => {
    for (const path of [
      '/',
      '/stader', // CitiesIndex – must NOT redirect
      '/artiklar',
      '/artiklar/vad-kostar-en-hemsida-2026',
      '/byraer',
      '/byraer/stockholm',
      '/for-byraer',
      '/landing',
      '/verktyg/hemsida-pris-kalkylator',
      '/partna-alternativ',
      '/detta-finns-inte-xyz123',
      '/guider/slug/djupare-niva', // deeper than one segment – no legacy match
    ]) {
      expect(resolveLegacyRedirect(path)).toBeNull()
    }
  })
})

describe('public/_redirects alignment', () => {
  const redirectsFile = readFileSync(
    path.resolve(__dirname, '../../public/_redirects'),
    'utf8',
  )
  const rules = redirectsFile
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split(/\s+/))

  it('contains a 301 for every exact legacy alias', () => {
    for (const { from, to } of LEGACY_REDIRECTS) {
      const match = rules.some(
        ([ruleFrom, ruleTo, status]) =>
          ruleFrom === from && ruleTo === to && status === '301',
      )
      expect(match, `missing 301 in _redirects: ${from} -> ${to}`).toBe(true)
    }
  })

  it('contains a prefix rule for every prefix alias', () => {
    for (const { from, to } of LEGACY_PREFIX_REDIRECTS) {
      const match = rules.some(
        ([ruleFrom, ruleTo, status]) =>
          status === '301' &&
          (ruleFrom === `${from}/*` || ruleFrom === `${from}/:splat` || ruleFrom.startsWith(`${from}/:`)) &&
          ruleTo.startsWith(`${to}/`),
      )
      expect(match, `missing prefix 301 in _redirects: ${from}/* -> ${to}/...`).toBe(true)
    }
  })

  it('keeps the SPA fallback last', () => {
    const last = rules[rules.length - 1]
    expect(last).toEqual(['/*', '/index.html', '200'])
  })
})
