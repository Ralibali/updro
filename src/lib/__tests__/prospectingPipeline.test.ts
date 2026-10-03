import { describe, expect, it } from 'vitest'
import {
  buildProspectingPipelineMetrics,
  isFollowUpDue,
  normalizeCompanyIntelligence,
} from '../prospectingPipeline'

describe('prospecting pipeline helpers', () => {
  it('normalizes stored evidence and clamps confidence', () => {
    expect(normalizeCompanyIntelligence({
      version: 1,
      summary: ' Offertflöde ',
      confidence: 140,
      commercial_signals: ['Offert-/leadflöde', '', 12],
      evidence: ['Kommersiell signal: Offert-/leadflöde'],
    })).toEqual({
      version: 1,
      summary: 'Offertflöde',
      confidence: 100,
      technology_signals: [],
      commercial_signals: ['Offert-/leadflöde'],
      growth_signals: [],
      risk_signals: [],
      evidence: ['Kommersiell signal: Offert-/leadflöde'],
    })
    expect(normalizeCompanyIntelligence({})).toBeNull()
    expect(normalizeCompanyIntelligence('invalid')).toBeNull()
  })

  it('marks only valid past follow-ups as due', () => {
    const now = Date.parse('2026-10-03T12:00:00Z')
    expect(isFollowUpDue('2026-10-03T11:59:00Z', now)).toBe(true)
    expect(isFollowUpDue('2026-10-03T12:01:00Z', now)).toBe(false)
    expect(isFollowUpDue('not-a-date', now)).toBe(false)
    expect(isFollowUpDue(null, now)).toBe(false)
  })

  it('summarizes actionable commercial pipeline without counting terminal leads', () => {
    const now = Date.parse('2026-10-03T12:00:00Z')
    const metrics = buildProspectingPipelineMetrics([
      {
        status: 'qualified',
        next_action_at: '2026-10-03T10:00:00Z',
        deal_value_sek: 15000,
        company_intelligence: {
          version: 1,
          summary: 'Stark signal',
          confidence: 80,
          technology_signals: [],
          commercial_signals: [],
          growth_signals: [],
          risk_signals: [],
          evidence: ['Signal'],
        },
      },
      { status: 'contacted', next_action_at: '2026-10-04T10:00:00Z', deal_value_sek: 5000 },
      { status: 'converted', next_action_at: '2026-10-01T10:00:00Z', deal_value_sek: 50000 },
      { status: 'rejected', next_action_at: '2026-10-01T10:00:00Z', deal_value_sek: 10000 },
    ], now)

    expect(metrics).toEqual({
      total: 4,
      strongEvidence: 1,
      dueFollowUps: 1,
      openPipelineValueSek: 20000,
    })
  })
})
