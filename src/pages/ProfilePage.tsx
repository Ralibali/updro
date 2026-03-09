import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

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
    contact_name: supplierProfile?.contact_name || '',
    contact_email: supplierProfile?.contact_email || '',
    contact_phone: supplierProfile?.contact_phone || '',
    org_number: supplierProfile?.org_number || '',
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
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        org_number: form.org_number || null,
      }).eq('id', user.id)
    }

    await refreshProfile()
    setLoading(false)
    toast.success('Profil uppdaterad!')
  }

  return (
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
              <div>
                <Label>Org-nummer</Label>
                <Input value={form.org_number} onChange={e => setForm(p => ({ ...p, org_number: e.target.value }))} className="rounded-xl mt-1" placeholder="XXXXXX-XXXX" />
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h2 className="font-display text-lg font-semibold mb-3">Kontaktperson</h2>
                <p className="text-sm text-muted-foreground mb-4">Visas för beställare som vill nå er direkt.</p>
                <div className="space-y-4">
                  <div>
                    <Label>Kontaktpersonens namn</Label>
                    <Input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label>Kontakt e-post</Label>
                    <Input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label>Kontakt telefon</Label>
                    <Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} className="rounded-xl mt-1" />
                  </div>
                </div>
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
