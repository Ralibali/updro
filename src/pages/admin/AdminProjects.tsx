import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { CATEGORY_STYLES, BUDGET_LABELS } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Download, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportCsv } from '@/lib/exportCsv'
import { toast } from 'sonner'

const AdminProjects = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*, profiles!projects_buyer_id_fkey(full_name, company_name, email)').order('created_at', { ascending: false }).limit(500)
    if (data) setProjects(data)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from('projects').update({ status: 'active' }).eq('id', id)
    if (error) { toast.error('Kunde inte godkänna.'); return }
    toast.success('Uppdrag godkänt! ✅')
    fetchProjects()
  }

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('projects').update({ status: 'rejected' }).eq('id', id)
    if (error) { toast.error('Kunde inte avvisa.'); return }
    toast.success('Uppdrag avvisat.')
    fetchProjects()
  }

  const filtered = projects.filter(p => {
    const matchesSearch = (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = projects.filter(p => p.status === 'pending').length

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

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent/10 text-accent'
      case 'pending': return 'bg-yellow-50 text-yellow-700'
      case 'rejected': return 'bg-red-50 text-red-700'
      case 'closed': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">Uppdrag</h1>
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pendingCount} väntar
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {['all', 'pending', 'active', 'closed', 'rejected', 'completed', 'draft'].map(s => (
              <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} className="rounded-xl text-xs" onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'Alla' : s === 'pending' ? `Väntar${pendingCount > 0 ? ` (${pendingCount})` : ''}` : s}
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
            <th className="text-left p-3 font-medium">Åtgärd</th>
          </tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={cn('border-b last:border-0 hover:bg-muted/30', p.status === 'pending' && 'bg-yellow-50/30')}>
                <td className="p-3 font-medium max-w-[200px] truncate">{p.title}</td>
                <td className="p-3"><span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', CATEGORY_STYLES[p.category] || '')}>{p.category}</span></td>
                <td className="p-3 text-muted-foreground">{BUDGET_LABELS[p.budget_range] || '–'}</td>
                <td className="p-3 text-muted-foreground">{p.profiles?.company_name || p.profiles?.full_name || '–'}</td>
                <td className="p-3"><span className={cn('text-xs font-semibold rounded-full px-2 py-0.5', statusColor(p.status))}>{p.status}</span></td>
                <td className="p-3">{p.offer_count || 0}</td>
                <td className="p-3 text-muted-foreground">{timeAgo(p.created_at)}</td>
                <td className="p-3">
                  {p.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="rounded-lg text-xs h-7 px-2 text-accent border-accent/30 hover:bg-accent/10" onClick={() => handleApprove(p.id)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Godkänn
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(p.id)}>
                        <XCircle className="h-3 w-3 mr-1" /> Avvisa
                      </Button>
                    </div>
                  )}
                </td>
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
