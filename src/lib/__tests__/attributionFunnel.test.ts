import { describe, expect, it } from 'vitest'
import { groupAttributionRows, type AttributionRow, type StoredTouch } from '@/lib/attributionFunnel'

const touch = (overrides: Partial<NonNullable<StoredTouch>> = {}): StoredTouch => ({
  source: 'google',
  medium: 'cpc',
  campaign: 'brand',
  landing_path: '/publicera',
  timestamp: '2026-07-12T00:00:00.000Z',
  ...overrides,
})

const row = (overrides: Partial<AttributionRow> = {}): AttributionRow => ({
  project_id: crypto.randomUUID(),
  first_touch: touch(),
  latest_touch: touch(),
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
    const rows: AttributionRow[] = [
      row(),
      row({ first_touch: null, projects: null }),
    ]
    const grouped = groupAttributionRows(rows, 5)
    // 5 total projects, 2 attributions → 3 unknown fillers.
    expect(grouped.unknownProjects).toBe(3)
    const sourceCounts = Object.fromEntries(grouped.sources.map(b => [b.label, b.count]))
    expect(sourceCounts['google']).toBe(1)
    expect(sourceCounts['Okänd/organisk']).toBe(4)
    const categoryCounts = Object.fromEntries(grouped.categories.map(b => [b.label, b.count]))
    expect(categoryCounts['Webbutveckling']).toBe(1)
    expect(categoryCounts['Okänd/organisk']).toBe(4)
  })
  it('sorts buckets by descending count then Swedish label', () => {
    const rows: AttributionRow[] = [
      row({ first_touch: touch({ source: 'facebook' }) }),
      row({ first_touch: touch({ source: 'google' }) }),
      row({ first_touch: touch({ source: 'google' }) }),
    ]
    const grouped = groupAttributionRows(rows, 3)
    expect(grouped.sources[0]).toEqual({ label: 'google', count: 2 })
    expect(grouped.sources[1]).toEqual({ label: 'facebook', count: 1 })
  })
  it('safely handles malformed touch payloads', () => {
    const rows: AttributionRow[] = [
      row({ first_touch: { source: 123 as unknown as string } as unknown as StoredTouch }),
    ]
    const grouped = groupAttributionRows(rows, 1)
    // Non-string source falls back to Okänd/organisk.
    expect(grouped.sources[0]).toEqual({ label: 'Okänd/organisk', count: 1 })
  })
})
