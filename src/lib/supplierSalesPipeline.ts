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
    if (offer.status === 'pending') pendingValueSek += price
    if (offer.status === 'accepted') wonValueSek += price
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
