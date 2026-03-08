import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { CATEGORY_STYLES, BUDGET_LABELS } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'

const AdminProjects = () => {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    supabase.from('projects').select('*, profiles!projects_buyer_id_fkey(full_name, company_name)').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { if (data) setProjects(data) })
  }, [])

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Uppdrag</h1>
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Titel</th>
            <th className="text-left p-3 font-medium">Kategori</th>
            <th className="text-left p-3 font-medium">Budget</th>
            <th className="text-left p-3 font-medium">Beställare</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Offerter</th>
            <th className="text-left p-3 font-medium">Skapad</th>
          </tr></thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3"><span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[p.category] || ''}`}>{p.category}</span></td>
                <td className="p-3 text-muted-foreground">{BUDGET_LABELS[p.budget_range] || '–'}</td>
                <td className="p-3 text-muted-foreground">{p.profiles?.company_name || p.profiles?.full_name || '–'}</td>
                <td className="p-3"><span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${p.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'}`}>{p.status}</span></td>
                <td className="p-3">{p.offer_count || 0}</td>
                <td className="p-3 text-muted-foreground">{timeAgo(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default AdminProjects
