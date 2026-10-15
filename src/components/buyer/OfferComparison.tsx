import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Check, Clock3, MessageCircle, Minus, Paperclip, Star, Wallet, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PAYMENT_PLAN_LABELS } from '@/lib/agreements'
import { formatPrice, timeAgo } from '@/lib/dateUtils'
import {
  BUDGET_FIT_LABELS,
  HIGHLIGHT_LABELS,
  MIN_OFFERS_TO_COMPARE,
  budgetFit,
  comparableOffers,
  offerHighlights,
  type ComparableOffer,
  type OfferHighlight,
} from '@/lib/offerComparison'

export type BuyerOffer = ComparableOffer & {
  supplier_id: string
  title: string
  attachment_url: string | null
  profiles?: { company_name?: string | null; full_name?: string | null; city?: string | null } | null
  supplier_profiles?: ComparableOffer['supplier_profiles'] & {
    is_verified?: boolean | null
    has_fskatt?: boolean | null
    credit_check_passed?: boolean | null
    completed_projects?: number | null
  } | null
}

interface OfferComparisonProps {
  projectId: string
  budgetRange: string | null
  offers: BuyerOffer[]
  disabled?: boolean
  onAccept: (offer: BuyerOffer) => void
  onShowOffer: (offerId: string) => void
}

const HIGHLIGHT_ICONS: Record<OfferHighlight, LucideIcon> = { lowest_price: Wallet, fastest: Clock3, top_rated: Star }

const agencyName = (offer: BuyerOffer) => offer.profiles?.company_name || offer.profiles?.full_name || 'Byrå'

const Yes = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />{children}</span>
)
const No = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Minus className="h-4 w-4 shrink-0" aria-hidden="true" />{children}</span>
)

