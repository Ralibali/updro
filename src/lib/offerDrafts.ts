export type OfferDraftForm = { title: string; description: string; price: string; delivery_weeks: string; payment_plan: string }
export const emptyOfferForm = (): OfferDraftForm => ({ title: '', description: '', price: '', delivery_weeks: '', payment_plan: 'fixed' })
const key = (userId: string, projectId: string) => `updro:offer-draft:v1:${encodeURIComponent(userId)}:${encodeURIComponent(projectId)}`

export function readOfferDraft(userId: string, projectId: string): OfferDraftForm | null {
  try {
    const saved = JSON.parse(localStorage.getItem(key(userId, projectId)) || 'null')
    if (saved?.version !== 1 || !Number.isFinite(saved.savedAt) || Date.now() - saved.savedAt > 14 * 86400000) return null
    const form = saved.form
    const limits = { title: 200, description: 20000, price: 24, delivery_weeks: 8 }
    if (!form || !Object.entries(limits).every(([field, limit]) => typeof form[field] === 'string' && form[field].length <= limit)) return null
    if (!['fixed', 'hourly', 'milestone'].includes(form.payment_plan)) return null
    return { title: form.title, description: form.description, price: form.price, delivery_weeks: form.delivery_weeks, payment_plan: form.payment_plan }
  } catch { return null }
}

export function saveOfferDraft(userId: string, projectId: string, form: OfferDraftForm): boolean {
  try {
    localStorage.setItem(key(userId, projectId), JSON.stringify({ version: 1, savedAt: Date.now(), form }))
    return true
  } catch { return false }
}

export function clearOfferDraft(userId: string, projectId: string) {
  try { localStorage.removeItem(key(userId, projectId)) } catch { /* A successful submission must not fail because local storage is unavailable. */ }
}
