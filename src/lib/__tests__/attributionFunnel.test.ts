import { describe, expect, it } from 'vitest'
import { groupAttributionRows, type AttributionRow } from '@/lib/attributionFunnel'

const row = (overrides: Partial<AttributionRow> = {}): AttributionRow => ({
  first_source: 'google',
  first_medium: 'cpc',
  first_campaign: 'brand',
  first_landing_path: '/publicera',
  project_id: crypto.randomUUID(),
  projects: { category: 'Webbutveckling' },
  ...overrides,
})

describe('groupAttributionRows', () => {
  it('returns empty groups on zero data without throwing', () => {
    const grouped = groupAttributionRows([], 0)
    expect(grouped.sources).toEqual([])
    expect(grouped.unknownProjects).toBe(0)
  })
  it('folds missing values into Okänd/organisk and matches total projects', () => {
    const rows = [row(), row({ first_source: null, first_campaign: null, projects: null })]
    const grouped = groupAttributionRows(rows, 5)
    // 5 total projects, 2 have attribution → 3 unknown fillers.
    expect(grouped.unknownProjects).toBe(3)
    const sourceCounts = Object.fromEntries(grouped.sources.map(b => [b.label, b.count]))
    expect(sourceCounts['google']).toBe(1)
    expect(sourceCounts['Okänd/organisk']).toBe(4) // 1 null row + 3 unknown fillers
    const categoryCounts = Object.fromEntries(grouped.categories.map(b => [b.label, b.count]))
    expect(categoryCounts['Webbutveckling']).toBe(1)
    expect(categoryCounts['Okänd/organisk']).toBe(4)
  })
  it('sorts buckets by descending count then Swedish label', () => {
    const rows = [
      row({ first_source: 'facebook' }),
      row({ first_source: 'google' }),
      row({ first_source: 'google' }),
    ]
    const grouped = groupAttributionRows(rows, 3)
    expect(grouped.sources[0]).toEqual({ label: 'google', count: 2 })
    expect(grouped.sources[1]).toEqual({ label: 'facebook', count: 1 })
  })
})
