import { describe, it, expect } from 'vitest'
import {
  normalizeCampaignCode,
  normalizeReferralCode,
  isCampaignCodeFormatValid,
  buildReferralLink,
  REFERRAL_BONUS_CREDITS,
  REFERRAL_NEW_SUPPLIER_BONUS,
} from './campaign'

describe('normalizeCampaignCode', () => {
  it('trimmar och gör om till versaler', () => {
    expect(normalizeCampaignCode('  grundare ')).toBe('GRUNDARE')
  })

  it('tar bort specialtecken och mellanslag', () => {
    expect(normalizeCampaignCode('grund-are 2024!')).toBe('GRUNDARE2024')
  })

  it('returnerar tom sträng för null/undefined/tom input', () => {
    expect(normalizeCampaignCode(null)).toBe('')
    expect(normalizeCampaignCode(undefined)).toBe('')
    expect(normalizeCampaignCode('   ')).toBe('')
    expect(normalizeCampaignCode('!!!')).toBe('')
  })

  it('kortar till max 32 tecken', () => {
    expect(normalizeCampaignCode('A'.repeat(50))).toHaveLength(32)
  })
})

describe('normalizeReferralCode', () => {
  it('normaliserar till gemener utan specialtecken', () => {
    expect(normalizeReferralCode('  AB12-CD34 ')).toBe('ab12cd34')
  })

  it('hanterar null', () => {
    expect(normalizeReferralCode(null)).toBe('')
  })
})

describe('isCampaignCodeFormatValid', () => {
  it('accepterar giltiga koder', () => {
    expect(isCampaignCodeFormatValid('GRUNDARE')).toBe(true)
    expect(isCampaignCodeFormatValid('ABC123')).toBe(true)
  })

  it('avvisar för korta, tomma och ogiltiga tecken', () => {
    expect(isCampaignCodeFormatValid('AB')).toBe(false)
    expect(isCampaignCodeFormatValid('')).toBe(false)
    expect(isCampaignCodeFormatValid('grund-are')).toBe(false)
  })
})

describe('buildReferralLink', () => {
  it('bygger länk mot given origin', () => {
    expect(buildReferralLink('abc12345', 'https://updro.se')).toBe('https://updro.se/registrera/byra?ref=abc12345')
  })

  it('tar bort avslutande snedstreck från origin', () => {
    expect(buildReferralLink('abc12345', 'https://updro.se/')).toBe('https://updro.se/registrera/byra?ref=abc12345')
  })

  it('använder produktionsdomänen som fallback utanför webbläsaren', () => {
    expect(buildReferralLink('xyz99999')).toContain('/registrera/byra?ref=xyz99999')
  })
})

describe('värvningsbelöningar', () => {
  it('värvaren får fler leads än den nya byrån', () => {
    expect(REFERRAL_BONUS_CREDITS).toBeGreaterThan(REFERRAL_NEW_SUPPLIER_BONUS)
  })
})
