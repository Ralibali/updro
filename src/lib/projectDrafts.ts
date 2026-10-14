import { BUDGET_OPTIONS, START_TIME_OPTIONS, resolveCategory } from '@/lib/constants'
import type { BudgetRange, Category, StartTime } from '@/types'

/**
 * Unsent briefs from /publicera survive a reload, an accidental back navigation
 * or a closed tab. Contact details are never stored here: only the brief itself.
 */
export type ProjectDraft = {
  title: string
  description: string
  category: Category | ''
  budget_range: BudgetRange
  start_time: StartTime
  is_company: boolean
}

export const PROJECT_DRAFT_KEY = 'updro:project-draft:v1'
const MAX_AGE_MS = 7 * 86400000
const BUDGET_VALUES = new Set<string>(BUDGET_OPTIONS.map(option => option.value))
const START_VALUES = new Set<string>(START_TIME_OPTIONS.map(option => option.value))

export function readProjectDraft(now = Date.now()): ProjectDraft | null {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECT_DRAFT_KEY) || 'null')
    if (saved?.version !== 1 || !Number.isFinite(saved.savedAt) || now - saved.savedAt > MAX_AGE_MS) return null
    const draft = saved.draft
    if (!draft || typeof draft.description !== 'string' || typeof draft.title !== 'string') return null
    if (draft.description.trim().length === 0 || draft.description.length > 5000 || draft.title.length > 100) return null
    if (!BUDGET_VALUES.has(draft.budget_range) || !START_VALUES.has(draft.start_time)) return null
    return {
      title: draft.title,
      description: draft.description,
      category: resolveCategory(typeof draft.category === 'string' ? draft.category : ''),
      budget_range: draft.budget_range as BudgetRange,
      start_time: draft.start_time as StartTime,
      is_company: draft.is_company !== false,
    }
  } catch { return null }
}

export function saveProjectDraft(draft: ProjectDraft, now = Date.now()): boolean {
  try {
    if (draft.description.trim().length === 0) {
      localStorage.removeItem(PROJECT_DRAFT_KEY)
      return true
    }
    const { title, description, category, budget_range, start_time, is_company } = draft
    localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify({
      version: 1,
      savedAt: now,
      draft: { title, description, category, budget_range, start_time, is_company },
    }))
    return true
  } catch { return false }
}

export function clearProjectDraft() {
  try { localStorage.removeItem(PROJECT_DRAFT_KEY) } catch { /* A submitted brief must not fail because local storage is unavailable. */ }
}
