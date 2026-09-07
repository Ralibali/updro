import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MessageCircle, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'
import TrialBanner from '@/components/TrialBanner'
import SupplierNotificationsList from '@/components/supplier/SupplierNotificationsList'
import PushNotificationCard from '@/components/shared/PushNotificationCard'
import ActivationChecklist from '@/components/supplier/ActivationChecklist'
import { Button } from '@/components/ui/button'
import { CATEGORY_STYLES, BUDGET_LABELS, MAX_OFFERS_PER_PROJECT } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'

const SupplierDashboard = () => {
  const { profile, supplierProfile, user, hasActiveSubscription } = useAuth()
  const [projects, setProjects] = useState<Tables<'projects'>[]>([])
  const [offers, setOffers] = useState<{ status: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const userId = user?.id
  const categories = (supplierProfile?.categories || []).join('|')

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(false)
    const load = async () => {
      try {
        let query = supabase.from('projects').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(20)
        if (categories) query = query.in('category', categories.split('|'))
        const [projectResult, offerResult] = await Promise.all([query, supabase.from('offers').select('status').eq('supplier_id', userId)])
        if (projectResult.error) throw projectResult.error
        if (offerResult.error) throw offerResult.error
        if (cancelled) return
        setProjects((projectResult.data || []).filter(p => p.buyer_id !== userId && (p.offer_count || 0) < (p.max_offers || MAX_OFFERS_PER_PROJECT)).slice(0, 3))
        setOffers(offerResult.data || [])
      } catch { if (!cancelled) setError(true) }
      finally { if (!cancelled) setLoading(false) }
    }
    void load()
    return () => { cancelled = true }
  }, [userId, categories, reload])

  const accepted = offers.filter(o => o.status === 'accepted').length
  const pending = offers.filter(o => o.status === 'pending').length
  return <div className="max-w-4xl space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm text-muted-foreground">Din byrå</p><h1 className="mt-1 font-display text-2xl font-bold">Hej{profile?.full_name ? ' ' + profile.full_name.split(' ')[0] : ''}, hitta nästa uppdrag.</h1><p className="mt-2 text-sm text-muted-foreground">Se vad kunden behöver, lämna offert och följ affären här.</p></div>
      <Button asChild><Link to="/dashboard/supplier/uppdrag">Hitta uppdrag <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
    </header>
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Link to="/dashboard/supplier/uppdrag" className="rounded-xl border bg-card p-3 transition-colors sm:p-4 hover:border-primary/50"><Search className="h-5 w-5 text-primary" /><h2 className="mt-3 text-xs font-semibold sm:text-base">Hitta uppdrag</h2><p className="mt-1 hidden text-sm text-muted-foreground sm:block">Läs brief och budget innan du låser upp kontakten.</p></Link>
      <Link to="/dashboard/supplier/offerter" className="rounded-xl border bg-card p-3 transition-colors sm:p-4 hover:border-primary/50"><FileText className="h-5 w-5 text-primary" /><h2 className="mt-3 text-xs font-semibold sm:text-base">Mina offerter</h2><p className="mt-1 hidden text-sm text-muted-foreground sm:block">{loading || error ? 'Följ offerter och bekräfta avtal.' : accepted ? accepted + (accepted === 1 ? ' accepterad · ' : ' accepterade · ') + pending + ' inväntar beslut' : pending ? pending + ' inväntar beställarens beslut' : 'Dina skickade offerter och avtal samlas här.'}</p></Link>
      <Link to="/dashboard/supplier/chatt" className="rounded-xl border bg-card p-3 transition-colors sm:p-4 hover:border-primary/50"><MessageCircle className="h-5 w-5 text-primary" /><h2 className="mt-3 text-xs font-semibold sm:text-base">Meddelanden</h2><p className="mt-1 hidden text-sm text-muted-foreground sm:block">Fortsätt dialogen med dina beställare.</p></Link>
    </div>
    <section aria-labelledby="matched-heading">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 id="matched-heading" className="font-display text-lg font-semibold">{categories ? 'Senaste inom era kategorier' : 'Senaste uppdragen'}</h2><Link to="/dashboard/supplier/uppdrag" className="shrink-0 text-sm font-medium text-primary hover:underline">Visa alla</Link></div>
      {loading ? <p role="status" className="rounded-xl border p-6 text-sm text-muted-foreground">Hämtar uppdrag…</p> : error ? <div role="alert" className="rounded-xl border p-5"><p className="text-sm">Översikten kunde inte uppdateras.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => setReload(n => n + 1)}>Försök igen</Button></div> : projects.length ? <div className="space-y-3">{projects.map(p => <Link key={p.id} to={'/dashboard/supplier/uppdrag/' + p.id} className="block rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
        <span className={'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (CATEGORY_STYLES[p.category] || '')}>{p.category}</span>
        <h3 className="mt-2 font-semibold break-words">{p.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p><div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{BUDGET_LABELS[p.budget_range] || 'Budget diskuteras'} · {p.city || 'Sverige'} · {timeAgo(p.created_at)}</span><span className="font-medium text-primary">Visa uppdrag →</span></div>
      </Link>)}</div> : <div className="rounded-xl border bg-card p-5"><h3 className="font-semibold">Inga nya uppdrag{categories ? ' inom era kategorier' : ''} just nu</h3><p className="mt-1 hidden text-sm text-muted-foreground sm:block">{categories ? 'Du kan se alla uppdrag eller ändra vilka kategorier byrån arbetar med.' : 'Ange byråns kategorier så blir kommande matchningar mer relevanta.'}</p><div className="mt-3 flex flex-wrap gap-3"><Link to="/dashboard/supplier/uppdrag" className="text-sm font-medium text-primary hover:underline">Se alla uppdrag</Link><Link to="/dashboard/supplier/profil" className="text-sm font-medium text-primary hover:underline">Ändra byråprofil</Link></div></div>}
    </section>
    <ActivationChecklist />
    <SupplierNotificationsList />
    <details className="rounded-xl border p-4"><summary className="cursor-pointer text-sm font-medium">Konto och aviseringar{supplierProfile ? ' · ' + (hasActiveSubscription ? 'Månadskort' : (supplierProfile.lead_credits || 0) + ' upplåsningskrediter') : ''}</summary><div className="mt-4 space-y-4"><TrialBanner /><PushNotificationCard /><Link to="/dashboard/supplier/fakturering" className="inline-block text-sm text-primary hover:underline">Hantera betalplan och krediter</Link></div></details>
  </div>
}
export default SupplierDashboard
