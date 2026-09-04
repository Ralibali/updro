import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, Loader2, Mail, Search, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from './AdminDashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { exportCsv } from '@/lib/exportCsv'

type Subscriber = {
  id: string
  email: string
  full_name: string | null
  source: string | null
  created_at: string
  unsubscribed_at: string | null
}

const AdminNewsletter = () => {
  const [rows, setRows] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, full_name, source, created_at, unsubscribed_at')
      .order('created_at', { ascending: false })
      .limit(2000)
    setLoading(false)
    if (error) {
      toast.error('Kunde inte hämta prenumeranter.')
      return
    }
    setRows((data || []) as Subscriber[])
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => r.email.toLowerCase().includes(q) || (r.full_name || '').toLowerCase().includes(q))
  }, [rows, query])

  const active = filtered.filter(r => !r.unsubscribed_at)

  const toggleSubscription = async (row: Subscriber) => {
    const unsubscribed_at = row.unsubscribed_at ? null : new Date().toISOString()
    const { error } = await supabase.from('newsletter_subscribers').update({ unsubscribed_at }).eq('id', row.id)
    if (error) { toast.error('Kunde inte uppdatera.'); return }
    setRows(previous => previous.map(r => (r.id === row.id ? { ...r, unsubscribed_at } : r)))
  }

  const remove = async (row: Subscriber) => {
    if (!confirm(`Ta bort ${row.email} ur registret?`)) return
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', row.id)
    if (error) { toast.error('Kunde inte ta bort.'); return }
    setRows(previous => previous.filter(r => r.id !== row.id))
  }

  const copyActive = async () => {
    if (!active.length) { toast.info('Inga aktiva prenumeranter att kopiera.'); return }
    await navigator.clipboard.writeText(active.map(r => r.email).join(', '))
    toast.success(`${active.length} e-postadresser kopierade.`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Mail className="h-6 w-6 text-primary" />Nyhetsbrev</h1>
            <p className="text-sm text-muted-foreground">Register över alla som tackat ja till nyheter och information.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyActive}><Copy className="mr-2 h-4 w-4" />Kopiera aktiva</Button>
            <Button
              variant="outline"
              onClick={() => exportCsv(filtered.map(r => ({
                epost: r.email,
                namn: r.full_name || '',
                kalla: r.source || '',
                status: r.unsubscribed_at ? 'avregistrerad' : 'aktiv',
                registrerad: new Date(r.created_at).toLocaleDateString('sv-SE'),
              })), 'nyhetsbrev-prenumeranter')}
            >
              <Download className="mr-2 h-4 w-4" />Exportera CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Aktiva</p><p className="text-2xl font-bold">{rows.filter(r => !r.unsubscribed_at).length}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Avregistrerade</p><p className="text-2xl font-bold">{rows.filter(r => r.unsubscribed_at).length}</p></div>
          <div className="rounded-xl border bg-card p-4"><p className="text-xs text-muted-foreground">Totalt</p><p className="text-2xl font-bold">{rows.length}</p></div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök e-post eller namn" className="pl-9 rounded-xl" />
        </div>

        <div className="rounded-xl border bg-card overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">Inga prenumeranter ännu.</p>
          ) : (
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-3 font-medium">E-post</th>
                  <th className="p-3 font-medium">Namn</th>
                  <th className="p-3 font-medium">Källa</th>
                  <th className="p-3 font-medium">Datum</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3 font-medium">{row.email}</td>
                    <td className="p-3 text-muted-foreground">{row.full_name || '–'}</td>
                    <td className="p-3 text-muted-foreground">{row.source || '–'}</td>
                    <td className="p-3 text-muted-foreground">{new Date(row.created_at).toLocaleDateString('sv-SE')}</td>
                    <td className="p-3">
                      {row.unsubscribed_at
                        ? <Badge variant="secondary">Avregistrerad</Badge>
                        : <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Aktiv</Badge>}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => toggleSubscription(row)} title={row.unsubscribed_at ? 'Återaktivera' : 'Avregistrera'}>
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(row)} title="Ta bort">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminNewsletter
