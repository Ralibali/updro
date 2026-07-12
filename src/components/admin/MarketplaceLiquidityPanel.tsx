import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertCircle, Users, Building2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { timeAgo } from '@/lib/dateUtils'
import {
  buildKpis,
  buildProjectQueue,
  buildSupplierQueue,
  NEXT_STEP_LABELS,
  PROJECT_FLAG_LABELS,
  type OfferAgg,
  type ProjectRow,
  type SupplierRow,
  type UnlockAgg,
} from '@/lib/marketplaceLiquidity'

const SMALL_SAMPLE = 5

const fmtInt = (n: number) => new Intl.NumberFormat('sv-SE').format(n)
const fmtPct = (n: number) => `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(n)}%`
const fmtHours = (h: number | null) => h === null ? '—' : `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(h)} h`

const useLiquidityData = () => {
  const projectsQuery = useQuery({
    queryKey: ['liq-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, category, status, created_at, offer_count, max_offers, buyer_id, guest_lead_id')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return (data ?? []) as ProjectRow[]
    },
  })

  const suppliersQuery = useQuery({
    queryKey: ['liq-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_profiles')
        .select(`
          id, slug, bio, logo_url, categories, services, portfolio_urls, website_url,
          contact_email, contact_phone, contact_name, org_number,
          is_verified, has_fskatt, plan, trial_ends_at, lead_credits, created_at,
          profiles:id(full_name, company_name, email, updated_at)
        `)
        .limit(500)
      if (error) throw error
      return (data ?? []) as unknown as SupplierRow[]
    },
  })

  const unlocksQuery = useQuery({
    queryKey: ['liq-unlocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unlocked_leads')
        .select('supplier_id, project_id, created_at')
        .limit(5000)
      if (error) throw error
      return (data ?? []) as UnlockAgg[]
    },
  })

  const offersQuery = useQuery({
    queryKey: ['liq-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('supplier_id, project_id, created_at')
        .limit(5000)
      if (error) throw error
      return (data ?? []) as OfferAgg[]
    },
  })

  return { projectsQuery, suppliersQuery, unlocksQuery, offersQuery }
}

const KpiTile = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-xl border bg-card p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
  </div>
)

const FlagBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
    {children}
  </span>
)

