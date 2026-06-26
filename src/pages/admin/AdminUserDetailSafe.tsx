import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { AdminLayout } from './AdminDashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { timeAgo } from '@/lib/dateUtils'

const PLAN_LABELS: Record<string, string> = {
  none: 'Ingen plan', trial: 'Provperiod', lead: 'Pay per lead', monthly: 'Månadskort',
  payg: 'Äldre pay-as-you-go', standard: 'Äldre standardplan', premium: 'Äldre premiumplan',
}

const AdminUserDetailSafe = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [supplier, setSupplier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')

  const load = async () => {
    if (!id) return
    setLoading(true)
    const [{ data: nextProfile, error }, { data: nextSupplier }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('supplier_profiles').select('*').eq('id', id).maybeSingle(),
    ])
    setLoading(false)
    if (error || !nextProfile) {
      toast.error('Användaren kunde inte hämtas.')
      return
    }
    setProfile(nextProfile)
    setSupplier(nextSupplier || null)
    setFullName(nextProfile.full_name || '')
    setCompanyName(nextProfile.company_name || '')
    setPhone(nextProfile.phone || '')
  }

  useEffect(() => { load() }, [id])

  const save = async () => {
    if (!id || fullName.trim().length < 2) return toast.error('Ange ett giltigt namn.')
    setSaving(true)
    const changes = { full_name: fullName.trim(), company_name: companyName.trim() || null, phone: phone.trim() || null }
    const { error } = await supabase.from('profiles').update(changes).eq('id', id)
    setSaving(false)
    if (error) return toast.error('Kunde inte spara: ' + error.message)
    setProfile({ ...profile, ...changes })
    toast.success('Profilen är uppdaterad.')
  }

  const toggleVerification = async (field: 'is_bankid_verified' | 'is_phone_verified') => {
    if (!id || !profile) return
    const value = !profile[field]
    const { error } = await supabase.from('profiles').update({ [field]: value } as any).eq('id', id)
    if (error) return toast.error('Kunde inte uppdatera verifieringen.')
    setProfile({ ...profile, [field]: value })
    toast.success('Verifieringen är uppdaterad.')
  }

  const toggleSupplierFlag = async (field: 'is_featured' | 'is_verified') => {
    if (!id || !supplier) return
    const value = !supplier[field]
    const { error } = await supabase.from('supplier_profiles').update({ [field]: value }).eq('id', id)
    if (error) return toast.error('Kunde inte uppdatera byrån.')
    setSupplier({ ...supplier, [field]: value })
    toast.success('Byråinställningen är uppdaterad.')
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" /></div></AdminLayout>
  if (!profile) return <AdminLayout><p>Användaren hittades inte.</p></AdminLayout>

  return <AdminLayout>
    <button onClick={() => navigate('/admin/anvandare')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4" />Tillbaka till användare</button>
    <div className="flex items-center gap-4 mb-6"><div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{(fullName || '?').slice(0, 2).toUpperCase()}</div><div><h1 className="font-display text-2xl font-bold">{fullName || 'Okänd'}</h1><p className="text-sm text-muted-foreground">{profile.email} · {profile.role} · Registrerad {timeAgo(profile.created_at)}</p></div></div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-card rounded-xl border p-5 space-y-4">
        <h2 className="font-display font-semibold text-lg">Profilinformation</h2>
        <div><Label>Namn</Label><Input value={fullName} onChange={event => setFullName(event.target.value)} className="mt-1" /></div>
        <div><Label>E-postadress</Label><Input value={profile.email || ''} disabled className="mt-1" /><p className="text-xs text-muted-foreground mt-1">Inloggningsadressen hanteras av Supabase Auth och ändras inte enbart i profiltabellen.</p></div>
        <div><Label>Företag</Label><Input value={companyName} onChange={event => setCompanyName(event.target.value)} className="mt-1" /></div>
        <div><Label>Telefon</Label><Input value={phone} onChange={event => setPhone(event.target.value)} className="mt-1" /></div>
        <div><Label>Roll</Label><Input value={profile.role || ''} disabled className="mt-1 capitalize" /><p className="text-xs text-muted-foreground mt-1">Rollbyte kräver tillhörande kontodata och görs därför inte från denna vy.</p></div>
        <Button onClick={save} disabled={saving} className="w-full"><Save className="h-4 w-4 mr-2" />{saving ? 'Sparar...' : 'Spara profil'}</Button>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-xl border p-5 space-y-3"><h2 className="font-display font-semibold text-lg">Verifiering</h2>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3"><span className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-emerald-600" />BankID-verifierad</span><Button size="sm" variant={profile.is_bankid_verified ? 'default' : 'outline'} onClick={() => toggleVerification('is_bankid_verified')}>{profile.is_bankid_verified ? 'Verifierad ✓' : 'Sätt verifierad'}</Button></div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3"><span className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-blue-600" />Telefon-verifierad</span><Button size="sm" variant={profile.is_phone_verified ? 'default' : 'outline'} onClick={() => toggleVerification('is_phone_verified')}>{profile.is_phone_verified ? 'Verifierad ✓' : 'Sätt verifierad'}</Button></div>
        </div>

        {supplier && <div className="bg-card rounded-xl border p-5 space-y-4"><h2 className="font-display font-semibold text-lg">Byråstatus</h2>
          <div className="grid grid-cols-2 gap-3"><div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">Lead-credits</p><p className="text-xl font-bold">{supplier.lead_credits || 0}</p></div><div className="bg-muted/50 rounded-lg p-3"><p className="text-xs text-muted-foreground">Plan</p><p className="text-lg font-bold">{PLAN_LABELS[supplier.plan] || supplier.plan || 'Ingen'}</p></div></div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3"><span className="text-sm">Framhävd profil</span><Button size="sm" variant={supplier.is_featured ? 'default' : 'outline'} onClick={() => toggleSupplierFlag('is_featured')}>{supplier.is_featured ? 'Framhävd ★' : 'Gör framhävd'}</Button></div>
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3"><span className="text-sm">Verifierad byrå</span><Button size="sm" variant={supplier.is_verified ? 'default' : 'outline'} onClick={() => toggleSupplierFlag('is_verified')}>{supplier.is_verified ? 'Verifierad ✓' : 'Verifiera byrå'}</Button></div>
          <p className="text-xs text-muted-foreground">Plan och saldo hanteras i byråadministrationen, där ändringen kan granskas separat.</p>
        </div>}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-display font-semibold text-lg text-amber-900 flex items-center gap-2"><ShieldAlert className="h-5 w-5" />Säker kontohantering</h2><p className="text-sm text-amber-800 mt-2">Den tidigare raderingsknappen tog endast bort profiltabeller och kunde lämna ett fortfarande inloggningsbart Auth-konto. Den är borttagen tills fullständig radering kan göras via en servervaliderad rutin.</p></div>
      </div>
    </div>
  </AdminLayout>
}

export default AdminUserDetailSafe
