import { describe, it, expect } from 'vitest'
import {
  FALLBACK_STATS,
  LIVE_STATS_MIN_PROJECTS,
  buildLiveStats,
  isValidStats,
  resolveStats,
  shouldShowLiveStats,
} from '../marketplaceStats'

describe('isValidStats', () => {
  it('accepts a well-formed payload', () => {
    expect(isValidStats({ projects: 10, offers: 25, agencies: 8 })).toBe(true)
  })
  it('rejects malformed payloads', () => {
    expect(isValidStats(null)).toBe(false)
    expect(isValidStats('stats')).toBe(false)
    expect(isValidStats({ projects: '10', offers: 25, agencies: 8 })).toBe(false)
    expect(isValidStats({ projects: 10, offers: -1, agencies: 8 })).toBe(false)
    expect(isValidStats({ projects: 10 })).toBe(false)
  })
})

describe('shouldShowLiveStats', () => {
  it('hides live stats below the threshold', () => {
    expect(shouldShowLiveStats({ projects: LIVE_STATS_MIN_PROJECTS - 1, offers: 500, agencies: 40 })).toBe(false)
  })
  it('shows live stats at and above the threshold', () => {
    expect(shouldShowLiveStats({ projects: LIVE_STATS_MIN_PROJECTS, offers: 10, agencies: 5 })).toBe(true)
  })
  it('hides when no stats exist', () => {
    expect(shouldShowLiveStats(null)).toBe(false)
  })
})

describe('resolveStats', () => {
  it('falls back to platform promises when stats are missing or too small', () => {
    expect(resolveStats(null)).toEqual({ stats: FALLBACK_STATS, isLive: false })
    expect(resolveStats({ projects: 3, offers: 2, agencies: 4 }).isLive).toBe(false)
  })
  it('uses live numbers when the threshold is reached', () => {
    const result = resolveStats({ projects: 120, offers: 340, agencies: 45 })
    expect(result.isLive).toBe(true)
    expect(result.stats).toEqual(buildLiveStats({ projects: 120, offers: 340, agencies: 45 }))
    expect(result.stats[0].target).toBe(120)
  })
})
