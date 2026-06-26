import { supabase } from '@/integrations/supabase/client'

export type UnlockResult = {
  already_unlocked: boolean
  credits_left: number
}

export const unlockProject = async (projectId: string): Promise<UnlockResult> => {
  const { data, error } = await (supabase as any).rpc('unlock_project_for_supplier', {
    p_project_id: projectId,
  })

  if (error) throw error
  return data as UnlockResult
}

export type SubmitOfferInput = {
  projectId: string
  title: string
  description: string
  price: number
  deliveryWeeks: number | null
  paymentPlan: string
  attachmentUrl: string | null
}

export const submitProjectOffer = async (input: SubmitOfferInput): Promise<string> => {
  const { data, error } = await (supabase as any).rpc('submit_project_offer', {
    p_project_id: input.projectId,
    p_title: input.title,
    p_description: input.description,
    p_price: input.price,
    p_delivery_weeks: input.deliveryWeeks,
    p_payment_plan: input.paymentPlan,
    p_attachment_url: input.attachmentUrl,
  })

  if (error) throw error
  return data as string
}
