import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { timeAgo } from '@/lib/dateUtils'
import { cn } from '@/lib/utils'

const AdminOffers = () => {
  const { data: offers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('offers')
        .select('*, profiles!offers_supplier_id_fkey(full_name, company_name), projects!offers_project_id_fkey(title)')
        .order('created_at', { ascending: false }).limit(200)
      if (error) throw error
      return data ?? []
    },
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-brand-amber/10 text-brand-amber',
    accepted: 'bg-emerald-100 text-emerald-700',
    declined: 'bg-destructive/10 text-destructive',
    withdrawn: 'bg-muted text-muted-foreground',
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Offerter</h1>
      <div className="bg-card rounded-xl border overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Offert</th>
            <th className="text-left p-3 font-medium">Uppdrag</th>
            <th className="text-left p-3 font-medium">Byrå</th>
            <th className="text-left p-3 font-medium">Pris</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Skapad</th>
          </tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">{o.title}</td>
                <td className="p-3 text-muted-foreground">{o.projects?.title || '–'}</td>
                <td className="p-3 text-muted-foreground">{o.profiles?.company_name || o.profiles?.full_name || '–'}</td>
                <td className="p-3 font-medium">{o.price?.toLocaleString('sv-SE')} kr</td>
                <td className="p-3">
                  <span className={cn('text-xs font-semibold rounded-full px-2 py-0.5', statusColors[o.status] || 'bg-muted text-muted-foreground')}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{timeAgo(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <p role="status" className="p-6 text-center">Hämtar offerter…</p>}
        {isError && <div role="alert" className="p-6"><p>Kunde inte hämta offerterna.</p><Button variant="outline" className="mt-3" onClick={() => refetch()}>Försök igen</Button></div>}
        {!isLoading && !isError && offers.length === 0 && <p className="p-6 text-center text-muted-foreground">Inga offerter ännu.</p>}
      </div>
    </AdminLayout>
  )
}

export default AdminOffers
