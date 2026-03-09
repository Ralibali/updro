import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { CATEGORY_STYLES, BUDGET_LABELS } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportCsv } from '@/lib/exportCsv'

const AdminProjects = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    supabase.from('projects').select('*, profiles!projects_buyer_id_fkey(full_name, company_name)').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => { if (data) setProjects(data) })
  }, [])

  const filtered = projects.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleExport = () => {
    exportCsv(filtered.map(p => ({
      Titel: p.title,
      Kategori: p.category,
      Budget: BUDGET_LABELS[p.budget_range] || '–',
      Beställare: p.profiles?.company_name || p.profiles?.full_name || '–',
      Status: p.status,
      Offerter: p.offer_count || 0,
      Visningar: p.view_count || 0,
      Skapad: p.created_at ? new Date(p.created_at).toLocaleDateString('sv-SE') : '',
    })), 'uppdrag')
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold">Uppdrag</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {['all', 'active', 'closed', 'completed', 'draft'].map(s => (
              <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} className="rounded-xl text-xs" onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'Alla' : s}
              </Button>
            ))}
          </div>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Sök uppdrag..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />CSV
          </Button>
        </div>
      </div>
      <div className="bg-card rounded-xl border overflow-hidden overflow-x-auto">
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
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3"><span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', CATEGORY_STYLES[p.category] || '')}>{p.category}</span></td>
                <td className="p-3 text-muted-foreground">{BUDGET_LABELS[p.budget_range] || '–'}</td>
                <td className="p-3 text-muted-foreground">{p.profiles?.company_name || p.profiles?.full_name || '–'}</td>
                <td className="p-3"><span className={cn('text-xs font-semibold rounded-full px-2 py-0.5', p.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground')}>{p.status}</span></td>
                <td className="p-3">{p.offer_count || 0}</td>
                <td className="p-3 text-muted-foreground">{timeAgo(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-muted-foreground">Inga uppdrag hittades.</p>}
      </div>
    </AdminLayout>
  )
}

export default AdminProjects
