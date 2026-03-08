import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Home, ClipboardList, MessageCircle, UserCircle, Search, FileText, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const buyerNav = [
  { label: 'Översikt', href: '/dashboard/buyer', icon: Home },
  { label: 'Mina uppdrag', href: '/dashboard/buyer/uppdrag', icon: ClipboardList },
  { label: 'Meddelanden', href: '/dashboard/buyer/chatt', icon: MessageCircle },
  { label: 'Min profil', href: '/dashboard/buyer/profil', icon: UserCircle },
]

const supplierNav = [
  { label: 'Översikt', href: '/dashboard/supplier', icon: Home },
  { label: 'Uppdrag', href: '/dashboard/supplier/uppdrag', icon: Search },
  { label: 'Offerter', href: '/dashboard/supplier/offerter', icon: FileText },
  { label: 'Meddelanden', href: '/dashboard/supplier/chatt', icon: MessageCircle },
  { label: 'Profil', href: '/dashboard/supplier/profil', icon: UserCircle },
  { label: 'Fakturering', href: '/dashboard/supplier/fakturering', icon: CreditCard },
]

const ProfilePage = () => {
  const { user, profile, supplierProfile, isBuyer, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    company_name: profile?.company_name || '',
    city: profile?.city || '',
    phone: profile?.phone || '',
    bio: supplierProfile?.bio || '',
    website_url: supplierProfile?.website_url || '',
  })

  const handleSave = async () => {
    if (!user) return
    setLoading(true)

    await supabase.from('profiles').update({
      full_name: form.full_name,
      company_name: form.company_name,
      city: form.city,
      phone: form.phone,
    }).eq('id', user.id)

    if (!isBuyer && supplierProfile) {
      await supabase.from('supplier_profiles').update({
        bio: form.bio,
        website_url: form.website_url,
      }).eq('id', user.id)
    }

    await refreshProfile()
    setLoading(false)
    toast.success('Profil uppdaterad!')
  }

  return (
    <DashboardLayout navItems={isBuyer ? buyerNav : supplierNav}>
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-bold mb-6">Min profil</h1>

        <div className="space-y-4">
          <div>
            <Label>Namn</Label>
            <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Företagsnamn</Label>
            <Input value={form.company_name} onChange={e => setForm(p => ({ ...p, company_name: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Stad</Label>
            <Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="rounded-xl mt-1" />
          </div>

          {!isBuyer && (
            <>
              <div>
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="rounded-xl mt-1" />
              </div>
              <div>
                <Label>Hemsida</Label>
                <Input value={form.website_url} onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))} className="rounded-xl mt-1" placeholder="https://..." />
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full bg-primary hover:bg-primary/90 rounded-xl">
            {loading ? 'Sparar...' : 'Spara ändringar'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
