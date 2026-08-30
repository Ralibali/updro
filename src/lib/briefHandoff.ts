const BRIEF_HANDOFF_KEY = 'updro:brief-handoff:v1'
const BRIEF_HANDOFF_TTL_MS = 30 * 60 * 1000
const MAX_DESCRIPTION_LENGTH = 5000

interface StoredBriefHandoff {
  description: string
  createdAt: number
}

export interface BriefHandoff {
  description: string
}

export const storeBriefHandoff = (description: string): boolean => {
  if (typeof window === 'undefined') return false
  const clean = description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
  if (!clean) return false

  const payload: StoredBriefHandoff = { description: clean, createdAt: Date.now() }
  try {
    window.sessionStorage.setItem(BRIEF_HANDOFF_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

/**
 * Read-once handoff for Brief Builder → /publicera.
 * The brief never needs to live in the query string and is removed immediately
 * after consumption. Legacy ?beskrivning= links remain supported by the wizard.
 */
export const consumeBriefHandoff = (): BriefHandoff | null => {
  if (typeof window === 'undefined') return null

  let raw: string | null = null
  try {
    raw = window.sessionStorage.getItem(BRIEF_HANDOFF_KEY)
    window.sessionStorage.removeItem(BRIEF_HANDOFF_KEY)
  } catch {
    return null
  }
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<StoredBriefHandoff>
    const description = typeof parsed.description === 'string'
      ? parsed.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : ''
    const createdAt = typeof parsed.createdAt === 'number' ? parsed.createdAt : 0
    if (!description || !createdAt || Date.now() - createdAt > BRIEF_HANDOFF_TTL_MS) return null
    return { description }
  } catch {
    return null
  }
}
