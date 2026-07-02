import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

/**
 * Subscribes to new offers on projects owned by the current buyer and shows
 * a realtime toast when a supplier submits a bid. Fires once per session.
 */
export const useBuyerOfferNotifications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.id) return

    let projectIds: string[] = []

    const loadProjectIds = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id')
        .eq('buyer_id', user.id)
      projectIds = (data || []).map((p) => p.id)
    }

    loadProjectIds()

    const channel = supabase
      .channel(`buyer-offers-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offers' },
        async (payload) => {
          const offer = payload.new as { id: string; project_id: string; supplier_id: string; title?: string }
          // Refresh id list in case a project was just created
          if (!projectIds.includes(offer.project_id)) {
            await loadProjectIds()
          }
          if (!projectIds.includes(offer.project_id)) return

          const { data: proj } = await supabase
            .from('projects')
            .select('title')
            .eq('id', offer.project_id)
            .single()
          const { data: supplier } = await supabase
            .from('profiles')
            .select('company_name, full_name')
            .eq('id', offer.supplier_id)
            .single()

          const agencyName = supplier?.company_name || supplier?.full_name || 'En byrå'
          toast.success('Ny offert! 🎉', {
            description: `${agencyName} har lämnat en offert på "${proj?.title || 'ditt uppdrag'}".`,
            action: {
              label: 'Visa',
              onClick: () => navigate(`/dashboard/buyer/uppdrag/${offer.project_id}`),
            },
            duration: 8000,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, navigate])
}
