import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

export async function loadAdminOverview(client: SupabaseClient<Database>) {
  const results = await Promise.all([
    client.from('profiles').select('id', { count: 'exact', head: true }),
    client.from('supplier_profiles').select('id', { count: 'exact', head: true }),
    client.from('projects').select('id', { count: 'exact', head: true }),
    client.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    client.from('offers').select('id', { count: 'exact', head: true }),
    client.from('unlocked_leads').select('id', { count: 'exact', head: true }),
    client.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('supplier_profiles').select('id', { count: 'exact', head: true }).eq('is_verified', false),
    client.from('guest_leads').select('id, projects!left(id)', { count: 'exact', head: true }).is('projects.id', null),
  ])
  // A missing count or failed request is unknown, never a business zero.
  const counts = results.map(result => {
    if (result.error) throw result.error
    if (result.count == null) throw new Error('Statistik saknas i svaret.')
    return result.count
  })
  const [users, suppliers, projects, activeProjects, offers, totalLeads, pendingProjects, unverifiedSuppliers, orphanLeads] = counts
  const [recentUsers, recentProjects] = await Promise.all([
    client.from('profiles').select('id, full_name, company_name, role').order('created_at', { ascending: false }).limit(5),
    client.from('projects').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])
  if (recentUsers.error) throw recentUsers.error
  if (recentProjects.error) throw recentProjects.error
  return {
    users, suppliers, projects, activeProjects, offers, totalLeads, pendingProjects, unverifiedSuppliers, orphanLeads,
    recentUsers: recentUsers.data ?? [], recentProjects: recentProjects.data ?? [],
  }
}
