import { describe, expect, it } from 'vitest'
import { compareCostPerWin, PARTNA_FACTS } from './partnaComparison'

describe('compareCostPerWin', () => {
  it('räknar leadkostnad och slagavgift för en vunnen affär', () => {
    const result = compareCostPerWin({ projectValue: 100000, leadsPerWin: 4, updroLeadPrice: 99 })
    expect(result.updro).toBe(396)
    expect(result.partnaLeads).toBe(4 * PARTNA_FACTS.payAsYouGo)
    expect(result.partnaFee).toBe(7000)
    expect(result.savings).toBe(4 * PARTNA_FACTS.payAsYouGo + 7000 - 396)
  })

  it('kräver minst ett lead och aldrig negativa värden', () => {
    const result = compareCostPerWin({ projectValue: -5, leadsPerWin: 0, updroLeadPrice: 99 })
    expect(result.updro).toBe(99)
    expect(result.partnaFee).toBe(0)
  })
})
