import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  ADMIN_PROJECT_DELETE_ACTION,
  attachProjectGuestLeadId,
  buildAdminProjectDeleteAudit,
  deleteAdminProject,
  findOrphanGuestLeads,
  GUEST_LEAD_ID_UNIQUE_VIOLATION,
  loadAdminUppdrag,
  PROJECTS_GUEST_LEAD_ID_UNIQUE_INDEX,
} from '@/lib/adminUppdrag'

const orphanLead = {
  id: 'lead-orphan',
  title: 'SEO-brief som försvann',
  category: 'SEO',
  email: 'lost@example.com',
}

const attachedLead = {
  id: 'lead-attached',
  title: 'Synligt uppdrag',
  category: 'Webbutveckling',
  email: 'visible@example.com',
}

describe('orphan guest_lead listing', () => {
  it('lists guest_leads that have no matching project', () => {
    const orphans = findOrphanGuestLeads(
      [orphanLead, attachedLead],
      ['lead-attached', null],
    )

    expect(orphans).toEqual([orphanLead])
  })

  it('returns every lead when no projects remain after delete', () => {
    expect(findOrphanGuestLeads([orphanLead, attachedLead], [])).toEqual([
      orphanLead,
      attachedLead,
    ])
  })

  it('loads orphans from guest_leads even when /admin/uppdrag only had projects before', async () => {
    const client = {
      from(table: string) {
        if (table === 'projects') {
          return {
            select: () => ({
              order: () => ({
                limit: async () => ({
                  data: [{ id: 'proj-1', guest_lead_id: 'lead-attached', title: 'Kvar' }],
                  error: null,
                }),
              }),
            }),
          }
        }
        if (table === 'guest_leads') {
          return {
            select: () => ({
              order: async () => ({
                data: [orphanLead, attachedLead],
                error: null,
              }),
            }),
          }
        }
        throw new Error(`unexpected table ${table}`)
      },
    }

    const result = await loadAdminUppdrag(client)

    expect(result.projects).toHaveLength(1)
    expect(result.orphanGuestLeads).toEqual([orphanLead])
    expect(result.orphanError).toBeNull()
  })
})

describe('admin project delete audit', () => {
  it('records who, when target, and enough to reconstruct an orphaned guest_lead', () => {
    const audit = buildAdminProjectDeleteAudit('admin-1', {
      id: 'proj-42',
      title: 'Google Ads-kampanj',
      status: 'pending',
      category: 'Digital marknadsföring',
      guest_lead_id: 'lead-99',
      buyer_id: null,
      guest_leads: {
        id: 'lead-99',
        email: 'guest@example.com',
        full_name: 'Anna Gäst',
        company_name: 'Gäst AB',
        title: 'Google Ads-kampanj',
        phone: '0700000000',
      },
    })

    expect(audit.admin_id).toBe('admin-1')
    expect(audit.action).toBe(ADMIN_PROJECT_DELETE_ACTION)
    expect(audit.target_type).toBe('project')
    expect(audit.target_id).toBe('proj-42')
    expect(audit.details.guest_lead_id).toBe('lead-99')
    expect(audit.details.orphaned_guest_lead).toBe(true)
    expect(audit.details.guest_lead).toMatchObject({
      id: 'lead-99',
      email: 'guest@example.com',
      full_name: 'Anna Gäst',
    })
  })

  it('writes the audit row before deleting the project', async () => {
    const inserted: unknown[] = []
    const deleted: string[] = []
    const client = {
      from(table: string) {
        return {
          insert: async (row: unknown) => {
            expect(table).toBe('audit_log')
            inserted.push(row)
            return { error: null }
          },
          delete: () => ({
            eq: async (_column: string, id: string) => {
              expect(table).toBe('projects')
              expect(inserted).toHaveLength(1)
              deleted.push(id)
              return { error: null }
            },
          }),
        }
      },
    }

    await deleteAdminProject(client, 'admin-1', {
      id: 'proj-42',
      title: 'Brief',
      guest_lead_id: 'lead-99',
    })

    expect(inserted[0]).toMatchObject({
      admin_id: 'admin-1',
      action: ADMIN_PROJECT_DELETE_ACTION,
      target_id: 'proj-42',
      details: { guest_lead_id: 'lead-99', orphaned_guest_lead: true },
    })
    expect(deleted).toEqual(['proj-42'])
  })

  it('does not delete the project if the audit insert fails', async () => {
    let deleted = false
    const client = {
      from(table: string) {
        return {
          insert: async () => ({ error: new Error('audit blocked') }),
          delete: () => ({
            eq: async () => {
              deleted = true
              return { error: null }
            },
          }),
        }
      },
    }

    await expect(
      deleteAdminProject(client, 'admin-1', { id: 'proj-42', guest_lead_id: 'lead-99' }),
    ).rejects.toThrow('audit blocked')
    expect(deleted).toBe(false)
  })
})

describe('projects.guest_lead_id unique index', () => {
  it('does not allow a second project to attach to the same guest_lead_id', () => {
    const projects = [{ id: 'proj-1', guest_lead_id: 'lead-1' }]

    expect(() =>
      attachProjectGuestLeadId(projects, { id: 'proj-2', guest_lead_id: 'lead-1' }),
    ).toThrow(GUEST_LEAD_ID_UNIQUE_VIOLATION)

    try {
      attachProjectGuestLeadId(projects, { id: 'proj-2', guest_lead_id: 'lead-1' })
    } catch (error) {
      expect((error as { code?: string }).code).toBe('23505')
    }
  })

  it('allows a later project when guest_lead_id is null or unused', () => {
    const projects = [
      { id: 'proj-1', guest_lead_id: 'lead-1' },
      { id: 'proj-2', guest_lead_id: null },
    ]

    expect(attachProjectGuestLeadId(projects, { id: 'proj-3', guest_lead_id: 'lead-2' })).toEqual([
      { id: 'proj-1', guest_lead_id: 'lead-1' },
      { id: 'proj-2', guest_lead_id: null },
      { id: 'proj-3', guest_lead_id: 'lead-2' },
    ])
    expect(attachProjectGuestLeadId(projects, { id: 'proj-4', guest_lead_id: null })).toHaveLength(3)
  })

  it('is declared as a partial unique index in the migration', () => {
    const sql = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260820180000_projects_guest_lead_id_unique_and_delete_audit.sql'),
      'utf8',
    )

    expect(sql).toMatch(
      new RegExp(
        `create unique index if not exists ${PROJECTS_GUEST_LEAD_ID_UNIQUE_INDEX}`,
        'i',
      ),
    )
    expect(sql).toMatch(/on public\.projects\s*\(\s*guest_lead_id\s*\)/i)
    expect(sql).toMatch(/where guest_lead_id is not null/i)
  })
})
