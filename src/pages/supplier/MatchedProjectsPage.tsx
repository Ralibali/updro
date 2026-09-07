import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Search, Unlock } from 'lucide-react'
import TrialBanner from '@/components/TrialBanner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import type { Tables } from '@/integrations/supabase/types'
import { BUDGET_LABELS, CATEGORIES, CATEGORY_STYLES, MAX_OFFERS_PER_PROJECT } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'
import { scoreProjectMatch } from '@/lib/projectMatching'

type Project = Tables<'projects'>
const remaining = (p: Project) => Math.max(0, (p.max_offers || MAX_OFFERS_PER_PROJECT) - (p.offer_count || 0))

const MatchedProjectsPage = () => {
  const { user, profile, supplierProfile, hasActiveSubscription, trialExpired } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [view, setView] = useState('all')
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(false)
    const load = async () => {
      try {
        const [projectResult, unlockResult] = await Promise.all([
          supabase.from('projects').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(100),
          supabase.from('unlocked_leads').select('project_id, projects(*)').eq('supplier_id', userId),
        ])
        if (projectResult.error) throw projectResult.error
        if (unlockResult.error) throw unlockResult.error
        if (cancelled) return
        const saved = unlockResult.data || []
        const combined = new Map<string, Project>((projectResult.data || []).map(p => [p.id, p]))
        for (const row of saved) if (row.projects) combined.set(row.projects.id, row.projects)
        setProjects([...combined.values()].filter(p => p.buyer_id !== userId))
        setUnlocked(new Set(saved.map(row => row.project_id)))
      } catch { if (!cancelled) setError(true) }
      finally { if (!cancelled) setLoading(false) }
    }
    void load()
    return () => { cancelled = true }
  }, [userId, reload])

  const categorySet = new Set<string>(supplierProfile?.categories || [])
  const query = search.trim().toLocaleLowerCase('sv-SE')
  const available = projects.filter(p => p.status === 'active' && remaining(p) > 0)
  const scope = view === 'unlocked' ? projects.filter(p => unlocked.has(p.id))
    : view === 'matched' ? available.filter(p => categorySet.has(p.category)) : available
  const visible = scope.filter(p => (filterCat === 'all' || p.category === filterCat) && (!query || [p.title, p.description, p.city, p.category].join(' ').toLocaleLowerCase('sv-SE').includes(query)))
    .map(project => ({ project, match: scoreProjectMatch(project, supplierProfile, profile) }))
    .sort((a,b) => (sort === 'match' ? b.match.score - a.match.score : 0) || Date.parse(b.project.created_at) - Date.parse(a.project.created_at))
  const resetFilters = () => { setSearch(''); setFilterCat('all'); setView('all') }

  return <div className="max-w-4xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold">Hitta uppdrag</h1><p className="mt-2 text-sm text-muted-foreground">Läs brief och budget gratis. Lås upp kontakten när uppdraget passar er.</p></div>
      <Link to="/dashboard/supplier/fakturering" className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary/50">{hasActiveSubscription ? 'Upplåsning ingår i månadskortet' : trialExpired ? 'Se betalplan' : (supplierProfile?.lead_credits || 0) + ' upplåsningskrediter'}</Link>
    </header>
    <TrialBanner />
    <div className="flex flex-wrap gap-2" role="group" aria-label="Vilka uppdrag vill du se?">
      {[['all','Alla uppdrag'],['matched','Mina kategorier'],['unlocked','Upplåsta']].map(([key,label]) => <Button key={key} size="sm" variant={view === key ? 'default' : 'outline'} aria-pressed={view === key} onClick={() => setView(key)}>{label}</Button>)}
    </div>
    <div className="grid grid-cols-2 items-end gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_180px_160px]">
      <div className="col-span-2 sm:col-span-1"><Label htmlFor="project-search">Sök uppdrag</Label><div className="relative mt-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input id="project-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tjänst, titel eller ort" className="pl-9" /></div></div>
      <div><Label htmlFor="project-category">Kategori</Label><Select value={filterCat} onValueChange={setFilterCat}><SelectTrigger id="project-category" className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Alla kategorier</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      <div><Label htmlFor="project-sort">Sortera</Label><Select value={sort} onValueChange={setSort}><SelectTrigger id="project-sort" className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Senaste först</SelectItem><SelectItem value="match">Bäst matchning</SelectItem></SelectContent></Select></div>
    </div>
    {loading ? <p role="status" className="rounded-xl border p-8 text-sm text-muted-foreground">Hämtar uppdrag…</p> : error ? <div role="alert" className="rounded-xl border p-6"><p>Uppdragen kunde inte hämtas.</p><Button variant="outline" onClick={() => setReload(n => n + 1)} className="mt-3">Försök igen</Button></div> : <>
      <p className="text-sm text-muted-foreground" role="status">{visible.length} uppdrag visas · Högst tre offerter per uppdrag</p>
      {visible.length === 0 ? <div className="rounded-xl border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">{view === 'unlocked' ? 'Inga upplåsta uppdrag i urvalet' : view === 'matched' && !categorySet.size ? 'Välj vad byrån arbetar med' : 'Inga uppdrag i urvalet just nu'}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{view === 'matched' && !categorySet.size ? 'Lägg till kategorier i byråprofilen för att få ett relevant urval.' : 'Prova en annan kategori eller se alla tillgängliga uppdrag.'}</p>
        <div className="mt-4 flex flex-wrap gap-3"><Button variant="outline" onClick={resetFilters}>Visa alla uppdrag</Button><Button asChild variant="ghost"><Link to="/dashboard/supplier/profil">Ändra byråprofil</Link></Button></div>
      </div> : <div className="space-y-3">{visible.map(({project:p,match}) => <article key={p.id} className="rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + (CATEGORY_STYLES[p.category] || '')}>{p.category}</span><span className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</span></div>
        <h2 className="mt-3 font-display text-lg font-semibold break-words"><Link to={'/dashboard/supplier/uppdrag/' + p.id} className="hover:text-primary">{p.title}</Link></h2>
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{p.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"><span className="font-semibold">{BUDGET_LABELS[p.budget_range] || 'Budget diskuteras'}</span><span className="inline-flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4" />{p.city || 'Sverige'}</span><span className="text-muted-foreground">{p.status !== 'active' || !remaining(p) ? 'Tar inte emot fler offerter' : remaining(p) + (remaining(p) === 1 ? ' offertplats kvar' : ' offertplatser kvar')}</span></div>
        {match.reasons.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{match.reasons.join(' · ')}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3"><p className="text-xs text-muted-foreground">{unlocked.has(p.id) ? <span className="inline-flex items-center gap-1.5"><Unlock className="h-3.5 w-3.5" />Redan upplåst · ingen ny kredit</span> : 'Läs hela uppdraget innan du bestämmer dig'}</p><Button asChild size="sm"><Link to={'/dashboard/supplier/uppdrag/' + p.id}>{unlocked.has(p.id) ? 'Kontakt och offert' : 'Visa uppdrag'}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
      </article>)}</div>}
    </>}
  </div>
}
export default MatchedProjectsPage
