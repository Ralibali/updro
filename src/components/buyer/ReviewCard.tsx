import { useCallback, useEffect, useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const RATING_LABELS: Record<number, string> = {
  1: 'Dåligt',
  2: 'Okej',
  3: 'Bra',
  4: 'Mycket bra',
  5: 'Utmärkt',
}

interface ReviewCardProps {
  projectId: string
}

/**
 * Låter beställaren lämna ett verifierat omdöme om byrån som fick uppdraget.
 * Ett omdöme per projekt (unik constraint i databasen). Omdömet visas
 * publikt på byråns profilsida och driver dess betyg.
 */
const ReviewCard = ({ projectId }: ReviewCardProps) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [supplier, setSupplier] = useState<{ id: string; name: string } | null>(null)
  const [existing, setExisting] = useState<{ rating: number; comment: string | null } | null>(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: offer } = await supabase
      .from('offers')
      .select('supplier_id, profiles!offers_supplier_id_fkey(company_name, full_name)')
      .eq('project_id', projectId)
      .eq('status', 'accepted')
      .maybeSingle()

    if (!offer) {
      setSupplier(null)
      setLoading(false)
      return
    }

    const profile = Array.isArray(offer.profiles) ? offer.profiles[0] : offer.profiles
    setSupplier({
      id: offer.supplier_id,
      name: profile?.company_name || profile?.full_name || 'byrån',
    })

    const { data: review } = await supabase
      .from('reviews')
      .select('rating, comment')
      .eq('project_id', projectId)
      .eq('buyer_id', user.id)
      .maybeSingle()
    setExisting(review)
    setLoading(false)
  }, [projectId, user])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    if (!user || !supplier || rating < 1) return
    setSaving(true)
    const { error } = await supabase.from('reviews').insert({
      project_id: projectId,
      buyer_id: user.id,
      supplier_id: supplier.id,
      rating,
      comment: comment.trim() || null,
    })
    if (error) {
      setSaving(false)
      if (error.code === '23505') {
        toast.info('Du har redan lämnat omdöme för det här uppdraget.')
      } else {
        toast.error('Kunde inte spara omdömet. Försök igen.')
      }
      return
    }

    await supabase.from('notifications').insert({
      user_id: supplier.id,
      type: 'new_review',
      title: 'Nytt omdöme mottaget',
      message: `En beställare har gett er ${rating} av 5 stjärnor. Se omdömet på er offentliga profil.`,
      link: '/dashboard/supplier/profil',
    })

    setSaving(false)
    setExisting({ rating, comment: comment.trim() || null })
    toast.success('Tack! Ditt omdöme hjälper andra beställare att välja rätt.')
  }

  if (loading || !supplier) return null

  return (
    <section className="mt-4 rounded-xl border bg-card p-5" aria-label="Lämna omdöme">
      <h3 className="font-display font-semibold">Omdöme om {supplier.name}</h3>

      {existing ? (
        <div className="mt-3">
          <div className="flex items-center gap-1" aria-label={`Ditt betyg: ${existing.rating} av 5`}>
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                className={`h-5 w-5 ${i <= existing.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                aria-hidden="true"
              />
            ))}
            <span className="ml-2 text-sm font-medium text-foreground">{RATING_LABELS[existing.rating]}</span>
          </div>
          {existing.comment && (
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">”{existing.comment}”</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Tack för ditt omdöme – det visas på {supplier.name}s offentliga profil.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-muted-foreground">
            Hur blev samarbetet? Ditt omdöme publiceras på byråns profil och hjälper andra beställare.
          </p>
          <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label="Välj betyg 1 till 5"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={rating === i}
                aria-label={`${i} av 5 – ${RATING_LABELS[i]}`}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHovered(i)}
                className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                <Star
                  className={`h-7 w-7 ${i <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm font-medium text-foreground">{RATING_LABELS[hovered || rating]}</span>
            )}
          </div>
          <div>
            <Label htmlFor="review-comment">Kommentar (valfritt)</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={event => setComment(event.target.value)}
              placeholder="Vad var bra? Något som kunde varit bättre?"
              maxLength={1000}
              className="mt-1 min-h-[80px] rounded-xl"
            />
          </div>
          <Button onClick={submit} disabled={saving || rating < 1} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Publicera omdöme
          </Button>
        </div>
      )}
    </section>
  )
}

export default ReviewCard