/** Puts the open offers next to each other so the buyer can decide in one place. */
export default function OfferComparison({ projectId, budgetRange, offers, disabled = false, onAccept, onShowOffer }: OfferComparisonProps) {
  if (offers.some(offer => offer.status === 'accepted')) return null
  const columns = comparableOffers(offers)
  if (columns.length < MIN_OFFERS_TO_COMPARE) return null
  const highlights = offerHighlights(columns)

  const row = (label: string, render: (offer: BuyerOffer) => ReactNode) => (
    <tr className="border-t border-border">
      <th scope="row" className="sticky left-0 z-10 w-24 bg-card px-3 py-3 text-left align-top text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:w-40 md:px-4 md:text-xs">{label}</th>
      {columns.map(offer => <td key={offer.id} className="min-w-[11rem] px-3 py-3 align-top text-sm md:px-4">{render(offer)}</td>)}
    </tr>
  )

  return (
    <section aria-labelledby="offer-comparison-title" className="mb-8 overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 id="offer-comparison-title" className="font-display text-lg font-semibold">Jämför offerterna</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {columns.length} offerter sida vid sida. Pris anges exklusive moms. Läs hela förslaget innan du väljer – det billigaste är inte alltid det som ger mest.
        </p>
        {columns.length > 1 && <p className="mt-2 text-xs text-muted-foreground md:hidden" aria-hidden="true">Svep i tabellen för att se alla byråer →</p>}
      </div>
      <div className="table-scroll">
        <table className="w-full border-collapse">
          <caption className="sr-only">Jämförelse av {columns.length} offerter på pris, tidsplan, omdömen och verifiering</caption>
          <thead>
            <tr>
              <td className="sticky left-0 z-10 bg-card" />
              {columns.map(offer => (
                <th key={offer.id} scope="col" className="min-w-[11rem] px-3 pb-3 pt-4 text-left align-top md:px-4">
                  <span className="flex items-center gap-1.5 font-semibold">
                    {agencyName(offer)}
                    {offer.supplier_profiles?.is_verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verifierad byrå" />}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {[offer.profiles?.city, offer.created_at && `inkom ${timeAgo(offer.created_at)}`].filter(Boolean).join(' · ')}
                  </span>
                  {(highlights.get(offer.id) || []).length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1">
                      {(highlights.get(offer.id) || []).map(highlight => {
                        const Icon = HIGHLIGHT_ICONS[highlight]
                        return (
                          <span key={highlight} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            <Icon className="h-3 w-3" aria-hidden="true" />{HIGHLIGHT_LABELS[highlight]}
                          </span>
                        )
                      })}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {row('Pris', offer => {
              const fit = budgetFit(offer, budgetRange)
              return (
                <>
                  <span className="block font-display text-lg font-semibold tabular-nums">
                    {formatPrice(offer.price)}{offer.payment_plan === 'hourly' ? '/tim' : ''}
                  </span>
                  {fit && <span className={`text-xs ${fit === 'over' ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>{BUDGET_FIT_LABELS[fit]}</span>}
                  {offer.payment_plan === 'hourly' && <span className="block text-xs text-muted-foreground">Timpris – fråga om uppskattad totalkostnad</span>}
                </>
              )
            })}
            {row('Betalning', offer => PAYMENT_PLAN_LABELS[offer.payment_plan || ''] || <No>Ej angivet</No>)}
            {row('Leverans', offer => offer.delivery_weeks ? `${offer.delivery_weeks} ${offer.delivery_weeks === 1 ? 'vecka' : 'veckor'}` : <No>Ej angivet</No>)}
            {row('Omdömen', offer => {
              const count = offer.supplier_profiles?.review_count || 0
              const rating = offer.supplier_profiles?.avg_rating || 0
              return count > 0
                ? <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" aria-hidden="true" />{rating.toFixed(1)} <span className="text-muted-foreground">({count})</span></span>
                : <No>Inga omdömen ännu</No>
            })}
            {row('Via Updro', offer => {
              const done = offer.supplier_profiles?.completed_projects || 0
              return done > 0 ? `${done} avslutade uppdrag` : <No>Inga ännu</No>
            })}
            {row('Kontroller', offer => (
              <span className="grid gap-1">
                {offer.supplier_profiles?.is_verified ? <Yes>Verifierad</Yes> : <No>Ej verifierad</No>}
                {offer.supplier_profiles?.has_fskatt ? <Yes>F-skatt</Yes> : <No>F-skatt ej kontrollerad</No>}
                {offer.supplier_profiles?.credit_check_passed ? <Yes>Kreditkontroll</Yes> : <No>Ingen kreditkontroll</No>}
              </span>
            ))}
            {row('Underlag', offer => (
              <span className="grid gap-1">
                <span className="line-clamp-2 font-medium">{offer.title}</span>
                {offer.attachment_url ? <span className="inline-flex items-center gap-1 text-muted-foreground"><Paperclip className="h-3.5 w-3.5" aria-hidden="true" />Bilaga finns</span> : null}
                <button type="button" onClick={() => onShowOffer(offer.id)} className="w-fit text-left font-medium text-primary underline underline-offset-4">Läs hela offerten</button>
              </span>
            ))}
            <tr className="border-t border-border">
              <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-4 text-left md:px-4"><span className="sr-only">Val</span></th>
              {columns.map(offer => (
                <td key={offer.id} className="px-3 py-4 align-top md:px-4">
                  <span className="flex flex-col gap-2">
                    <Button size="sm" disabled={disabled || offer.status !== 'pending'} onClick={() => onAccept(offer)} aria-label={`Välj ${agencyName(offer)}`}>
                      <Check className="mr-1 h-4 w-4" aria-hidden="true" />Välj byrån
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/dashboard/buyer/chatt?project=${projectId}&user=${offer.supplier_id}`} aria-label={`Ställ en fråga till ${agencyName(offer)}`}>
                        <MessageCircle className="mr-1 h-4 w-4" aria-hidden="true" />Ställ en fråga
                      </Link>
                    </Button>
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
