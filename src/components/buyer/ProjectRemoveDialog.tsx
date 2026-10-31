import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { closeProjectWithoutOffer } from '@/lib/marketplaceActions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type RemovableProject = { id: string; title: string; status: string | null }
type Mode = 'delete' | 'close' | 'kept'

interface ProjectRemoveDialogProps {
  project: RemovableProject | null
  /** True when the buyer can already see offers; the database also refuses deletes after an agency unlock. */
  hasOffers: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (projectId: string) => void
  onClosed: (projectId: string) => void
}

const initialMode = (project: RemovableProject | null, hasOffers: boolean): Mode =>
  !hasOffers ? 'delete' : project?.status === 'active' ? 'close' : 'kept'

/**
 * Agencies may have paid to unlock a project or answered it. Such a project is
 * closed instead of deleted, so the agencies get word and keep their history.
 */
const ProjectRemoveDialog = ({ project, hasOffers, onOpenChange, onDeleted, onClosed }: ProjectRemoveDialogProps) => {
  const [mode, setMode] = useState<Mode>(() => initialMode(project, hasOffers))
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (project) setMode(initialMode(project, hasOffers)) }, [project, hasOffers])

  const remove = async () => {
    if (!project) return
    setBusy(true)
    const { error } = await supabase.from('projects').delete().eq('id', project.id).select('id').single()
    setBusy(false)
    if (!error) {
      toast.success('Uppdraget har tagits bort')
      onDeleted(project.id)
      onOpenChange(false)
      return
    }
    if (/kan inte raderas/i.test(error.message || '')) {
      setMode(project.status === 'active' ? 'close' : 'kept')
      return
    }
    toast.error(error.message || 'Kunde inte ta bort uppdraget')
    onOpenChange(false)
  }

  const close = async () => {
    if (!project) return
    setBusy(true)
    try {
      await closeProjectWithoutOffer(project.id)
      toast.success('Uppdraget är stängt och byråerna har fått besked.')
      onClosed(project.id)
      onOpenChange(false)
    } catch (cause) {
      toast.error((cause as { message?: string })?.message || 'Kunde inte stänga uppdraget. Försök igen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!project} onOpenChange={open => { if (!busy) onOpenChange(open) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'delete' ? 'Ta bort uppdrag?' : mode === 'close' ? 'Stäng uppdraget i stället?' : 'Uppdraget sparas'}</DialogTitle>
          <DialogDescription>
            {mode === 'delete'
              ? <>Vill du verkligen ta bort "{project?.title}"? Detta kan inte ångras.</>
              : mode === 'close'
                ? <>Byråer har redan låst upp eller svarat på "{project?.title}", så det kan inte raderas. Om du stänger uppdraget tar det inte emot fler offerter och byråerna får besked direkt.</>
                : <>Byråer har redan låst upp eller svarat på "{project?.title}". Uppdraget är stängt och sparas så att både du och byråerna har kvar historiken.</>}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>{mode === 'kept' ? 'Stäng' : 'Avbryt'}</Button>
          {mode === 'delete' && (
            <Button variant="destructive" onClick={remove} disabled={busy}>{busy ? 'Tar bort…' : 'Ta bort'}</Button>
          )}
          {mode === 'close' && (
            <Button onClick={close} disabled={busy}>{busy ? 'Stänger…' : 'Stäng uppdraget'}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectRemoveDialog
