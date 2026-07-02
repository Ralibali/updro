import { useEffect, useState } from 'react'
import { Check, Clock3, Sparkles } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { trackClick } from '@/hooks/usePageTracking'
import { formatPrice } from '@/lib/dateUtils'

interface BuyerDecisionCardProps {
  project: any
  offers: any[]
  onScrollToOffers: () => void
  onProjectClosed: () => void
}

type ComparisonOffer = {
  offer_id: string
  strengths?: string[]
  weaknesses?: string[]
  price_assessment?: string
  flags?: string[]
}

type Comparison = {
  summary?: string
  offers?: ComparisonOffer[]
  recommendation?: string
}

function getDaysSince(dateStr: string | null) {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

const BuyerDecisionCard = ({ project, offers, onScrollToOffers, onProjectClosed }: BuyerDecisionCardProps) => {
  const [liveOffers, setLiveOffers] = useState<any[]>(offers)
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [comparing, setComparing] = useState(false)

  useEffect(() => setLiveOffers(offers), [offers])

  useEffect(() => {
    if (!project?.id) return

    const refreshOffers = async () => {
      const { data } = await supabase
        .from('offers')
        .select('*, profiles!offers_supplier_id_fkey(full_name, company_name, city)')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })

      if (!data) return
      setLiveOffers(previous => {
        if (data.length > previous.length) {
          const newest = data[0]
          toast.success(`Ny offert från ${newest?.profiles?.company_name || newest?.profiles?.full_name || 'en byrå'}!`)
          setComparison(null)
        }
        return data
      })
    }

    const channel = supabase
      .channel(`buyer-offers-${project.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offers',
        filter: `project_id=eq.${project.id}`,
      }, refreshOffers)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [project?.id])

  const pendingOffers = liveOffers.filter(offer => offer.status === 'pending')
  const hasAccepted = liveOffers.some(offer => offer.status === 'accepted')
  const firstOfferDate = liveOffers.length > 0 ? liveOffers[liveOffers.length - 1]?.created_at : null
  const showDecisionReminder = pendingOffers.length > 0 && !hasAccepted && getDaysSince(firstOfferDate) >= 3
  const projectAgeHours = (Date.now() - new Date(project.created_at).getTime()) / 3600000
  const activeStep = hasAccepted ? 4 : liveOffers.length > 0 ? 3 : projectAgeHours > 2 ? 2 : projectAgeHours > 0.1 ? 1 : 0
  const statusSteps = [
    'Uppdrag mottaget',
    'Matchas med byråer',
    'Byråer granskar',
    `Offerter inkommer (${Math.min(liveOffers.length, 3)} av 3)`,
    'Jämför och välj',
  ]

  const compareOffers = async () => {
    setComparing(true)
    const { data, error } = await supabase.functions.invoke('compare-offers', {
      body: { project_id: project.id },
    })
    setComparing(false)

    if (error || data?.error || !data?.comparison) {
      toast.error(data?.error || error?.message || 'Jämförelsen kunde inte skapas.')
      return
    }

    setComparison(data.comparison)
    trackClick('ai_offer_comparison_used', 'Jämför offerter med AI', {
      project_id: project.id,
      offer_count: liveOffers.length,
    })
  }

  const handleClose = async (reason: 'external' | 'cancelled') => {
    const { error: projectError } = await supabase
      .from('projects')
      .update({ status: 'closed' })
      .eq('id', project.id)

    if (projectError) {
      toast.error('Kunde inte stänga uppdraget')
      return
    }

    await supabase.from('offers').update({ status: 'declined' }).eq('project_id', project.id).eq('status', 'pending')

    for (const supplierId of liveOffers.map(offer => offer.supplier_id).filter(Boolean)) {
      await supabase.from('notifications').insert({
        user_id: supplierId,
        type: 'project_closed',
        title: 'Uppdrag stängt',
        message: `Beställaren har stängt uppdraget "${project.title}". Tack för din offert.`,
        link: null,
      })
    }

    toast.success(reason === 'external' ? 'Uppdraget markerat som avslutat' : 'Uppdraget har avslutats')
    onProjectClosed()
  }

  return (
    <div className="mb-6 space-y-4">
      <section className="rounded-2xl border bg-card p-5">
        <div className="rounded-xl bg-primary/5 p-4">
          <p className="flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4 text-primary" />Första offerten inom 24 timmar</p>
          <p className="mt-1 text-xs text-muted-foreground">Annars prioriterar vi ditt uppdrag manuellt.</p>
        </div>
        <h4 className="mt-5 font-display font-semibold">Livestatus</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          {statusSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-2 sm:block">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index < activeStep ? 'bg-accent text-accent-foreground' : index === activeStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/15' : 'bg-muted text-muted-foreground'}`}>
                {index < activeStep ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <p className="text-xs font-medium sm:mt-2">{step}</p>
            </div>
          ))}
        </div>
        {liveOffers.length > offers.length && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            {liveOffers.slice(0, liveOffers.length - offers.length).map(offer => (
              <p key={offer.id}><strong>Ny offert:</strong> {offer.profiles?.company_name || offer.profiles?.full_name} · {formatPrice(offer.price)}</p>
            ))}
          </div>
        )}
      </section>

      {liveOffers.length >= 2 && !hasAccepted && (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-primary" />Jämför offerterna med AI</h4>
              <p className="mt-1 text-sm text-muted-foreground">Se styrkor, frågetecken och prisbedömning utan att AI väljer byrå åt dig.</p>
            </div>
            <Button onClick={compareOffers} disabled={comparing}>
              {comparing ? 'Analyserar…' : comparison ? 'Uppdatera jämförelse' : 'Jämför offerter med AI'}
            </Button>
          </div>

          {comparison && (
            <div className="mt-5 space-y-4">
              <p className="text-sm">{comparison.summary}</p>
              {comparison.offers?.map(item => {
                const offer = liveOffers.find(candidate => candidate.id === item.offer_id)
                const agencyName = offer?.profiles?.company_name || offer?.profiles?.full_name || offer?.title || 'Offert'
                return (
                  <article key={item.offer_id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h5 className="font-semibold">{agencyName}</h5>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs">Prisbedömning: {item.price_assessment || 'saknas'}</span>
                    </div>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div><p className="text-xs font-semibold text-emerald-700">Styrkor</p>{item.strengths?.map(text => <p key={text} className="mt-1 text-sm">✓ {text}</p>)}</div>
                      <div><p className="text-xs font-semibold text-amber-700">Att undersöka</p>{item.weaknesses?.map(text => <p key={text} className="mt-1 text-sm">• {text}</p>)}</div>
                    </div>
                    {item.flags?.map(text => <p key={text} className="mt-2 text-sm text-destructive">⚑ {text}</p>)}
                  </article>
                )
              })}
              <p className="text-sm text-muted-foreground">{comparison.recommendation}</p>
              <p className="text-xs text-muted-foreground">AI-genererad vägledning – fatta alltid beslutet själv.</p>
            </div>
          )}
        </section>
      )}

      {showDecisionReminder && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h4 className="mb-1 font-bold text-foreground">Har du bestämt dig?</h4>
          <p className="mb-4 text-sm text-muted-foreground">Du har fått {liveOffers.length} offerter. Meddela byråerna ditt beslut så slipper de vänta i onödan.</p>
          <div className="flex flex-col gap-2">
            <button onClick={onScrollToOffers} className="text-left text-sm font-semibold text-primary hover:underline">Välj en byrå att gå vidare med</button>
            <button onClick={() => handleClose('external')} className="text-left text-sm font-semibold text-primary hover:underline">Jag valde ett företag utanför Updro</button>
            <button onClick={() => handleClose('cancelled')} className="text-left text-sm font-semibold text-muted-foreground hover:underline">Uppdraget kommer inte att utföras</button>
          </div>
        </section>
      )}
    </div>
  )
}

export default BuyerDecisionCard
