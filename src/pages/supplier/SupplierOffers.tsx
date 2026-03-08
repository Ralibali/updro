import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import DashboardLayout from '@/components/DashboardLayout'
import { Home, Search, FileText, MessageCircle, UserCircle, CreditCard } from 'lucide-react'
import { CATEGORY_STYLES } from '@/lib/constants'
import { timeAgo, formatPrice } from '@/lib/dateUtils'

const navItems = [
  { label: 'Översikt', href: '/dashboard/supplier', icon: Home },
  { label: 'Uppdrag', href: '/dashboard/supplier/uppdrag', icon: Search },
  { label: 'Offerter', href: '/dashboard/supplier/offerter', icon: FileText },
  { label: 'Meddelanden', href: '/dashboard/supplier/chatt', icon: MessageCircle },
  { label: 'Profil', href: '/dashboard/supplier/profil', icon: UserCircle },
  { label: 'Fakturering', href: '/dashboard/supplier/fakturering', icon: CreditCard },
]

const SupplierOffers = () => {
  const { user } = useAuth()
  const [offers, setOffers] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('offers').select('*, projects(title, category, city)').eq('supplier_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setOffers(data) })
  }, [user])

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-bold mb-6">Mina offerter</h1>

        {offers.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">Du har inte skickat några offerter ännu.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map(o => (
              <div key={o.id} className="bg-card rounded-xl border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold mb-1 ${CATEGORY_STYLES[o.projects?.category] || ''}`}>{o.projects?.category}</span>
                    <h3 className="font-semibold">{o.title}</h3>
                    <p className="text-xs text-muted-foreground">Till: {o.projects?.title} · {timeAgo(o.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold rounded-full px-2 py-1 ${
                      o.status === 'accepted' ? 'bg-accent/10 text-accent' :
                      o.status === 'declined' ? 'bg-destructive/10 text-destructive' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {o.status === 'pending' ? 'Väntande' : o.status === 'accepted' ? 'Accepterad' : 'Avböjd'}
                    </span>
                    <p className="text-lg font-bold mt-1">{formatPrice(o.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default SupplierOffers
