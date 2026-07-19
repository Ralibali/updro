import { describe, it, expect } from 'vitest'
import { getMarketCode, getMarket, formatPriceForMarket, formatMarketPrice } from './market'
import { MARKETS, DEFAULT_MARKET } from '@/config/markets'

describe('getMarketCode', () => {
  it('returnerar sverige som standard när variabeln saknas', () => {
    expect(getMarketCode(undefined)).toBe('se')
  })

  it('returnerar sverige för okända värden', () => {
    expect(getMarketCode('dk')).toBe('se')
    expect(getMarketCode('')).toBe('se')
    expect(getMarketCode('NORGE')).toBe('se')
  })

  it('accepterar giltiga marknadskoder', () => {
    expect(getMarketCode('se')).toBe('se')
    expect(getMarketCode('no')).toBe('no')
  })
})

describe('getMarket', () => {
  it('returnerar svensk konfiguration som standard', () => {
    const market = getMarket()
    expect(market.code).toBe(DEFAULT_MARKET)
    expect(market.currency).toBe('SEK')
    expect(market.locale).toBe('sv-SE')
    expect(market.enabled).toBe(true)
  })

  it('returnerar norsk konfiguration för no', () => {
    const market = getMarket('no')
    expect(market.currency).toBe('NOK')
    expect(market.locale).toBe('nb-NO')
    expect(market.defaultCity).toBe('oslo')
  })

  it('alla marknader har komplett konfiguration', () => {
    for (const market of Object.values(MARKETS)) {
      expect(market.locale).toBeTruthy()
      expect(market.currency).toMatch(/^[A-Z]{3}$/)
      expect(market.domain).toContain('.')
      expect(market.countryName).toBeTruthy()
      expect(market.defaultCity).toBeTruthy()
    }
  })
})

describe('formatPriceForMarket', () => {
  it('formaterar SEK med svensk locale', () => {
    const formatted = formatPriceForMarket(25000, MARKETS.se)
    expect(formatted.replace(/\s/g, ' ')).toContain('25')
    expect(formatted.replace(/\s/g, ' ')).toContain('000')
    expect(formatted).toContain('kr')
  })

  it('formaterar NOK med norsk locale', () => {
    const formatted = formatPriceForMarket(25000, MARKETS.no)
    expect(formatted).toContain('25')
    expect(formatted).toContain('000')
    // Norsk formattering använder "kr" (eller NOK beroende på ICU-version)
    expect(formatted.toLowerCase()).toMatch(/kr|nok/)
  })

  it('hanterar noll och stora belopp', () => {
    expect(formatPriceForMarket(0, MARKETS.se)).toContain('0')
    const big = formatPriceForMarket(1500000, MARKETS.se).replace(/\s/g, ' ')
    expect(big).toContain('1 500 000')
  })
})

describe('formatMarketPrice', () => {
  it('faller tillbaka på svensk formattering utan VITE_MARKET', () => {
    // I testmiljön är VITE_MARKET inte satt → svensk standard
    const formatted = formatMarketPrice(10000)
    expect(formatted.replace(/\s/g, ' ')).toContain('10 000')
    expect(formatted).toContain('kr')
  })
})
