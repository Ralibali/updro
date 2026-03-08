import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Home, ClipboardList, MessageCircle, UserCircle, Star, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BUDGET_LABELS, START_TIME_LABELS, CATEGORY_STYLES } from '@/lib/constants'
import { timeAgo, formatPrice } from '@/lib/dateUtils'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const navItems = [
  { label: 'Översikt', href: '/dashboard/buyer', icon: Home },
  { label: 'Mina uppdrag', href: '/dashboard/buyer/uppdrag', icon: ClipboardList },
  { label: 'Meddelanden', href: '/dashboard/buyer/chatt', icon: MessageCircle },
  { label: 'Min profil', href: '/dashboard/buyer/profil', icon: UserCircle },
]

const ProjectDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [confirmOffer, setConfirmOffer] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
      if (proj) setProject(proj)

      const { data: offs } = await supabase.from('offers').select('*, profiles!offers_supplier_id_fkey(full_name, company_name, city, avatar_url)').eq('project_id', id).order('created_at', { ascending: false })
      if (offs) setOffers(offs)
    }
    fetchData()
  }, [id])

  const handleAccept = async (offerId: string) => {
    const { error } = await supabase.from('offers').update({ status: 'accepted' }).eq('id', offerId)
    if (!error) {
      // Decline all other offers
      await supabase.from('offers').update({ status: 'declined' }).eq('project_id', id).neq('id', offerId)
      await supabase.from('projects').update({ status: 'closed' }).eq('id', id)
      toast.success('Offert accepterad! 🎉')
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' } : { ...o, status: 'declined' }))
      setProject((prev: any) => prev ? { ...prev, status: 'closed' } : prev)
    }
    setConfirmOffer(null)
  }

  const handleDecline = async (offerId: string) => {
    await supabase.from('offers').update({ status: 'declined' }).eq('id', offerId)
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'declined' } : o))
    toast.info('Offert avböjd')
  }

  if (!project) return <DashboardLayout navItems={navItems}><div className="animate-pulse h-40 bg-muted rounded-xl" /></DashboardLayout>

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl">
        <div className="mb-6">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${CATEGORY_STYLES[project.category] || ''}`}>{project.category}</span>
          <h1 className="font-display text-2xl font-bold">{project.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span>{BUDGET_LABELS[project.budget_range] || 'Ej angiven'}</span>
            <span>{START_TIME_LABELS[project.start_time] || ''}</span>
            <span>{project.city}</span>
            <span>{timeAgo(project.created_at)}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 mb-8">
          <h3 className="font-semibold mb-2">Beskrivning</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
        </div>

        <h2 className="font-display text-lg font-semibold mb-4">Mottagna offerter ({offers.length})</h2>

        {offers.length === 0 ? (
          <div className="bg-card rounded-xl border p-6 text-center">
            <p className="text-muted-foreground">Inga offerter ännu. Byråer matchar vanligtvis inom 24 timmar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{offer.profiles?.company_name || offer.profiles?.full_name}</h3>
                    <p className="text-xs text-muted-foreground">{offer.profiles?.city} · {timeAgo(offer.created_at)}</p>
                  </div>
                  <span className={`text-xs font-semibold rounded-full px-2 py-1 ${
                    offer.status === 'accepted' ? 'bg-accent/10 text-accent' :
                    offer.status === 'declined' ? 'bg-destructive/10 text-destructive' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {offer.status === 'pending' ? 'Ny' : offer.status === 'accepted' ? 'Accepterad' : 'Avböjd'}
                  </span>
                </div>

                <h4 className="font-medium">{offer.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="font-bold text-lg text-primary">{formatPrice(offer.price)}</span>
                  {offer.delivery_weeks && <span className="text-muted-foreground">{offer.delivery_weeks} veckor</span>}
                  {offer.payment_plan && <span className="text-muted-foreground capitalize">{offer.payment_plan}</span>}
                </div>

                {offer.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => setConfirmOffer(offer)} className="bg-accent hover:bg-brand-mint-hover text-accent-foreground">
                      <Check className="mr-1 h-3 w-3" /> Acceptera
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(offer.id)}>
                      <X className="mr-1 h-3 w-3" /> Avböj
                    </Button>
                    <Link to={`/dashboard/buyer/chatt?project=${id}&user=${offer.supplier_id}`}>
                      <Button size="sm" variant="outline">💬 Chatta</Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmOffer} onOpenChange={() => setConfirmOffer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceptera offert?</DialogTitle>
            <DialogDescription>
              Acceptera offert från {confirmOffer?.profiles?.company_name || confirmOffer?.profiles?.full_name}?
              Övriga offerter markeras som avböjda.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmOffer(null)}>Avbryt</Button>
            <Button onClick={() => handleAccept(confirmOffer.id)} className="bg-accent hover:bg-brand-mint-hover text-accent-foreground">
              Bekräfta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

export default ProjectDetail
