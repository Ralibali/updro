import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Home, ClipboardList, MessageCircle, UserCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORY_STYLES, BUDGET_LABELS } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'

const navItems = [
  { label: 'Översikt', href: '/dashboard/buyer', icon: Home },
  { label: 'Mina uppdrag', href: '/dashboard/buyer/uppdrag', icon: ClipboardList },
  { label: 'Meddelanden', href: '/dashboard/buyer/chatt', icon: MessageCircle },
  { label: 'Min profil', href: '/dashboard/buyer/profil', icon: UserCircle },
]

const BuyerProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('projects').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProjects(data) })
  }, [user])

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold">Mina uppdrag</h1>
          <Link to="/publicera">
            <Button size="sm" className="bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl">
              <Plus className="mr-1 h-4 w-4" /> Nytt uppdrag
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground mb-4">Inga uppdrag ännu.</p>
            <Link to="/publicera"><Button>Publicera uppdrag</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(p => (
              <Link key={p.id} to={`/dashboard/buyer/uppdrag/${p.id}`} className="block">
                <div className="bg-card rounded-xl border p-4 hover:shadow-md transition-all">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${CATEGORY_STYLES[p.category] || ''}`}>{p.category}</span>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{BUDGET_LABELS[p.budget_range] || ''} · {p.city} · {timeAgo(p.created_at)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-semibold rounded-full px-2 py-1 ${p.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>
                      {p.status === 'active' ? 'Aktiv' : 'Stängd'}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.offer_count || 0} offerter · {p.view_count || 0} visningar</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BuyerProjects
