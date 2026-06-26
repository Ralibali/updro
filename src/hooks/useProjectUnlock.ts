import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { submitProjectOffer, unlockProject } from '@/lib/marketplaceActions'
import type { OfferBasicsValue } from '@/components/supplier/OfferBasics'

export const useProjectUnlock = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, supplierProfile, refreshProfile, hasActiveSubscription } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [contact, setContact] = useState<any>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentPlan, setPaymentPlan] = useState('fixed')
  const [form, setForm] = useState<OfferBasicsValue>({ title: '', description: '', price: '', delivery_weeks: '' })

  const readContact = async (data: any) => {
    const query = data.guest_lead_id
      ? (supabase as any).from('guest_leads').select('full_name, company_name, email, phone').eq('id', data.guest_lead_id)
      : supabase.from('profiles').select('full_name, company_name, email, phone').eq('id', data.buyer_id)
    const result = await query.maybeSingle()
    if (result.error) throw result.error
    setContact(result.data)
  }

  useEffect(() => {
    if (!id || !user) return
    const load = async () => {
      setLoading(true)
      try {
        const [projectResult, unlockResult] = await Promise.all([
          supabase.from('projects').select('*').eq('id', id).single(),
          supabase.from('unlocked_leads').select('id').eq('supplier_id', user.id).eq('project_id', id).maybeSingle(),
        ])
        if (projectResult.error) throw projectResult.error
        if (unlockResult.error) throw unlockResult.error
        const next = projectResult.data as any
        setProject(next)
        const isUnlocked = Boolean(unlockResult.data)
        setUnlocked(isUnlocked)
        if (isUnlocked) await readContact(next)
      } catch (error) {
        console.error(error)
        toast.error('Kunde inte läsa uppdraget.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user])

  const unlock = async () => {
    if (!id || !project || unlocking) return
    setUnlocking(true)
    try {
      const result = await unlockProject(id)
      setUnlocked(true)
      await readContact(project)
      await refreshProfile()
      toast.success(result.already_unlocked ? 'Uppdraget är redan upplåst.' : 'Kontaktuppgifter upplåsta!')
    } catch (error: any) {
      toast.error(error?.message || 'Kunde inte låsa upp uppdraget.')
    } finally {
      setUnlocking(false)
    }
  }

  const submit = async () => {
    if (!id || submitting) return
    const price = Number(form.price)
    const weeks = form.delivery_weeks ? Number.parseInt(form.delivery_weeks, 10) : null
    if (form.title.trim().length < 3) return toast.error('Ange en tydlig offert-titel.')
    if (form.description.trim().length < 20) return toast.error('Beskriv offerten med minst 20 tecken.')
    if (!Number.isFinite(price) || price <= 0) return toast.error('Ange ett giltigt pris.')

    setSubmitting(true)
    try {
      await submitProjectOffer({
        projectId: id,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        deliveryWeeks: weeks,
        paymentPlan,
        attachmentUrl: null,
      })
      toast.success('Offert skickad!')
      navigate('/dashboard/supplier/offerter')
    } catch (error: any) {
      toast.error(error?.code === '23505' ? 'Du har redan skickat en offert.' : error?.message || 'Kunde inte skicka offerten.')
    } finally {
      setSubmitting(false)
    }
  }

  const credits = supplierProfile?.lead_credits || 0
  const closed = project ? project.status !== 'active' || (project.offer_count || 0) >= (project.max_offers || 5) : false

  return {
    project, contact, unlocked, loading, unlocking, submitting,
    paymentPlan, setPaymentPlan, form, setForm, unlock, submit,
    credits, closed, hasActiveSubscription,
  }
}
