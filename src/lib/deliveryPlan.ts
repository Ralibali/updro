export interface DeliveryPlan {
  deliverables: string[]
  due_date: string | null
  revision_rounds: number | null
  acceptance_criteria: string
}

export const emptyDeliveryPlan = (): DeliveryPlan => ({
  deliverables: [],
  due_date: null,
  revision_rounds: null,
  acceptance_criteria: '',
})

export function parseDeliveryPlan(raw: unknown): DeliveryPlan | null {
  if (raw == null) return emptyDeliveryPlan()
  if (typeof raw !== 'object') return null
  const p = raw as DeliveryPlan
  if (
    !Array.isArray(p.deliverables) ||
    p.deliverables.length > 20 ||
    p.deliverables.some(
      (x) => typeof x !== 'string' || !x.trim() || x.length > 200
    ) ||
    typeof p.acceptance_criteria !== 'string' ||
    p.acceptance_criteria.length > 2000 ||
    (p.revision_rounds !== null &&
      (!Number.isInteger(p.revision_rounds) ||
        p.revision_rounds < 0 ||
        p.revision_rounds > 20))
  )
    return null
  if (
    p.due_date !== null &&
    (typeof p.due_date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(p.due_date) ||
      !Number.isFinite(Date.parse(p.due_date)) ||
      new Date(p.due_date).toISOString().slice(0, 10) !== p.due_date)
  )
    return null
  return {
    deliverables: p.deliverables,
    due_date: p.due_date,
    revision_rounds: p.revision_rounds,
    acceptance_criteria: p.acceptance_criteria,
  }
}

export function deliveryPlanText(plan: DeliveryPlan): string {
  return [
    'Leveransunderlag',
    ...plan.deliverables.map((d, i) => `${i + 1}. ${d}`),
    `Leveransdatum: ${plan.due_date ?? 'Ej överenskommet'}`,
    `Korrekturrundor: ${plan.revision_rounds ?? 'Ej överenskommet'}`,
    `Klart när: ${plan.acceptance_criteria || 'Ej preciserat'}`,
  ].join('\n')
}
