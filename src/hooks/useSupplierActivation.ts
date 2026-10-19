import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import {
  computeActivationSteps,
  readViewedProjectFlag,
  type ActivationState,
} from '@/lib/supplierActivation'

const EMPTY: ActivationState = {
  steps: [],
  completedRequired: 0,
  requiredTotal: 0,
  nextStep: null,
  allRequiredDone: false,
  allDone: false,
}

/**
 * Härleder byråns aktiveringssteg från befintlig profil plus två säkra
 * count-frågor (unlocked_leads, offers) filtrerade på inloggad användare.
 * Ingen service_role, inga nya policies, inga mutationer.
 */
export const useSupplierActivation = (): ActivationState & { loading: boolean } => {
  const { user, profile, supplierProfile } = useAuth()
  const userId = user?.id
  const [counts, setCounts] = useState<{ unlocked: number; offers: number } | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const load = async () => {
      try {
        const [unlockResult, offerResult] = await Promise.all([
          supabase.from('unlocked_leads').select('project_id').eq('supplier_id', userId),
          supabase.from('offers').select('id').eq('supplier_id', userId),
        ])
        if (cancelled) return
        setCounts({
          unlocked: unlockResult.error ? 0 : (unlockResult.data || []).length,
          offers: offerResult.error ? 0 : (offerResult.data || []).length,
        })
      } catch {
        if (!cancelled) setCounts({ unlocked: 0, offers: 0 })
      }
    }
    void load()
    return () => { cancelled = true }
  }, [userId])

  const state = useMemo<ActivationState>(() => {
    if (!userId || !supplierProfile) return EMPTY
    return computeActivationSteps({
      profile,
      supplierProfile,
      hasViewedProject: readViewedProjectFlag(),
      unlockedLeadCount: counts?.unlocked ?? 0,
      offerCount: counts?.offers ?? 0,
    })
  }, [userId, profile, supplierProfile, counts])

  return { ...state, loading: Boolean(userId && supplierProfile && counts === null) }
}
