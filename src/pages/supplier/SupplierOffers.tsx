import { useCallback, useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { CATEGORY_STYLES } from '@/lib/constants'
import { timeAgo, formatPrice } from '@/lib/dateUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OfferAttachment from '@/components/shared/OfferAttachment'
import { PAYMENT_PLAN_LABELS } from '@/lib/agreements'
import StartPortalButton from '@/components/portal/StartPortalButton'
import AgreementPanel from '@/components/agreements/AgreementPanel'


function groupByMonth(offers: any[]) {
  const groups: Record<string, any[]> = {}
  offers.forEach(o => {
    const d = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })
    if (!groups[key]) groups[key] = []
    groups[key].push({ ...o, monthLabel: label })
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({ key, label: items[0].monthLabel, items }))
}

export const OfferCard = ({ o }: { o: any }) => (
  <article className={`rounded-2xl border bg-card p-4 sm:p-5 ${o.status === 'accepted' ? 'border-emerald-300' : ''}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1 basis-48">
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold mb-2 ${CATEGORY_STYLES[o.projects?.category] || ''}`}>{o.projects?.category}</span>
        <h3 className="font-display font-semibold break-words">{o.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{o.projects?.title || 'Uppdrag'} · {timeAgo(o.created_at)}</p>
      </div>
      <div className="shrink-0">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${o.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : o.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
          {o.status === 'pending' ? 'Inväntar beslut' : o.status === 'accepted' ? 'Accepterad' : o.status === 'declined' ? 'Avböjd' : 'Återkallad'}
        </span>
        <p className="mt-2 text-lg font-bold">{formatPrice(o.price)}{o.payment_plan === 'hourly' ? '/timme' : ''}</p>
        <p className="text-xs text-muted-foreground">Exkl. moms · {PAYMENT_PLAN_LABELS[o.payment_plan || 'fixed']}</p>
      </div>
    </div>
    <p className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">{o.status === 'accepted'
      ? 'Nästa steg: stäm av uppstarten med beställaren och granska samarbetsavtalet nedan.'
      : o.status === 'pending' ? 'Offerten är skickad. Du får en notis i Updro när beställaren fattar beslut.'
      : 'Du kan läsa ditt skickade förslag här och söka nya uppdrag.'}</p>
    <details className="mt-3 text-sm"><summary className="cursor-pointer font-medium text-primary">Läs skickad offert</summary>
      <p className="mt-3 whitespace-pre-wrap break-words text-muted-foreground">{o.description}</p>
      {o.delivery_weeks && <p className="mt-2">Leveranstid: {o.delivery_weeks} veckor</p>}
      <OfferAttachment path={o.attachment_url} />
    </details>
    <div className="mt-4 flex flex-wrap gap-2">
      {o.status === 'accepted' && <StartPortalButton offerId={o.id} />}
      <Button asChild variant="outline" size="sm"><Link to={`/dashboard/supplier/uppdrag/${o.project_id}`}>Uppdrag och kontakt</Link></Button>
      {o.projects?.buyer_id && (o.status === 'accepted' || o.status === 'pending') && <Button asChild variant="outline" size="sm"><Link to={`/dashboard/supplier/chatt?project=${o.project_id}&user=${o.projects.buyer_id}`}>Chatta med beställaren</Link></Button>}
    </div>
    {o.status === 'accepted' && o.project_id && <AgreementPanel projectId={o.project_id} offerId={o.id} role="supplier" />}
  </article>
)

const SupplierOffers = () => {
  const { user } = useAuth()
  const [offers, setOffers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const result = await supabase.from('offers').select('*, projects(title, category, city, buyer_id)')
        .eq('supplier_id', user.id).order('created_at', { ascending: false })
      if (result.error) throw result.error
      setOffers(result.data || [])
    } catch { setError(true) }
    finally { setLoading(false) }
  }, [user])
  useEffect(() => { void load() }, [load])

  const activeOffers = offers.filter(o => o.status === 'pending' || o.status === 'accepted')
  const lostOffers = offers.filter(o => o.status === 'declined' || o.status === 'withdrawn')

  const filteredLost = useMemo(() => {
    if (!search.trim()) return lostOffers
    const q = search.toLowerCase()
    return lostOffers.filter(o =>
      o.title?.toLowerCase().includes(q) ||
      o.projects?.title?.toLowerCase().includes(q) ||
      o.projects?.category?.toLowerCase().includes(q)
    )
  }, [lostOffers, search])

  const lostByMonth = groupByMonth(filteredLost)

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold">Mina offerter</h1><p className="mt-1 text-sm text-muted-foreground">Följ dina förslag, håll kontakten och bekräfta era avtal.</p></div>
        <Button asChild><Link to="/dashboard/supplier/uppdrag">Hitta uppdrag</Link></Button>
      </div>
      {loading ? <p role="status" className="rounded-xl border p-6 text-sm text-muted-foreground">Laddar dina offerter…</p> : error ? <div role="alert" className="rounded-xl border p-6"><p>Offerterna kunde inte läsas.</p><Button variant="outline" onClick={load} className="mt-3">Försök igen</Button></div> : <>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Aktiva ({activeOffers.length})</TabsTrigger>
          <TabsTrigger value="lost">Ej vunna ({lostOffers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeOffers.length === 0 ? (
            <div className="bg-card rounded-xl border p-8 text-center">
              <p className="text-muted-foreground">Du har inga aktiva offerter just nu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOffers.map(o => <OfferCard key={o.id} o={o} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lost">
          <Input
            placeholder="Sök bland ej vunna offerter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="mb-4 rounded-xl"
          />

          {lostByMonth.length === 0 ? (
            <div className="bg-card rounded-xl border p-8 text-center">
              <p className="text-muted-foreground">Inga ej vunna offerter att visa.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {lostByMonth.map(group => (
                <div key={group.key}>
                  <h3 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 capitalize">
                    {group.label}
                  </h3>
                  <div className="space-y-3">
                    {group.items.map(o => <OfferCard key={o.id} o={o} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </>}
    </div>
  )
}

export default SupplierOffers
