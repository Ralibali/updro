import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import { Home, Users, ClipboardList, CreditCard, BarChart3, Settings, Bell, Building2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Översikt', href: '/admin', icon: Home },
  { label: 'Statistik', href: '/admin/statistik', icon: TrendingUp },
  { label: 'Användare', href: '/admin/anvandare', icon: Users },
  { label: 'Byråer', href: '/admin/byraer', icon: Building2 },
  { label: 'Uppdrag', href: '/admin/uppdrag', icon: ClipboardList },
  { label: 'Offerter', href: '/admin/offerter', icon: CreditCard },
  { label: 'Notifikationer', href: '/admin/notifikationer', icon: Bell },
  { label: 'Inställningar', href: '/admin/installningar', icon: Settings },
]

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <div className="flex-1 flex">
        <aside className="hidden md:flex w-64 border-r bg-card flex-col p-4 gap-1 shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Admin</p>
          {navItems.map(item => (
            <Link key={item.href} to={item.href}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, projects: 0, suppliers: 0, offers: 0, activeProjects: 0, totalLeads: 0 })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentProjects, setRecentProjects] = useState<any[]>([])

  useEffect(() => {
    const fetch = async () => {
      const [
        { count: users },
        { count: projects },
        { count: suppliers },
        { count: offers },
        { count: activeProjects },
        { count: totalLeads },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('supplier_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('offers').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('unlocked_leads').select('*', { count: 'exact', head: true }),
      ])
      setStats({
        users: users || 0, projects: projects || 0, suppliers: suppliers || 0,
        offers: offers || 0, activeProjects: activeProjects || 0, totalLeads: totalLeads || 0,
      })

      const { data: ru } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
      if (ru) setRecentUsers(ru)

      const { data: rp } = await supabase.from('projects').select('*, profiles!projects_buyer_id_fkey(full_name, company_name)').order('created_at', { ascending: false }).limit(5)
      if (rp) setRecentProjects(rp)
    }
    fetch()
  }, [])

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Användare" value={stats.users} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="Byråer" value={stats.suppliers} icon={Building2} color="bg-brand-amber/10 text-brand-amber" />
        <StatCard label="Uppdrag" value={stats.projects} icon={ClipboardList} color="bg-accent/10 text-accent" />
        <StatCard label="Aktiva uppdrag" value={stats.activeProjects} icon={BarChart3} color="bg-emerald-100 text-emerald-700" />
        <StatCard label="Offerter" value={stats.offers} icon={CreditCard} color="bg-violet-100 text-violet-700" />
        <StatCard label="Upplåsta leads" value={stats.totalLeads} icon={BarChart3} color="bg-rose-100 text-rose-700" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Senaste användare</h2>
            <Link to="/admin/anvandare" className="text-xs text-primary hover:underline">Visa alla →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <Link key={u.id} to={`/admin/anvandare/${u.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium">{u.full_name || '–'}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className={cn('text-[10px] font-semibold rounded-full px-2 py-0.5',
                  u.role === 'supplier' ? 'bg-primary/10 text-primary' : u.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'
                )}>{u.role}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Senaste uppdrag</h2>
            <Link to="/admin/uppdrag" className="text-xs text-primary hover:underline">Visa alla →</Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.profiles?.company_name || p.profiles?.full_name || '–'}</p>
                </div>
                <span className={cn('text-[10px] font-semibold rounded-full px-2 py-0.5',
                  p.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
                )}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
