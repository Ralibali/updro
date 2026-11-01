import { categoryLabel } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Hand, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORY_STYLES, BUDGET_LABELS } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'
import { numWord } from '@/lib/numberWords'
import ProjectRemoveDialog from '@/components/buyer/ProjectRemoveDialog'

const BuyerProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    supabase.from('projects').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setProjects(data) })
  }, [user])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Mina uppdrag</h1>
        <Link to="/publicera">
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
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
            <div key={p.id} className="bg-card rounded-xl border p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/dashboard/buyer/uppdrag/${p.id}`} className="flex-1 min-w-0">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${CATEGORY_STYLES[p.category] || ''}`}>{categoryLabel(p.category)}</span>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{BUDGET_LABELS[p.budget_range] || ''} · {p.city} · {timeAgo(p.created_at)}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-xs font-semibold rounded-full px-2 py-1 ${p.status === 'active' ? 'bg-accent/10 text-accent' : p.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : p.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                      {p.status === 'active' ? 'Aktiv' : p.status === 'pending' ? '⏳ Väntar på godkännande' : p.status === 'rejected' ? 'Avvisad' : 'Stängd'}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hand className="h-3 w-3" />
                      {numWord(p.offer_count || 0)} intresserade {(p.offer_count || 0) === 1 ? 'byrå' : 'byråer'} · {numWord(p.view_count || 0)} visningar
                    </span>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteTarget(p) }}
                  className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Ta bort uppdrag"
                  aria-label={`Ta bort uppdraget ${p.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete, or close when agencies are already involved */}
      <ProjectRemoveDialog
        project={deleteTarget}
        offers={{ total: deleteTarget?.offer_count || 0, pending: null, accepted: null }}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        onDeleted={id => setProjects(prev => prev.filter(p => p.id !== id))}
        onClosed={id => setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'closed' } : p))}
      />
    </div>
  )
}

export default BuyerProjects
