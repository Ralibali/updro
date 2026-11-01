import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { closeProjectWithoutOffer } from '@/lib/marketplaceActions'
import { removeMode, type OfferState, type RemovableProject, type RemoveMode } from '@/lib/projectRemoval'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ProjectRemoveDialogProps {
  project: RemovableProject | null
  offers: OfferState
  onOpenChange: (open: boolean) => void
  onDeleted: (projectId: string) => void
  onClosed: (projectId: string) => void
}

/**
 * Agencies may have paid to unlock a project or answered it. Such a project is
 * closed instead of deleted, so the agencies get word and keep their history.
 */
const ProjectRemoveDialog = ({ project, offers, onOpenChange, onDeleted, onClosed }: ProjectRemoveDialogProps) => {
  const [mode, setMode] = useState<RemoveMode>(() => removeMode(project, offers))
  const [busy, setBusy] = useState(false)
  const { total, pending, accepted } = offers

  useEffect(() => {
    if (project) setMode(removeMode(project, { total, pending, accepted }))
  }, [project, total, pending, accepted])

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
      toast.success('Uppdraget är avslutat och byråerna har fått besked.')
      onClosed(project.id)
      onOpenChange(false)
    } catch (cause) {
      toast.error((cause as { message?: string })?.message || 'Kunde inte stänga uppdraget. Försök igen.')
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'delete' ? 'Ta bort uppdrag?'
    : mode === 'close' ? (project?.status === 'active' ? 'Stäng uppdraget i stället?' : 'Avsluta utan att välja?')
      : 'Uppdraget sparas'

  return (
    <Dialog open={!!project} onOpenChange={open => { if (!busy) onOpenChange(open) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'delete'
              ? <>Vill du verkligen ta bort "{project?.title}"? Detta kan inte ångras.</>
              : mode === 'close'
                ? project?.status === 'active'
                  ? <>Byråer har redan låst upp eller svarat på "{project?.title}", så det kan inte raderas. Om du stänger uppdraget tar det inte emot fler offerter och byråerna får besked direkt.</>
                  : <>Uppdraget kan inte raderas eftersom byråer har svarat. Du kan avsluta det utan att välja någon offert – byråerna får besked direkt och slipper vänta.</>
                : mode === 'open'
                  ? <>Byråer har redan svarat på "{project?.title}", så det kan inte raderas. Öppna uppdraget för att välja en offert eller avsluta utan att välja.</>
                  : <>Byråer har redan låst upp eller svarat på "{project?.title}". Uppdraget är stängt och sparas så att både du och byråerna har kvar historiken.</>}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>{mode === 'kept' ? 'Stäng' : 'Avbryt'}</Button>
          {mode === 'delete' && (
            <Button variant="destructive" onClick={remove} disabled={busy}>{busy ? 'Tar bort…' : 'Ta bort'}</Button>
          )}
          {mode === 'close' && (
            <Button onClick={close} disabled={busy}>{busy ? 'Stänger…' : project?.status === 'active' ? 'Stäng uppdraget' : 'Avsluta utan att välja'}</Button>
          )}
          {mode === 'open' && project && (
            <Button asChild><Link to={`/dashboard/buyer/uppdrag/${project.id}`} onClick={() => onOpenChange(false)}>Öppna uppdraget</Link></Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectRemoveDialog
