import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import { Home, Users, ClipboardList, CreditCard, BarChart3, Settings, Bell, Building2, TrendingUp, BookOpen, Receipt, Shield, Eye, MoreHorizontal, Sparkles, Activity, Search, Mail } from 'lucide-react'
import MarketplaceHealthPanel from '@/components/admin/MarketplaceHealthPanel'
import { cn } from '@/lib/utils'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNoindex } from '@/hooks/useNoindex'
import { loadAdminOverview } from '@/lib/adminOverview'

const navItems = [
  { label: 'Översikt', href: '/admin', icon: Home },
  { label: 'Statistik', href: '/admin/statistik', icon: TrendingUp },
  { label: 'Besökare', href: '/admin/besokare', icon: Eye },
  { label: 'Användare', href: '/admin/anvandare', icon: Users },
  { label: 'Byråer', href: '/admin/byraer', icon: Building2 },
  { label: 'Uppdrag', href: '/admin/uppdrag', icon: ClipboardList },
  { label: 'Offerter', href: '/admin/offerter', icon: CreditCard },
  { label: 'Guider', href: '/admin/guider', icon: BookOpen },
  { label: 'Artikelgenerator', href: '/admin/artikelgenerator', icon: Sparkles },
  { label: 'Innehållsplan', href: '/admin/innehallsplan', icon: ClipboardList },
  { label: 'Prospektering', href: '/admin/prospektering', icon: Search },
  { label: 'Nyhetsbrev', href: '/admin/nyhetsbrev', icon: Mail },
  { label: 'Stripe-logg', href: '/admin/stripe', icon: Receipt },
  { label: 'Audit-logg', href: '/admin/audit', icon: Shield },
  { label: 'Notifikationer', href: '/admin/notifikationer', icon: Bell },
  { label: 'Utbud & efterfrågan', href: '/admin/marketplace-health', icon: Activity },
  { label: 'Edge-funktioner', href: '/admin/edge-funktioner', icon: Activity },
  { label: 'Inställningar', href: '/admin/installningar', icon: Settings },
]

const primaryAdminPaths = ['/admin', '/admin/uppdrag', '/admin/byraer', '/admin/offerter']
const primaryAdminItems = primaryAdminPaths.map(path => navItems.find(item => item.href === path)!)
const extraAdminItems = navItems.filter(item => !primaryAdminPaths.includes(item.href))
const isActive = (path: string, href: string) => path === href || (href !== '/admin' && path.startsWith(`${href}/`))

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  useNoindex()
  useEffect(() => { document.title = `${navItems.find(item => isActive(location.pathname, item.href))?.label || 'Admin'} | Updro admin` }, [location.pathname])
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 flex">
        <aside className="hidden md:flex w-64 border-r bg-card flex-col p-4 gap-1 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Admin</p>
          {navItems.map(item => (
            <Link key={item.href} to={item.href}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive(location.pathname, item.href) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-8 overflow-x-auto pb-28 md:pb-8">{children}</main>
      </div>
      {/* Mobile bottom nav for admin */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50" aria-label="Adminnavigation">
        {primaryAdminItems.map(item => {
          const active = isActive(location.pathname, item.href)
          return (
            <Link key={item.href} to={item.href}
              className={cn('flex flex-col items-center gap-0.5 text-xs p-1', active ? 'text-primary' : 'text-muted-foreground')}>
              <item.icon className="h-5 w-5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button className={cn('flex flex-col items-center gap-0.5 text-xs p-1',
              extraAdminItems.some(i => isActive(location.pathname, i.href)) ? 'text-primary' : 'text-muted-foreground'
            )}>
              <MoreHorizontal className="h-5 w-5" />
              <span>Mer</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl pb-8">
            <SheetTitle>Adminverktyg</SheetTitle>
            <SheetDescription>Välj vad du vill arbeta med.</SheetDescription>
            <div className="grid grid-cols-3 gap-2 pt-4">
              {extraAdminItems.map(item => {
                const active = isActive(location.pathname, item.href)
                return (
                  <SheetClose asChild key={item.href}><Link to={item.href} onClick={() => setMenuOpen(false)}
                    className={cn('flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    )}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link></SheetClose>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: string }) => (
  <div className="bg-card rounded-xl border p-5 flex items-center gap-4">
    <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', color)}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold font-display">{value}</p>
    </div>
  </div>
)

const ContentStatusWidget = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-content-status'],
    queryFn: async () => {
      const results = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('article_queue').select('id', { count: 'exact', head: true }).eq('status', 'queued'),
        supabase.from('article_queue').select('id', { count: 'exact', head: true }).eq('status', 'ready_for_review'),
      ])
      return results.map(result => {
        if (result.error) throw result.error
        if (result.count == null) throw new Error('Antal saknas')
        return result.count
      })
    },
  })
  return <section className="mb-8 rounded-2xl border bg-card p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-display font-semibold">Artiklar i publiceringsverktyget</h2><Link to="/admin/innehallsplan" className="text-xs underline underline-offset-2">Öppna innehållsplanen</Link></div>
    {isLoading ? <p className="text-sm text-muted-foreground">Hämtar innehållsstatus…</p> : isError ? <div role="alert"><p className="text-sm text-muted-foreground">Kunde inte hämta innehållsstatus.</p><Button size="sm" variant="outline" className="mt-2" onClick={() => refetch()}>Försök igen</Button></div> : <div className="grid grid-cols-3 gap-3">{['Publicerade', 'I kö', 'Att granska'].map((label, index) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-2xl font-bold">{data?.[index]}</p></div>)}</div>}
    <p className="mt-4 text-xs text-muted-foreground">Visar databasens artikelkö. Guider som publiceras via kod ingår inte i dessa antal.</p>
  </section>
}

const AdminDashboard = () => {
  const { data, isLoading, isFetching, isError, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => loadAdminOverview(supabase),
    retry: 1,
  })

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Updro admin</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Från förfrågan till affär</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Granska inkomna behov, kontrollera byråutbudet och följ vägen till offert.</p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}><RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />Uppdatera</Button>
        </div>

        {isLoading ? <div role="status" className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">Hämtar adminöversikten…</div>
          : isError || !data ? <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-6"><h2 className="font-semibold">Översikten kunde inte hämtas</h2><p className="mt-2 text-sm text-muted-foreground">Statistiken är okänd tills anslutningen fungerar. Försök igen med Uppdatera.</p></div>
          : <>
            <section aria-labelledby="admin-next-step" className="mb-8 rounded-2xl border bg-card p-5 md:p-6">
              <h2 id="admin-next-step" className="font-display text-lg font-semibold">Att ta hand om</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {[
                  { title: 'Uppdrag att granska', count: data.pendingProjects, text: 'Kontrollera briefen innan uppdraget öppnas.', href: '/admin/uppdrag?status=pending' },
                  { title: 'Gästleads utan uppdrag', count: data.orphanLeads, text: 'Kontrollera varför förfrågan saknar ett kopplat uppdrag.', href: '/admin/uppdrag' },
                  { title: 'Byråer att verifiera', count: data.unverifiedSuppliers, text: 'Granska företagsuppgifter och profilens innehåll.', href: '/admin/byraer' },
                ].map(item => <Link key={item.title} to={item.href} className="group rounded-xl border p-4 transition-colors hover:border-foreground/40 hover:bg-muted/40"><div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{item.title}</span>{item.count > 0 ? <AlertCircle className="h-4 w-4 text-amber-600" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}</div><p className="mt-3 font-display text-3xl font-bold">{item.count}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.text}</p></Link>)}
              </div>
            </section>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-display text-lg font-semibold">Marknadsplatsen i siffror</h2><p className="text-xs text-muted-foreground">Hämtat {new Date(dataUpdatedAt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}</p></div>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Användare" value={data.users} icon={Users} color="bg-primary/10 text-primary" />
              <StatCard label="Registrerade byråer" value={data.suppliers} icon={Building2} color="bg-brand-amber/10 text-brand-amber" />
              <StatCard label="Uppdrag totalt" value={data.projects} icon={ClipboardList} color="bg-accent/10 text-accent" />
              <StatCard label="Aktiva uppdrag" value={data.activeProjects} icon={BarChart3} color="bg-emerald-100 text-emerald-700" />
              <StatCard label="Offerter" value={data.offers} icon={CreditCard} color="bg-violet-100 text-violet-700" />
              <StatCard label="Upplåsta leads" value={data.totalLeads} icon={BarChart3} color="bg-rose-100 text-rose-700" />
            </div>
            <p className="mb-8 text-xs text-muted-foreground">Upplåsningar kan använda fria krediter och är inte ett intäktsmått. <Link to="/admin/stripe" className="underline underline-offset-2">Öppna betalningsloggen</Link>.</p>
            <div className="mb-8"><MarketplaceHealthPanel /></div>
            <div className="mb-8 grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border bg-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display font-semibold">Senaste användare</h2><Link to="/admin/anvandare" className="text-xs underline underline-offset-2">Visa alla</Link></div>
                {data.recentUsers.length === 0 ? <p className="text-sm text-muted-foreground">Inga användare registrerade ännu.</p> : <ul className="divide-y">{data.recentUsers.map(user => <li key={user.id}><Link to={`/admin/anvandare/${user.id}`} className="flex min-w-0 items-center justify-between gap-3 py-3"><span className="min-w-0 break-words text-sm font-medium">{user.company_name || user.full_name || 'Namnet saknas'}</span><span className="text-xs text-muted-foreground">{user.role === 'supplier' ? 'Byrå' : user.role === 'admin' ? 'Admin' : 'Beställare'}</span></Link></li>)}</ul>}
              </section>
              <section className="rounded-2xl border bg-card p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display font-semibold">Senaste uppdrag</h2><Link to="/admin/uppdrag" className="text-xs underline underline-offset-2">Visa alla</Link></div>
                {data.recentProjects.length === 0 ? <p className="text-sm text-muted-foreground">Inga uppdrag ännu. Gästleads utan kopplat uppdrag visas i arbetskön ovan.</p> : <ul className="divide-y">{data.recentProjects.map(project => <li key={project.id} className="py-3"><Link to="/admin/uppdrag" className="text-sm font-medium hover:underline">{project.title}</Link><p className="mt-1 text-xs text-muted-foreground">{project.status}</p></li>)}</ul>}
              </section>
            </div>
          </>}
        <ContentStatusWidget />
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
