import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Star, CheckCircle2, X, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [editSupplier, setEditSupplier] = useState<any>(null)

  const fetchSuppliers = async () => {
    const { data } = await supabase
      .from('supplier_profiles')
      .select('*, profiles!supplier_profiles_id_fkey(full_name, email, company_name, city, phone)')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setSuppliers(data)
  }

  useEffect(() => { fetchSuppliers() }, [])

  const filtered = suppliers.filter(s =>
    (s.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.profiles?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.profiles?.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.org_number || '').includes(search) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    if (!editSupplier) return
    const { error } = await supabase.from('supplier_profiles').update({
      is_verified: editSupplier.is_verified,
      has_fskatt: editSupplier.has_fskatt,
      has_fskatt_verified_at: editSupplier.has_fskatt ? new Date().toISOString() : null,
      credit_check_passed: editSupplier.credit_check_passed,
      credit_check_at: editSupplier.credit_check_passed ? new Date().toISOString() : null,
      is_featured: editSupplier.is_featured,
      org_number: editSupplier.org_number,
      plan: editSupplier.plan,
      lead_credits: editSupplier.lead_credits,
    }).eq('id', editSupplier.id)

    if (error) {
      toast.error('Kunde inte spara')
    } else {
      toast.success('Byrå uppdaterad!')
      // Send notification if newly verified
      await supabase.from('notifications').insert({
        user_id: editSupplier.id,
        type: 'supplier_verified',
        title: '✅ Din byrå är nu verifierad på Updro',
        message: 'Grattis! Din byrå har blivit verifierad. Detta visas för beställare och ökar dina chanser att bli vald.',
      })
      setEditSupplier(null)
      fetchSuppliers()
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Byråer</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök byrå / org.nr..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
      </div>
      <div className="bg-card rounded-xl border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Byrå</th>
            <th className="text-left p-3 font-medium">Org.nr</th>
            <th className="text-left p-3 font-medium">Kontakt</th>
            <th className="text-left p-3 font-medium">Plan</th>
            <th className="text-left p-3 font-medium">Credits</th>
            <th className="text-left p-3 font-medium">Betyg</th>
            <th className="text-left p-3 font-medium">Verifiering</th>
            <th className="text-left p-3 font-medium">Åtgärd</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <p className="font-medium">{s.profiles?.company_name || s.profiles?.full_name || s.slug}</p>
                  <p className="text-xs text-muted-foreground">{s.profiles?.city}</p>
                </td>
                <td className="p-3 text-muted-foreground font-mono text-xs">{s.org_number || '–'}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  <p>{s.profiles?.email}</p>
                  <p>{s.profiles?.phone}</p>
                </td>
                <td className="p-3">
                  <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 capitalize">{s.plan || 'none'}</span>
                </td>
                <td className="p-3 font-medium">{s.lead_credits || 0}</td>
                <td className="p-3">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {s.avg_rating || 0} ({s.review_count || 0})
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-0.5 text-xs">
                    {s.is_verified && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Verifierad</span>}
                    {s.has_fskatt && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> F-skatt</span>}
                    {s.credit_check_passed && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Kreditkoll</span>}
                    {!s.is_verified && !s.has_fskatt && !s.credit_check_passed && <span className="text-muted-foreground">Ej verifierad</span>}
                  </div>
                </td>
                <td className="p-3">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setEditSupplier({ ...s })}>
                    Redigera
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-muted-foreground">Inga byråer hittades.</p>}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editSupplier} onOpenChange={() => setEditSupplier(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Redigera: {editSupplier?.profiles?.company_name || editSupplier?.profiles?.full_name}
            </DialogTitle>
          </DialogHeader>
          {editSupplier && (
            <div className="space-y-5 mt-2">
              {/* Org number */}
              <div>
                <Label className="text-sm font-medium">Organisationsnummer</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={editSupplier.org_number || ''}
                    onChange={e => setEditSupplier({ ...editSupplier, org_number: e.target.value })}
                    placeholder="XXXXXX-XXXX"
                    className="rounded-xl"
                  />
                  {editSupplier.org_number && (
                    <a
                      href={`https://www.allabolag.se/${(editSupplier.org_number || '').replace('-', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="rounded-xl whitespace-nowrap">
                        <ExternalLink className="h-3 w-3 mr-1" /> Allabolag
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Verification toggles */}
              <div className="space-y-4 border rounded-xl p-4">
                <h4 className="font-semibold text-sm">Verifiering</h4>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Verifierad byrå</Label>
                  <Switch checked={editSupplier.is_verified || false} onCheckedChange={v => setEditSupplier({ ...editSupplier, is_verified: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Godkänd F-skatt & moms</Label>
                  <Switch checked={editSupplier.has_fskatt || false} onCheckedChange={v => setEditSupplier({ ...editSupplier, has_fskatt: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Godkänd kreditkontroll</Label>
                  <Switch checked={editSupplier.credit_check_passed || false} onCheckedChange={v => setEditSupplier({ ...editSupplier, credit_check_passed: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Framhävd (featured)</Label>
                  <Switch checked={editSupplier.is_featured || false} onCheckedChange={v => setEditSupplier({ ...editSupplier, is_featured: v })} />
                </div>
              </div>

              {/* Plan & credits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <select
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-background"
                    value={editSupplier.plan || 'none'}
                    onChange={e => setEditSupplier({ ...editSupplier, plan: e.target.value })}
                  >
                    <option value="none">Ingen</option>
                    <option value="trial">Trial</option>
                    <option value="payg">Pay as you go</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Lead credits</Label>
                  <Input
                    type="number"
                    className="mt-1 rounded-xl"
                    value={editSupplier.lead_credits || 0}
                    onChange={e => setEditSupplier({ ...editSupplier, lead_credits: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* TODO: Integrera Roaring.io API för automatisk F-skattekontroll */}
              {/* https://www.roaring.io */}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditSupplier(null)}>Avbryt</Button>
                <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90" onClick={handleSave}>Spara ändringar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}

export default AdminSuppliers
