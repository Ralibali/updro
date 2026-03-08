import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Home, Search, FileText, MessageCircle, UserCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BUDGET_LABELS, START_TIME_LABELS, CATEGORY_STYLES } from '@/lib/constants'
import { timeAgo, formatPrice } from '@/lib/dateUtils'
import { toast } from 'sonner'

const navItems = [
  { label: 'Översikt', href: '/dashboard/supplier', icon: Home },
  { label: 'Uppdrag', href: '/dashboard/supplier/uppdrag', icon: Search },
  { label: 'Offerter', href: '/dashboard/supplier/offerter', icon: FileText },
  { label: 'Meddelanden', href: '/dashboard/supplier/chatt', icon: MessageCircle },
  { label: 'Profil', href: '/dashboard/supplier/profil', icon: UserCircle },
  { label: 'Fakturering', href: '/dashboard/supplier/fakturering', icon: CreditCard },
]

const ProjectUnlock = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    delivery_weeks: '',
    payment_plan: 'fixed',
  })

  useEffect(() => {
    if (!id) return
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setProject(data)
    })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id) return
    setLoading(true)

    const { error } = await supabase.from('offers').insert({
      project_id: id,
      supplier_id: user.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      delivery_weeks: parseInt(form.delivery_weeks) || null,
      payment_plan: form.payment_plan,
    })

    // Increment offer count
    if (!error && project) {
      await supabase.from('projects').update({ offer_count: (project.offer_count || 0) + 1 }).eq('id', id)
    }

    setLoading(false)
    if (error) {
      if (error.code === '23505') toast.error('Du har redan skickat en offert på detta uppdrag.')
      else toast.error('Kunde inte skicka offerten.')
    } else {
      toast.success('Offert skickad! 🎉')
      navigate('/dashboard/supplier/offerter')
    }
  }

  if (!project) return <DashboardLayout navItems={navItems}><div className="animate-pulse h-40 bg-muted rounded-xl" /></DashboardLayout>

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-3xl">
        {/* Project info */}
        <div className="bg-card rounded-xl border p-5 mb-6">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${CATEGORY_STYLES[project.category] || ''}`}>{project.category}</span>
          <h1 className="font-display text-xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{project.description}</p>
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            <span>{BUDGET_LABELS[project.budget_range] || ''}</span>
            <span>{START_TIME_LABELS[project.start_time] || ''}</span>
            <span>{project.city}</span>
            <span>{timeAgo(project.created_at)}</span>
          </div>
        </div>

        {/* Offer form */}
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-display text-lg font-semibold mb-4">Skicka offert</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Offert-titel *</Label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-xl mt-1" required />
            </div>
            <div>
              <Label>Beskrivning *</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-xl mt-1 min-h-[120px]" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pris (kr) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="rounded-xl mt-1" required />
              </div>
              <div>
                <Label>Leveranstid (veckor)</Label>
                <Input type="number" value={form.delivery_weeks} onChange={e => setForm(p => ({ ...p, delivery_weeks: e.target.value }))} className="rounded-xl mt-1" />
              </div>
            </div>
            <div>
              <Label>Betalningsmodell</Label>
              <Select value={form.payment_plan} onValueChange={v => setForm(p => ({ ...p, payment_plan: v }))}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fast pris</SelectItem>
                  <SelectItem value="hourly">Timpris</SelectItem>
                  <SelectItem value="milestone">Milstolpar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl py-5">
              {loading ? 'Skickar...' : 'Skicka offert →'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProjectUnlock
