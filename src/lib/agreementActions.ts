import { z } from 'zod'
import type { DeliveryPlan } from '@/lib/deliveryPlan'
import { supabase } from '@/integrations/supabase/client'
import { parseAgreementContent, type AgreementContent } from '@/lib/agreements'

const contentSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]), scope: z.string().min(3), special_terms: z.string(),
  price_sek: z.number().positive().finite(), payment_plan: z.enum(['fixed', 'hourly', 'milestone']),
  delivery_weeks: z.number().int().positive().nullable(), buyer_name: z.string().min(1), supplier_name: z.string().min(1),
  project_title: z.string(), offer_title: z.string(), created_at: z.string().datetime({ offset: true }),
  buyer_confirmed_at: z.string().datetime({ offset: true }).nullable(), supplier_confirmed_at: z.string().datetime({ offset: true }).nullable(),
  standard_clauses: z.array(z.string()).min(1),
  delivery_plan: z.unknown().optional(),
})
const rowSchema = z.object({ id: z.string().uuid(), revision: z.number().int().positive(), content: contentSchema })
const contextSchema = z.object({
  buyerName: z.string(), supplierName: z.string(), projectTitle: z.string(),
  buyerId: z.string().uuid().nullable(), supplierId: z.string().uuid(),
})

export type AgreementRow = { id: string; revision: number; content: AgreementContent }
export type AgreementContext = z.infer<typeof contextSchema>

export function parseAgreementRow(raw: unknown): AgreementRow {
  const result = rowSchema.safeParse(raw)
  const content = result.success ? parseAgreementContent(result.data.content) : null
  if (!result.success || !content) throw new Error('Avtalet kunde inte läsas. Ladda om och försök igen.')
  return { id: result.data.id, revision: result.data.revision, content }
}

export async function getProjectAgreement(projectId: string, offerId: string) {
  const { data, error } = await supabase.rpc('get_project_agreement', { p_project_id: projectId, p_offer_id: offerId })
  if (error) throw error
  const parsed = z.object({ context: contextSchema, agreement: z.unknown().nullable() }).safeParse(data)
  if (!parsed.success || parsed.data.agreement === undefined) throw new Error('Avtalsuppgifterna kunde inte läsas.')
  return { context: parsed.data.context, agreement: parsed.data.agreement === null ? null : parseAgreementRow(parsed.data.agreement) }
}

export async function updateProjectAgreement(offerId: string, action: 'create' | 'edit' | 'confirm', revision = 0, edits?: { scope: string; special_terms: string; delivery_plan?: DeliveryPlan }) {
  const { data, error } = await supabase.rpc('update_project_agreement', {
    p_offer_id: offerId, p_action: action, p_expected_revision: revision,
    ...(edits?.delivery_plan ? { p_delivery_plan: { ...edits.delivery_plan } } : {}),
    ...(edits ? { p_scope: edits.scope, p_special_terms: edits.special_terms } : {}),
  })
  if (error) throw error
  return parseAgreementRow(data)
}
