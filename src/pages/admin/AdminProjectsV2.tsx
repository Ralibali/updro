import { Fragment, useEffect, useState } from 'react'
import { Building2, CheckCircle, ChevronDown, ChevronUp, Download, Mail, Phone, Search, Trash2, User, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from './AdminDashboard'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { BUDGET_LABELS, CATEGORY_STYLES, START_TIME_LABELS } from '@/lib/constants'
import { getProjectBuyerContact } from '@/lib/buyerContact'
import { timeAgo } from '@/lib/dateUtils'
import { exportCsv } from '@/lib/exportCsv'
import { cn } from '@/lib/utils'

const statuses = ['all', 'pending', 'active', 'closed', 'rejected', 'completed', 'draft']

const statusClass = (status: string) => {
  if (status === 'active') return 'bg-accent/10 text-accent'
  if (status === 'pending') return 'bg-yellow-50 text-yellow-700'
  if (status === 'rejected') return 'bg-red-50 text-red-700'
  return 'bg-muted text-muted-foreground'
}

const AdminProjectsV2 = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*, profiles!projects_buyer_id_fkey(full_name, company_name, email, phone, city), guest_leads!projects_guest_lead_id_fkey(full_name, company_name, email, phone)')
      .order('created_at', { ascending: false })
      .limit(500)
    setLoading(false)
    if (error) {
      console.error(error)
      toast.error('Kunde inte hämta uppdragen.')
      return
    }
    setProjects(data || [])
  }

  useEffect(() => { load() }, [])

  const changeStatus = async (id: string, next: 'active' | 'rejected') => {
    const { error } = await supabase.from('projects').update({ status: next }).eq('id', id)
    if (error) return toast.error('Kunde inte uppdatera uppdraget.')
    toast.success(next === 'active' ? 'Uppdrag godkänt! ✅' : 'Uppdrag avvisat.')
    load()
  }

  const remove = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (error) return toast.error('Kunde inte ta bort: ' + error.message)
    setDeleteTarget(null)
    toast.success('Uppdraget har tagits bort.')
    load()
  }

  const needle = search.trim().toLowerCase()
  const filtered = projects.filter(project => {
    const buyer = getProjectBuyerContact(project)
    const haystack = [project.title, project.category, buyer?.full_name, buyer?.company_name, buyer?.email]
      .filter(Boolean).join(' ').toLowerCase()
    return (!needle || haystack.includes(needle)) && (status === 'all' || project.status === status)
  })
  const pending = projects.filter(project => project.status === 'pending').length

  const download = () => exportCsv(filtered.map(project => {
    const buyer = getProjectBuyerContact(project)
    return {
      Titel: project.title,
      Kategori: project.category,
      Budget: BUDGET_LABELS[project.budget_range] || '–',
      Beställare: buyer?.company_name || buyer?.full_name || '–',
      'E-post': buyer?.email || '–',
      Telefon: buyer?.phone || '–',
      Källa: project.guest_lead_id ? 'Gästlead' : 'Registrerad',
      Status: project.status,
      Offerter: project.offer_count || 0,
      Skapad: project.created_at ? new Date(project.created_at).toLocaleDateString('sv-SE') : '',
    }
  }), 'uppdrag')

  return (
    <AdminLayout>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold">Uppdrag</h1>
          {pending > 0 && <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-1 rounded-full">{pending} väntar</span>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {statuses.map(item => <Button key={item} size="sm" variant={status === item ? 'default' : 'outline'} onClick={() => setStatus(item)}>{item === 'all' ? 'Alla' : item}</Button>)}
          <div className="relative w-60"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" placeholder="Sök uppdrag eller kontakt..." value={search} onChange={event => setSearch(event.target.value)} /></div>
          <Button size="sm" variant="outline" onClick={download}><Download className="h-4 w-4 mr-1" />CSV</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead><tr className="border-b bg-muted/50"><th className="p-3 w-8" /><th className="text-left p-3">Titel</th><th className="text-left p-3">Kategori</th><th className="text-left p-3">Beställare</th><th className="text-left p-3">Status</th><th className="text-left p-3">Offerter</th><th className="text-left p-3">Skapad</th><th className="text-left p-3">Åtgärd</th></tr></thead>
          <tbody>
            {filtered.map(project => {
              const buyer = getProjectBuyerContact(project)
              return <Fragment key={project.id}>
                <tr className={cn('border-b hover:bg-muted/30 cursor-pointer', project.status === 'pending' && 'bg-yellow-50/30')} onClick={() => setExpanded(expanded === project.id ? null : project.id)}>
                  <td className="p-3">{expanded === project.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</td>
                  <td className="p-3 font-medium max-w-56 truncate">{project.title}</td>
                  <td className="p-3"><span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', CATEGORY_STYLES[project.category] || '')}>{project.category}</span></td>
                  <td className="p-3"><div>{buyer?.company_name || buyer?.full_name || '–'}</div>{project.guest_lead_id && <span className="text-[10px] text-primary">Gästlead</span>}</td>
                  <td className="p-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusClass(project.status))}>{project.status}</span></td>
                  <td className="p-3">{project.offer_count || 0}</td><td className="p-3 text-muted-foreground">{timeAgo(project.created_at)}</td>
                  <td className="p-3" onClick={event => event.stopPropagation()}><div className="flex gap-1">{project.status === 'pending' && <><Button size="sm" variant="outline" onClick={() => changeStatus(project.id, 'active')}><CheckCircle className="h-3 w-3 mr-1" />Godkänn</Button><Button size="sm" variant="outline" onClick={() => changeStatus(project.id, 'rejected')}><XCircle className="h-3 w-3 mr-1" />Avvisa</Button></>}<Button size="icon" variant="ghost" onClick={() => setDeleteTarget(project)}><Trash2 className="h-4 w-4" /></Button></div></td>
                </tr>
                {expanded === project.id && <tr className="border-b bg-muted/20"><td colSpan={8} className="p-5"><div className="space-y-4">
                  <div className="rounded-lg border bg-background p-4"><p className="text-xs font-semibold text-muted-foreground mb-2">Beskrivning</p><p className="whitespace-pre-wrap">{project.description || 'Ingen beskrivning angiven.'}</p></div>
                  <div className="grid sm:grid-cols-3 gap-3 text-sm"><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Budget</p><p className="font-medium">{BUDGET_LABELS[project.budget_range] || '–'}</p></div><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Önskad start</p><p className="font-medium">{START_TIME_LABELS[project.start_time] || '–'}</p></div><div className="rounded-lg border bg-background p-3"><p className="text-xs text-muted-foreground">Kundtyp</p><p className="font-medium flex items-center gap-1">{project.is_company ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}{project.is_company ? 'Företag' : 'Privatperson'}</p></div></div>
                  <div className="rounded-lg border bg-background p-4"><p className="text-xs font-semibold text-muted-foreground mb-2">Beställarens uppgifter {project.guest_lead_id ? '(gästlead)' : ''}</p><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"><span>{buyer?.full_name || '–'}</span><span>{buyer?.company_name || '–'}</span><span className="flex gap-1 items-center"><Mail className="h-4 w-4" />{buyer?.email ? <a className="text-primary hover:underline" href={`mailto:${buyer.email}`}>{buyer.email}</a> : '–'}</span><span className="flex gap-1 items-center"><Phone className="h-4 w-4" />{buyer?.phone ? <a className="text-primary hover:underline" href={`tel:${buyer.phone}`}>{buyer.phone}</a> : '–'}</span></div></div>
                </div></td></tr>}
              </Fragment>
            })}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-muted-foreground">Hämtar uppdrag…</p>}
        {!loading && filtered.length === 0 && <p className="p-6 text-center text-muted-foreground">Inga uppdrag hittades.</p>}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}><DialogContent><DialogHeader><DialogTitle>Ta bort uppdrag?</DialogTitle><DialogDescription>Vill du verkligen ta bort ”{deleteTarget?.title}”? Åtgärden kan inte ångras.</DialogDescription></DialogHeader><div className="flex gap-3 mt-4"><Button variant="outline" onClick={() => setDeleteTarget(null)}>Avbryt</Button><Button variant="destructive" onClick={remove} disabled={deleting}>{deleting ? 'Tar bort…' : 'Ta bort'}</Button></div></DialogContent></Dialog>
    </AdminLayout>
  )
}

export default AdminProjectsV2
