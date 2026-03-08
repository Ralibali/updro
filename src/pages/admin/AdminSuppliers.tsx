import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { Input } from '@/components/ui/input'
import { Search, Star, CheckCircle2 } from 'lucide-react'

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('supplier_profiles')
        .select('*, profiles!supplier_profiles_id_fkey(full_name, email, company_name)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (data) setSuppliers(data)
    }
    fetch()
  }, [])

  const filtered = suppliers.filter(s =>
    (s.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.profiles?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.profiles?.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Byråer</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök byrå..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
      </div>
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Byrå</th>
            <th className="text-left p-3 font-medium">Kontakt</th>
            <th className="text-left p-3 font-medium">Plan</th>
            <th className="text-left p-3 font-medium">Credits</th>
            <th className="text-left p-3 font-medium">Betyg</th>
            <th className="text-left p-3 font-medium">Status</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <Link to={`/admin/anvandare/${s.id}`} className="font-medium text-primary hover:underline">
                    {s.profiles?.company_name || s.profiles?.full_name || s.slug}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{s.profiles?.email || '–'}</td>
                <td className="p-3">
                  <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 capitalize">{s.plan || 'none'}</span>
                </td>
                <td className="p-3 font-medium">{s.lead_credits || 0}</td>
                <td className="p-3">
                  <span className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 text-brand-amber fill-brand-amber" />
                    {s.avg_rating || 0} ({s.review_count || 0})
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {s.is_verified && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    {s.is_featured && <Star className="h-4 w-4 text-brand-amber fill-brand-amber" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-muted-foreground">Inga byråer hittades.</p>}
      </div>
    </AdminLayout>
  )
}

export default AdminSuppliers
