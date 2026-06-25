import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Lock, Unlock } from 'lucide-react'
import { toast } from 'sonner'
import TrialBanner from '@/components/TrialBanner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { BUDGET_LABELS, CATEGORIES, CATEGORY_STYLES } from '@/lib/constants'
import { timeAgo } from '@/lib/dateUtils'
import { numWord } from '@/lib/numberWords'

const BrowseProjects = () => {
  const { user, supplierProfile, refreshProfile, hasActiveSubscription } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [filterCat, setFilterCat] = useState('all')
  const [confirmProject, setConfirmProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [{ data: projectRows, error: projectError }, { data: leadRows, error: leadError }] = await Promise.all([
        supabase.from('projects').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(100),
        supabase.from('unlocked_leads').select('project_id').eq('supplier_id', user.id),
      ])
      if (projectError) throw projectError
      if (leadError) throw leadError
      setProjects(projectRows || [])
      setUnlocked(new Set((leadRows || []).map(row => row.project_id)))
    } catch (error) {
      console.error(error)
      toast.error('Kunde inte hämta tillgängliga uppdrag.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const handleUnlock = async (projectId: string) => {
    if (!user || !supplierProfile || unlocking) return
    const credits = supplierProfile.lead_credits || 0

    if (credits <= 0 && !hasActiveSubscription) {
      toast.error('Du har inga lead-krediter. Köp ett lead eller starta månadskort.')
      return
    }

    setUnlocking(true)
    try {
      const isTrialCredit = supplierProfile.plan === 'trial'
      const { error } = await supabase.from('unlocked_leads').insert({
        supplier_id: user.id,
        project_id: projectId,
        used_trial_credit: isTrialCredit,
      })

      if (error && error.code !== '23505') throw error

      if (!error && !hasActiveSubscription) {
        const { error: creditError } = await supabase.from('supplier_profiles').update({
          lead_credits: Math.max(0, credits - 1),
          ...(isTrialCredit ? { trial_leads_used: (supplierProfile.trial_leads_used || 0) + 1 } : {}),
        }).eq('id', user.id)
        if (creditError) throw creditError
      }

      setUnlocked(prev => new Set([...prev, projectId]))
      await refreshProfile()
      toast.success(error?.code === '23505' ? 'Uppdraget är redan upplåst.' : 'Uppdrag upplåst! 🔓')
      setConfirmProject(null)
    } catch (error) {
      console.error(error)
      toast.error('Kunde inte låsa upp uppdraget.')
    } finally {
      setUnlocking(false)
    }
  }

  const filtered = filterCat === 'all' ? projects : projects.filter(project => project.category === filterCat)
  const creditsLeft = supplierProfile?.lead_credits || 0
  const canUnlock = hasActiveSubscription || creditsLeft > 0

  return (
    <>
      <div className="max-w-4xl">
        <TrialBanner />

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">Tillgängliga uppdrag</h1>
            <p className="text-sm text-muted-foreground mt-1">Välj de uppdrag som passar er kompetens och kapacitet.</p>
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Alla kategorier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alla kategorier</SelectItem>
              {CATEGORIES.map(category => <SelectItem key={category} value={category}>{category}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border p-12 text-muted-foreground"><Loader2 className="h-5 w-5 mr-2 animate-spin" />Hämtar uppdrag...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-xl border p-8 text-center">
            <p className="text-muted-foreground">Inga uppdrag matchar just nu.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(project => {
              const isUnlocked = unlocked.has(project.id)
              const isClosed = (project.offer_count || 0) >= (project.max_offers || 5) || project.status === 'closed'
              return (
                <article key={project.id} className={`bg-card rounded-xl border p-5 transition-all ${isUnlocked ? 'border-accent/30' : ''}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_STYLES[project.category] || ''}`}>{project.category}</span>
                    {isUnlocked ? (
                      <span className="text-xs text-accent font-semibold flex items-center gap-1"><Unlock className="h-3 w-3" />Upplåst</span>
                    ) : (
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" />Kontaktuppgifter låsta</span>
                    )}
                  </div>
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-5">{project.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{BUDGET_LABELS[project.budget_range] || 'Budget diskuteras'} · {project.city || 'Sverige'} · {timeAgo(project.created_at)} · {project.offer_count || 0} av {project.max_offers || 5} offerter</p>

                  {isUnlocked ? (
                    <Link to={`/dashboard/supplier/uppdrag/${project.id}`}><Button size="sm" className="mt-3 bg-primary hover:bg-primary/90">Visa kontakt och svara →</Button></Link>
                  ) : isClosed ? (
                    <span className="inline-block mt-3 text-xs font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">Uppdraget tar inte emot fler offerter</span>
                  ) : (
                    <Button size="sm" className="mt-3" variant="outline" onClick={() => canUnlock ? setConfirmProject(project) : toast.error('Inga lead-krediter kvar. Köp ett lead eller starta månadskort.')}>
                      🔓 Lås upp ({hasActiveSubscription ? 'obegränsat' : `${numWord(creditsLeft)} krediter kvar`})
                    </Button>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      <Dialog open={Boolean(confirmProject)} onOpenChange={open => !open && setConfirmProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lås upp kontaktuppgifter?</DialogTitle>
            <DialogDescription>
              Lås upp ”{confirmProject?.title}” och få tillgång till beställarens kontaktuppgifter. {hasActiveSubscription ? 'Det ingår i ert månadskort.' : `Ni har ${numWord(creditsLeft)} krediter kvar.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setConfirmProject(null)}>Avbryt</Button>
            <Button disabled={unlocking} onClick={() => confirmProject && handleUnlock(confirmProject.id)} className="bg-primary hover:bg-primary/90">
              {unlocking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Bekräfta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BrowseProjects
