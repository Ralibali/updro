/** Optional browser storage must never prevent navigation or a lead submission. */
type StorageKind = 'localStorage' | 'sessionStorage'

export const readBrowserStorage = (kind: StorageKind, key: string): string | null => {
  try {
    return typeof window === 'undefined' ? null : window[kind].getItem(key)
  } catch {
    return null
  }
}

export const writeBrowserStorage = (kind: StorageKind, key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined') return false
    window[kind].setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const removeBrowserStorage = (kind: StorageKind, key: string): void => {
  try {
    if (typeof window !== 'undefined') window[kind].removeItem(key)
  } catch {
    // Storage can be disabled by the browser; the current screen still works.
  }
}
