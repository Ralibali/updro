export type ProjectOutcome = 'hired' | 'still_deciding' | 'not_proceeding'

export const PROJECT_OUTCOMES: ProjectOutcome[] = ['hired', 'still_deciding', 'not_proceeding']

export const OUTCOME_LABELS: Record<ProjectOutcome, string> = {
  hired: 'Vi anlitade en byrå',
  still_deciding: 'Vi överväger fortfarande',
  not_proceeding: 'Vi går inte vidare',
}

export const OUTCOME_SHORT_LABELS: Record<ProjectOutcome, string> = {
  hired: 'Anlitade',
  still_deciding: 'Överväger',
  not_proceeding: 'Går inte vidare',
}

export const MAX_ACTUAL_VALUE_SEK = 100_000_000
export const MAX_COMMENT_LENGTH = 1500

export type OutcomeFormInput = {
  outcome: ProjectOutcome | null
  selectedOfferId: string | null
  actualValueSek: string
  comment: string
}

export type ValidatedOutcome = {
  outcome: ProjectOutcome
  selectedOfferId: string | null
  actualValueSek: number | null
  comment: string | null
}

export type ValidationResult =
  | { ok: true; value: ValidatedOutcome }
  | { ok: false; error: string }

export const isProjectOutcome = (value: unknown): value is ProjectOutcome =>
  typeof value === 'string' && (PROJECT_OUTCOMES as string[]).includes(value)

export const validateOutcomeForm = (
  input: OutcomeFormInput,
  availableOfferIds: string[],
): ValidationResult => {
  if (!input.outcome || !isProjectOutcome(input.outcome)) {
    return { ok: false, error: 'Välj vad som hände med uppdraget.' }
  }

  let selectedOfferId: string | null = null
  if (input.outcome === 'hired') {
    if (!input.selectedOfferId) {
      return { ok: false, error: 'Välj vilken byrå du anlitade.' }
    }
    if (!availableOfferIds.includes(input.selectedOfferId)) {
      return { ok: false, error: 'Vald offert tillhör inte uppdraget.' }
    }
    selectedOfferId = input.selectedOfferId
  }

  let actualValueSek: number | null = null
  const rawValue = input.actualValueSek.trim()
  if (rawValue.length > 0) {
    const normalized = rawValue.replace(/\s+/g, '').replace(',', '.')
    const parsed = Number(normalized)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { ok: false, error: 'Ange ett giltigt affärsvärde i kronor.' }
    }
    if (parsed > MAX_ACTUAL_VALUE_SEK) {
      return { ok: false, error: 'Värdet är för högt.' }
    }
    actualValueSek = Math.round(parsed * 100) / 100
  }

  const trimmed = input.comment.trim()
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: `Kommentaren får vara max ${MAX_COMMENT_LENGTH} tecken.` }
  }
  const comment = trimmed.length > 0 ? trimmed : null

  return { ok: true, value: { outcome: input.outcome, selectedOfferId, actualValueSek, comment } }
}
