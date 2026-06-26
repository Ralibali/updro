import { supabase } from '@/integrations/supabase/client'

export type LeadVerificationInput = {
  projectId: string
  emailVerified: boolean
  phoneVerified: boolean
  budgetVerified: boolean
  briefVerified: boolean
  note: string
  activate: boolean
}

export type LeadVerificationResult = {
  id: string
  lead_score: number
  status: string
  verified_at: string
}

export const verifyProjectLead = async (input: LeadVerificationInput): Promise<LeadVerificationResult> => {
  const { data, error } = await (supabase as any).rpc('verify_project_lead', {
    p_project_id: input.projectId,
    p_email_verified: input.emailVerified,
    p_phone_verified: input.phoneVerified,
    p_budget_verified: input.budgetVerified,
    p_brief_verified: input.briefVerified,
    p_verification_note: input.note.trim() || null,
    p_activate: input.activate,
  })

  if (error) throw error
  return data as LeadVerificationResult
}

export const leadScoreLabel = (score: number) => {
  if (score >= 75) return 'Verifierat premiumlead'
  if (score >= 50) return 'Tydligt och relevant'
  return 'Grundläggande uppgifter'
}