const NextStepBadge = ({ label, ready }: { label: string; ready: boolean }) => (
  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${
    ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-primary/20 bg-primary/10 text-primary'
  }`}>{label}</span>
)

const MarketplaceLiquidityPanel = () => {
  const { projectsQuery, suppliersQuery, unlocksQuery, offersQuery } = useLiquidityData()

  const loading = projectsQuery.isLoading || suppliersQuery.isLoading || unlocksQuery.isLoading || offersQuery.isLoading
  const error = projectsQuery.error || suppliersQuery.error || unlocksQuery.error || offersQuery.error

  const projects = projectsQuery.data ?? []
  const suppliers = suppliersQuery.data ?? []
  const unlocks = unlocksQuery.data ?? []
  const offers = offersQuery.data ?? []

  const kpis = useMemo(() => buildKpis(projects, suppliers, unlocks, offers), [projects, suppliers, unlocks, offers])
  const projectQueue = useMemo(() => buildProjectQueue(projects, unlocks, offers, suppliers), [projects, unlocks, offers, suppliers])
  const supplierQueue = useMemo(() => buildSupplierQueue(suppliers, unlocks, offers), [suppliers, unlocks, offers])

  const smallProjectSample = projectQueue.length > 0 && projectQueue.length < SMALL_SAMPLE
  const smallSupplierSample = supplierQueue.length > 0 && supplierQueue.length < SMALL_SAMPLE

  return (
    <Card className="mt-6 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">Marketplace liquidity</CardTitle>
        <p className="text-xs text-muted-foreground">
          Realtidsbild av var köpsidan väntar och var byråer behöver hjälp att bli aktiva.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Hämtar liquidity-data…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Kunde inte läsa marketplace-data.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <KpiTile label="Aktiva projekt" value={fmtInt(kpis.activeProjects)} />
              <KpiTile label="Projekt med upplåsning" value={fmtInt(kpis.projectsWithUnlock)} />
              <KpiTile label="Projekt med offert" value={fmtInt(kpis.projectsWithOffer)} />
              <KpiTile label="Andel aktiva med offert" value={fmtPct(kpis.offerRatePct)} />
              <KpiTile label="Median tid till första offert" value={fmtHours(kpis.medianHoursToFirstOffer)} hint="Från created_at till första offert" />
              <KpiTile label="Aktiva byråer 30 d" value={fmtInt(kpis.activeSuppliers30d)} />
              <KpiTile label="Kompletta profiler" value={`${fmtInt(kpis.completeSupplierProfiles)} / ${fmtInt(kpis.totalSuppliers)}`} hint="Minst 80 % ifyllt" />
              <KpiTile label="Byråer med första upplåsning" value={fmtInt(kpis.suppliersWithFirstUnlock)} />
              <KpiTile label="Byråer med första offert" value={fmtInt(kpis.suppliersWithFirstOffer)} />
            </div>

            <section className="mt-6">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" /> Projekt som behöver åtgärd
              </h3>
              {projectQueue.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                  Inga aktiva eller väntande projekt just nu.
                </p>
              ) : (
                <>
                  {smallProjectSample && (
                    <p className="mt-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                      Litet underlag ({projectQueue.length} projekt). Använd som signal, inte trend.
                    </p>
                  )}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-3">Projekt</th>
                          <th className="py-2 pr-3">Kategori</th>
                          <th className="py-2 pr-3">Ålder</th>
                          <th className="py-2 pr-3">Upplåsningar</th>
                          <th className="py-2 pr-3">Offerter</th>
                          <th className="py-2 pr-3">Matchande byråer</th>
                          <th className="py-2 pr-3">Flaggor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectQueue.slice(0, 50).map(p => (
                          <tr key={p.id} className="border-t border-border/50 align-top">
                            <td className="py-2 pr-3">
                              <Link to="/admin/uppdrag" className="text-primary hover:underline" title={p.title}>
                                {p.title.length > 44 ? `${p.title.slice(0, 44)}…` : p.title}
                              </Link>
                              <p className="text-[10px] text-muted-foreground uppercase">{p.status}</p>
                            </td>
                            <td className="py-2 pr-3 text-muted-foreground">{p.category}</td>
                            <td className="py-2 pr-3 text-muted-foreground">{p.ageHours} h</td>
                            <td className="py-2 pr-3">{p.unlocks}</td>
                            <td className="py-2 pr-3">{p.offers}{p.maxOffers ? ` / ${p.maxOffers}` : ''}</td>
                            <td className="py-2 pr-3">{p.matchingSuppliers}</td>
                            <td className="py-2 pr-3">
                              <div className="flex flex-wrap gap-1">
                                {p.flags.length === 0 ? <span className="text-xs text-muted-foreground">—</span> :
                                  p.flags.map(f => <FlagBadge key={f}>{PROJECT_FLAG_LABELS[f]}</FlagBadge>)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <section className="mt-8">
              <h3 className="font-display text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> Byråer som behöver aktivering
              </h3>
              {supplierQueue.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                  Inga byråer registrerade ännu.
                </p>
              ) : (
                <>
                  {smallSupplierSample && (
                    <p className="mt-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                      Litet underlag ({supplierQueue.length} byråer). Använd som signal, inte trend.
                    </p>
                  )}
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-3">Byrå</th>
                          <th className="py-2 pr-3">Profil</th>
                          <th className="py-2 pr-3">Kategorier</th>
                          <th className="py-2 pr-3">Verifierad</th>
                          <th className="py-2 pr-3">Kontakt-mail</th>
                          <th className="py-2 pr-3">Upplåsn.</th>
                          <th className="py-2 pr-3">Offerter</th>
                          <th className="py-2 pr-3">Plan / krediter</th>
                          <th className="py-2 pr-3">Senaste aktivitet</th>
                          <th className="py-2 pr-3">Nästa steg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierQueue.slice(0, 50).map(s => (
                          <tr key={s.id} className="border-t border-border/50 align-top">
                            <td className="py-2 pr-3">
                              <Link to={`/admin/anvandare/${s.id}`} className="text-primary hover:underline">
                                {s.displayName}
                              </Link>
                              {s.email && <p className="text-[10px] text-muted-foreground">{s.email}</p>}
                            </td>
                            <td className="py-2 pr-3">{s.completionPct}%</td>
                            <td className="py-2 pr-3">{s.categoryCount}</td>
                            <td className="py-2 pr-3">{s.isVerified ? 'Ja' : 'Nej'}</td>
                            <td className="py-2 pr-3">{s.hasContactEmail ? 'Ja' : 'Nej'}</td>
                            <td className="py-2 pr-3">{s.unlocks}</td>
                            <td className="py-2 pr-3">{s.offers}</td>
                            <td className="py-2 pr-3 text-muted-foreground">
                              {s.plan}
                              {s.leadCredits > 0 && ` · ${s.leadCredits} kr`}
                              {s.trialEndsAt && ` · trial→${new Date(s.trialEndsAt).toLocaleDateString('sv-SE')}`}
                            </td>
                            <td className="py-2 pr-3 text-muted-foreground">
                              {s.lastActivityAt ? timeAgo(s.lastActivityAt) : '—'}
                            </td>
                            <td className="py-2 pr-3">
                              <NextStepBadge label={NEXT_STEP_LABELS[s.nextStep]} ready={s.nextStep === 'ready'} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <p className="mt-6 flex items-center gap-2 text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" /> Data läses direkt från databasen med aktiva admin-behörigheter.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default MarketplaceLiquidityPanel
