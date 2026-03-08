import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import { Home, Users, ClipboardList, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Översikt', href: '/admin', icon: Home },
  { label: 'Användare', href: '/admin/anvandare', icon: Users },
  { label: 'Uppdrag', href: '/admin/uppdrag', icon: ClipboardList },
]

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <aside className="hidden md:flex w-64 border-r bg-card flex-col p-4 gap-1">
          {navItems.map(item => (
            <Link key={item.href} to={item.href}
              className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          ))}
        </aside>
        <main className="flex-1 p-4 md:p-8 bg-background overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, projects: 0, suppliers: 0, offers: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: users }, { count: projects }, { count: suppliers }, { count: offers }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('supplier_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('offers').select('*', { count: 'exact', head: true }),
      ])
      setStats({ users: users || 0, projects: projects || 0, suppliers: suppliers || 0, offers: offers || 0 })
    }
    fetchStats()
  }, [])

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Användare', value: stats.users, icon: Users },
          { label: 'Byråer', value: stats.suppliers, icon: BarChart3 },
          { label: 'Uppdrag', value: stats.projects, icon: ClipboardList },
          { label: 'Offerter', value: stats.offers, icon: BarChart3 },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold font-display">{s.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}

export { AdminLayout }
export default AdminDashboard
