import { useEffect, useState } from 'react'
import { BadgeCheck, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { leadScoreLabel, verifyProjectLead } from '@/lib/leadQuality'

const checks = [
  ['emailVerified', 'E-post kontrollerad'],
  ['phoneVerified', 'Telefon kontrollerad'],
  ['budgetVerified', 'Budget bekräftad'],
  ['briefVerified', 'Brief kvalitetssäkrad'],
] as const

const ProjectQualityPanel = () => {
  const [projects, setProjects] = useState<any[]>([])
  const [forms, setForms] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*, profiles!projects_buyer_id_fkey(full_name, company_name, email, phone), guest_leads!projects_guest_lead_id_fkey(full_name, company_name, email, phone)')
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error(error)
      toast.error('Kunde inte hämta uppdrag för verifiering.')
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const currentForm = (project: any) => forms[project.id] || {
    emailVerified: Boolean(project.email_verified),
    phoneVerified: Boolean(project.phone_verified),
    budgetVerified: Boolean(project.budget_verified),
    briefVerified: Boolean(project.brief_verified),
    note: project.verification_note || '',
  }

  const change = (project: any, key: string, value: boolean | string) => {
    setForms(previous => ({
      ...previous,
      [project.id]: { ...currentForm(project), [key]: value },
    }))
  }

  const verify = async (project: any) => {
    const form = currentForm(project)
    setSaving(project.id)
    try {
      const result = await verifyProjectLead({ projectId: project.id, ...form, activate: true })
      setProjects(previous => previous.map(item => item.id === project.id ? {
        ...item,
        email_verified: form.emailVerified,
        phone_verified: form.phoneVerified,
        budget_verified: form.budgetVerified,
        brief_verified: form.briefVerified,
        verification_note: form.note,
        verified_at: result.verified_at,
        lead_score: result.lead_score,
        status: result.status,
      } : item))
      toast.success(`Uppdraget är verifierat med ${result.lead_score}/100 poäng.`)
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Kunde inte verifiera uppdraget.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2"><BadgeCheck className="h-5 w-5" />Leadverifiering</h2>
          <p className="text-sm text-muted-foreground mt-1">Kontrollera kontakt, budget och brief innan premiumstatus.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Uppdatera</Button>
      </div>

      {loading ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Hämtar uppdrag...</div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">Inga uppdrag väntar på verifiering.</div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => {
            const form = currentForm(project)
            const contact = project.profiles || project.guest_leads || {}
            return (
              <article key={project.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{project.title}</h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{project.lead_score || 0}/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{leadScoreLabel(project.lead_score || 0)} · {project.category}</p>
                    <p className="text-xs text-muted-foreground mt-1">{contact.company_name || contact.full_name || 'Okänd beställare'} · {contact.email || 'Ingen e-post'} · {contact.phone || 'Ingen telefon'}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${project.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{project.status === 'active' ? 'Aktiv' : 'Väntar'}</span>
                </div>

                <p className="text-sm text-muted-foreground mt-3 line-clamp-3 whitespace-pre-wrap">{project.description}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                  {checks.map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-lg border p-3 text-sm cursor-pointer hover:bg-muted/40">
                      <input type="checkbox" checked={Boolean(form[key])} onChange={event => change(project, key, event.target.checked)} className="h-4 w-4" />
                      {label}
                    </label>
                  ))}
                </div>
                <Textarea value={form.note} onChange={event => change(project, 'note', event.target.value)} placeholder="Intern verifieringsanteckning..." maxLength={1500} className="mt-3 min-h-[72px]" />
                <div className="flex justify-end mt-3">
                  <Button onClick={() => verify(project)} disabled={saving === project.id}>
                    {saving === project.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Verifiera och aktivera
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default ProjectQualityPanel
