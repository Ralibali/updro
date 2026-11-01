export type RemovableProject = { id: string; title: string; status: string | null }
export type RemoveMode = 'delete' | 'close' | 'open' | 'kept'

/**
 * What the buyer can see about the offers. `pending` and `accepted` are null
 * when unknown (the project list only knows the offer count).
 */
export type OfferState = { total: number; pending: number | null; accepted: boolean | null }

/**
 * Untouched projects can be deleted. Once agencies are involved the buyer can
 * close (or finish a full project without choosing), is sent to the project
 * page when the list cannot tell, and otherwise the project is kept.
 */
export function removeMode(project: RemovableProject | null, offers: OfferState): RemoveMode {
  if (offers.total === 0) return 'delete'
  if (offers.accepted) return 'kept'
  if (project?.status === 'active') return 'close'
  if (offers.pending === null) return 'open'
  return offers.pending > 0 ? 'close' : 'kept'
}
