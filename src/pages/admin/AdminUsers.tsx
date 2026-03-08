import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { timeAgo } from '@/lib/dateUtils'

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { if (data) setUsers(data) })
  }, [])

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Användare</h1>
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Namn</th>
            <th className="text-left p-3 font-medium">E-post</th>
            <th className="text-left p-3 font-medium">Roll</th>
            <th className="text-left p-3 font-medium">Stad</th>
            <th className="text-left p-3 font-medium">Registrerad</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 font-medium">{u.full_name || '–'}</td>
                <td className="p-3 text-muted-foreground">{u.email || '–'}</td>
                <td className="p-3"><span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${u.role === 'supplier' ? 'bg-primary/10 text-primary' : u.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>{u.role}</span></td>
                <td className="p-3 text-muted-foreground">{u.city || '–'}</td>
                <td className="p-3 text-muted-foreground">{timeAgo(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}

export default AdminUsers
