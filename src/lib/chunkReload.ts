// After a deploy, an open tab can ask for JavaScript chunks that no longer
// exist. Reloading once picks up the new build instead of leaving the visitor
// on an error screen, for example halfway through /publicera.

const STORAGE_KEY = 'updro:chunk-reload-at'
const RELOAD_WINDOW_MS = 60_000
const CHUNK_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|ChunkLoadError/i

export const isChunkLoadError = (error: unknown): boolean => {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? '')
  return CHUNK_ERROR.test(message)
}

/**
 * Reloads the page at most once per minute. Returns true when a reload was
 * started, false when one already happened recently (so the caller should show
 * its normal error state instead of looping).
 */
export const reloadOnceForNewDeploy = (): boolean => {
  try {
    const last = Number(window.sessionStorage.getItem(STORAGE_KEY) || 0)
    if (Date.now() - last < RELOAD_WINDOW_MS) return false
    window.sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    return false
  }
  window.location.reload()
  return true
}
