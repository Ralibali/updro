export type SupplierOfferFollowUp = {
  offer_id: string
  supplier_id: string
  next_action: string | null
  follow_up_at: string | null
  private_note: string | null
  created_at: string
  updated_at: string
}

export type SupplierPipelineOffer = {
  id: string
  status: string | null
  price: number
  payment_plan?: string | null
}

const ACTIVE_STATUSES = new Set(['pending', 'accepted'])

export function isSupplierFollowUpDue(
  followUpAt: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!followUpAt) return false
  const timestamp = Date.parse(followUpAt)
  return Number.isFinite(timestamp) && timestamp <= now
}

export function buildSupplierPipelineMetrics(
  offers: SupplierPipelineOffer[],
  followUps: Record<string, SupplierOfferFollowUp | undefined>,
  now = Date.now(),
) {
  let pendingValueSek = 0
  let wonValueSek = 0
  let dueFollowUps = 0
  let missingNextStep = 0

  for (const offer of offers) {
    const price = Number.isFinite(offer.price) && offer.price > 0 ? offer.price : 0
    const canSumAsProjectValue = offer.payment_plan !== 'hourly'
    if (offer.status === 'pending' && canSumAsProjectValue) pendingValueSek += price
    if (offer.status === 'accepted' && canSumAsProjectValue) wonValueSek += price
    if (!offer.status || !ACTIVE_STATUSES.has(offer.status)) continue

    const followUp = followUps[offer.id]
    if (isSupplierFollowUpDue(followUp?.follow_up_at, now)) dueFollowUps += 1
    if (!followUp?.next_action?.trim() && !followUp?.follow_up_at) missingNextStep += 1
  }

  return {
    pendingValueSek,
    wonValueSek,
    dueFollowUps,
    missingNextStep,
  }
}

export type DueFollowUpItem = {
  followUp: SupplierOfferFollowUp
  offer: SupplierPipelineOffer
}

/**
 * Returns due follow-ups for one supplier, limited to that supplier's own
 * active offers (pending/accepted). Follow-ups pointing at another supplier's
 * offer, or at a lost/withdrawn offer, are never returned.
 */
export function getDueFollowUps(
  followUps: SupplierOfferFollowUp[],
  offers: SupplierPipelineOffer[],
  supplierId: string,
  now = Date.now(),
): DueFollowUpItem[] {
  if (!supplierId) return []
  const activeById = new Map(
    offers
      .filter(offer => offer.status && ACTIVE_STATUSES.has(offer.status))
      .map(offer => [offer.id, offer]),
  )
  return followUps
    .filter(item => item.supplier_id === supplierId && isSupplierFollowUpDue(item.follow_up_at, now))
    .flatMap(item => {
      const offer = activeById.get(item.offer_id)
      return offer ? [{ followUp: item, offer }] : []
    })
    .sort((a, b) => Date.parse(a.followUp.follow_up_at || '') - Date.parse(b.followUp.follow_up_at || ''))
}

/** Tomorrow at 08:00 local time – used when a supplier snoozes a follow-up. */
export function nextFollowUpMorningIso(now: Date = new Date()): string {
  const date = new Date(now)
  date.setDate(date.getDate() + 1)
  date.setHours(8, 0, 0, 0)
  return date.toISOString()
}

/** Stable dedup key per offer and calendar day for internal reminder notices. */
export function buildFollowUpDedupKey(offerId: string, date: Date | string): string {
  const parsed = new Date(date)
  const day = Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : 'unknown'
  return `followup:${offerId}:${day}`
}

export function toSupplierDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('')
}
