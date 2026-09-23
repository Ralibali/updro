import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isChunkLoadError, reloadOnceForNewDeploy } from './chunkReload'

describe('isChunkLoadError', () => {
  it('recognises stale-chunk failures from the major browsers', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://updro.se/assets/ProjectWizard-abc.js'))).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true)
  })

  it('ignores ordinary errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
  })
})

describe('reloadOnceForNewDeploy', () => {
  const originalLocation = window.location
  const reload = vi.fn()

  beforeEach(() => {
    window.sessionStorage.clear()
    reload.mockClear()
    Object.defineProperty(window, 'location', { configurable: true, value: { ...originalLocation, reload } })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('reloads once, then lets the error screen show instead of looping', () => {
    expect(reloadOnceForNewDeploy()).toBe(true)
    expect(reloadOnceForNewDeploy()).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })
})
