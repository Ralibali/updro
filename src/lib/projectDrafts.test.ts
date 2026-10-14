import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PROJECT_DRAFT_KEY, clearProjectDraft, readProjectDraft, saveProjectDraft, type ProjectDraft } from './projectDrafts'

const draft: ProjectDraft = {
  title: 'Ny hemsida',
  description: 'Ny hemsida med bokning och CRM-koppling.',
  category: 'Webbutveckling',
  budget_range: '10k_50k',
  start_time: 'within_month',
  is_company: false,
}

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('projectDrafts', () => {
  it('sparar och läser tillbaka briefen', () => {
    expect(saveProjectDraft(draft, 1_000)).toBe(true)
    expect(readProjectDraft(2_000)).toEqual(draft)
  })

  it('sparar bara briefens fält', () => {
    saveProjectDraft({ ...draft, email: 'anna@example.com', phone: '070' } as ProjectDraft)
    const raw = localStorage.getItem(PROJECT_DRAFT_KEY) || ''
    expect(raw).not.toContain('anna@example.com')
    expect(raw).not.toContain('phone')
  })

  it('ignorerar utkast äldre än sju dagar', () => {
    saveProjectDraft(draft, 0)
    expect(readProjectDraft(7 * 86400000 + 1)).toBeNull()
  })

  it('tar bort utkastet när beskrivningen töms', () => {
    saveProjectDraft(draft)
    saveProjectDraft({ ...draft, description: '   ' })
    expect(localStorage.getItem(PROJECT_DRAFT_KEY)).toBeNull()
  })

  it('avvisar manipulerade eller okända värden', () => {
    localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), draft: { ...draft, budget_range: 'gratis' } }))
    expect(readProjectDraft()).toBeNull()
    localStorage.setItem(PROJECT_DRAFT_KEY, '{inte json')
    expect(readProjectDraft()).toBeNull()
  })

  it('normaliserar kategorialias och tappar okända kategorier', () => {
    localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), draft: { ...draft, category: 'ehandel' } }))
    expect(readProjectDraft()?.category).toBe('E-handel')
    localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), draft: { ...draft, category: 'Okänd' } }))
    expect(readProjectDraft()?.category).toBe('')
  })

  it('fungerar när lagringen är blockerad', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked') })
    expect(readProjectDraft()).toBeNull()
    expect(saveProjectDraft(draft)).toBe(false)
    expect(() => clearProjectDraft()).not.toThrow()
  })
})
