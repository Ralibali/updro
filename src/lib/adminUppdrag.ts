export const ADMIN_PROJECT_DELETE_ACTION = 'delete_project'
export const PROJECTS_GUEST_LEAD_ID_UNIQUE_INDEX = 'projects_guest_lead_id_key'
export const GUEST_LEAD_ID_UNIQUE_VIOLATION = `duplicate key value violates unique constraint "${PROJECTS_GUEST_LEAD_ID_UNIQUE_INDEX}"`

export type AdminGuestLead = {
  id: string
  title: string
  description?: string | null
  category: string
  budget_range?: string | null
  start_time?: string | null
  is_company?: boolean | null
  source?: string | null
  full_name?: string | null
  company_name?: string | null
  email?: string | null
  phone?: string | null
  created_at?: string | null
}

export type AdminProjectRow = {
  id: string
  title?: string | null
  status?: string | null
  category?: string | null
  guest_lead_id?: string | null
  buyer_id?: string | null
  guest_leads?: {
    id?: string
    email?: string | null
    full_name?: string | null
    company_name?: string | null
    title?: string | null
    phone?: string | null
  } | null
  [key: string]: unknown
}

const GUEST_LEAD_SELECT =
  'id, title, description, category, budget_range, start_time, is_company, source, full_name, company_name, email, phone, created_at'

const PROJECT_SELECT =
  '*, profiles!projects_buyer_id_fkey(full_name, company_name, email, phone, city), guest_leads!projects_guest_lead_id_fkey(full_name, company_name, email, phone)'

export const findOrphanGuestLeads = <T extends { id: string }>(
  guestLeads: T[],
  attachedGuestLeadIds: Array<string | null | undefined>,
): T[] => {
  const attached = new Set(
    attachedGuestLeadIds.filter((id): id is string => typeof id === 'string' && id.length > 0),
  )
  return guestLeads.filter(lead => !attached.has(lead.id))
}

export const buildAdminProjectDeleteAudit = (adminId: string, project: AdminProjectRow) => {
  const guestLeadId = project.guest_lead_id ?? project.guest_leads?.id ?? null
  return {
    admin_id: adminId,
    action: ADMIN_PROJECT_DELETE_ACTION,
    target_type: 'project',
    target_id: project.id,
    details: {
      title: project.title ?? null,
      status: project.status ?? null,
      category: project.category ?? null,
      buyer_id: project.buyer_id ?? null,
      guest_lead_id: guestLeadId,
      orphaned_guest_lead: Boolean(guestLeadId),
      guest_lead: guestLeadId
        ? {
            id: guestLeadId,
            email: project.guest_leads?.email ?? null,
            full_name: project.guest_leads?.full_name ?? null,
            company_name: project.guest_leads?.company_name ?? null,
            title: project.guest_leads?.title ?? project.title ?? null,
            phone: project.guest_leads?.phone ?? null,
          }
        : null,
    },
  }
}

export const attachProjectGuestLeadId = <T extends { id: string; guest_lead_id?: string | null }>(
  projects: T[],
  project: T,
): T[] => {
  if (project.guest_lead_id) {
    const taken = projects.some(
      existing => existing.id !== project.id && existing.guest_lead_id === project.guest_lead_id,
    )
    if (taken) {
      const error = new Error(GUEST_LEAD_ID_UNIQUE_VIOLATION) as Error & { code: string }
      error.code = '23505'
      throw error
    }
  }
  return [...projects.filter(existing => existing.id !== project.id), project]
}

type SupabaseLike = {
  from: (table: string) => any
  auth?: { getUser: () => Promise<{ data: { user: { id: string } | null } }> }
}

export const loadAdminUppdrag = async (client: SupabaseLike) => {
  const [projectsRes, leadsRes] = await Promise.all([
    client
      .from('projects')
      .select(PROJECT_SELECT)
      .order('created_at', { ascending: false })
      .limit(500),
    client
      .from('guest_leads')
      .select(GUEST_LEAD_SELECT)
      .order('created_at', { ascending: false }),
  ])

  if (projectsRes.error) throw projectsRes.error

  const projects = (projectsRes.data || []) as AdminProjectRow[]
  const guestLeads = leadsRes.error ? [] : ((leadsRes.data || []) as AdminGuestLead[])

  return {
    projects,
    orphanGuestLeads: findOrphanGuestLeads(
      guestLeads,
      projects.map(project => project.guest_lead_id),
    ),
    orphanError: leadsRes.error ?? null,
  }
}

export const deleteAdminProject = async (
  client: SupabaseLike,
  adminId: string,
  project: AdminProjectRow,
) => {
  if (!adminId) throw new Error('Saknar admin-id för audit.')

  const { error: auditError } = await client
    .from('audit_log')
    .insert(buildAdminProjectDeleteAudit(adminId, project))
  if (auditError) throw auditError

  const { error: deleteError } = await client.from('projects').delete().eq('id', project.id)
  if (deleteError) throw deleteError
}
