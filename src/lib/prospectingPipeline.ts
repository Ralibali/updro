export type CompanyIntelligence = {
  version: number
  summary: string
  technology_signals: string[]
  commercial_signals: string[]
  growth_signals: string[]
  risk_signals: string[]
  evidence: string[]
  confidence: number
}

export type ProspectingPipelineLead = {
  status: string
  next_action_at?: string | null
  deal_value_sek?: number | null
  company_intelligence?: CompanyIntelligence | null
}

const TERMINAL_STATUSES = new Set(['converted', 'rejected', 'do_not_contact'])

const asStringArray = (value: unknown): string[] => (
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : []
)

export function normalizeCompanyIntelligence(value: unknown): CompanyIntelligence | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const confidence = typeof source.confidence === 'number' && Number.isFinite(source.confidence)
    ? Math.max(0, Math.min(100, Math.round(source.confidence)))
    : 0
  const summary = typeof source.summary === 'string' ? source.summary.trim() : ''
  const normalized: CompanyIntelligence = {
    version: typeof source.version === 'number' && Number.isFinite(source.version) ? source.version : 1,
    summary,
    technology_signals: asStringArray(source.technology_signals),
    commercial_signals: asStringArray(source.commercial_signals),
    growth_signals: asStringArray(source.growth_signals),
    risk_signals: asStringArray(source.risk_signals),
    evidence: asStringArray(source.evidence),
    confidence,
  }
  const hasEvidence = normalized.evidence.length > 0
    || normalized.technology_signals.length > 0
    || normalized.commercial_signals.length > 0
    || normalized.growth_signals.length > 0
    || normalized.risk_signals.length > 0
    || Boolean(normalized.summary)
  return hasEvidence ? normalized : null
}

export function isFollowUpDue(nextActionAt: string | null | undefined, now = Date.now()): boolean {
  if (!nextActionAt) return false
  const timestamp = Date.parse(nextActionAt)
  return Number.isFinite(timestamp) && timestamp <= now
}

export function buildProspectingPipelineMetrics(
  leads: ProspectingPipelineLead[],
  now = Date.now(),
) {
  let strongEvidence = 0
  let dueFollowUps = 0
  let openPipelineValueSek = 0

  for (const lead of leads) {
    if ((lead.company_intelligence?.confidence ?? 0) >= 60) strongEvidence += 1
    if (!TERMINAL_STATUSES.has(lead.status) && isFollowUpDue(lead.next_action_at, now)) dueFollowUps += 1
    if (!TERMINAL_STATUSES.has(lead.status) && Number.isFinite(lead.deal_value_sek) && (lead.deal_value_sek ?? 0) > 0) {
      openPipelineValueSek += lead.deal_value_sek ?? 0
    }
  }

  return {
    total: leads.length,
    strongEvidence,
    dueFollowUps,
    openPipelineValueSek,
  }
}

export function toLocalDateTimeInput(iso: string | null | undefined): string {
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
