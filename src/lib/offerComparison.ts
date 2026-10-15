/**
 * Side-by-side comparison of the offers a buyer has received. Only offers that are
 * still open are compared, and an hourly rate is never ranked against a total price.
 */

export type ComparableOffer = {
  id: string
  price: number
  delivery_weeks: number | null
  payment_plan: string | null
  status: string | null
  created_at: string | null
  supplier_profiles?: { avg_rating?: number | null; review_count?: number | null } | null
}

export type BudgetFit = 'under' | 'within' | 'over'
export type OfferHighlight = 'lowest_price' | 'fastest' | 'top_rated'

/** Inclusive SEK bounds for the stored budget ranges; `unknown` has none. */
const BUDGET_BOUNDS: Record<string, [number, number]> = {
  under_10k: [0, 10_000],
  '10k_50k': [10_000, 50_000],
  '50k_150k': [50_000, 150_000],
  over_150k: [150_000, Number.POSITIVE_INFINITY],
}

export const MIN_OFFERS_TO_COMPARE = 2

export const isTotalPrice = (offer: Pick<ComparableOffer, 'payment_plan' | 'price'>) =>
  offer.payment_plan !== 'hourly' && Number.isFinite(offer.price) && offer.price > 0

export const budgetFit = (offer: Pick<ComparableOffer, 'payment_plan' | 'price'>, budgetRange: string | null | undefined): BudgetFit | null => {
  const bounds = budgetRange ? BUDGET_BOUNDS[budgetRange] : undefined
  if (!bounds || !isTotalPrice(offer)) return null
  if (offer.price < bounds[0]) return 'under'
  if (offer.price > bounds[1]) return 'over'
  return 'within'
}

/** Offers the buyer can still choose between, oldest first so columns keep their order. */
export const comparableOffers = <T extends ComparableOffer>(offers: T[]): T[] =>
  offers
    .filter(offer => offer.status !== 'declined' && offer.status !== 'withdrawn')
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())

const uniqueBest = <T extends ComparableOffer>(offers: T[], value: (offer: T) => number | null, prefer: 'min' | 'max'): string | null => {
  const scored = offers.flatMap(offer => {
    const score = value(offer)
    return score === null || !Number.isFinite(score) ? [] : [{ id: offer.id, score }]
  })
  // A highlight only helps when there is something to beat and a single winner.
  if (scored.length < 2) return null
  const best = prefer === 'min' ? Math.min(...scored.map(s => s.score)) : Math.max(...scored.map(s => s.score))
  const winners = scored.filter(s => s.score === best)
  return winners.length === 1 ? winners[0].id : null
}

export const offerHighlights = <T extends ComparableOffer>(offers: T[]): Map<string, OfferHighlight[]> => {
  const highlights = new Map<string, OfferHighlight[]>()
  const add = (id: string | null, highlight: OfferHighlight) => {
    if (id) highlights.set(id, [...(highlights.get(id) || []), highlight])
  }
  add(uniqueBest(offers, offer => (isTotalPrice(offer) ? offer.price : null), 'min'), 'lowest_price')
  add(uniqueBest(offers, offer => (offer.delivery_weeks && offer.delivery_weeks > 0 ? offer.delivery_weeks : null), 'min'), 'fastest')
  add(uniqueBest(offers, offer => {
    const reviews = offer.supplier_profiles?.review_count || 0
    const rating = offer.supplier_profiles?.avg_rating || 0
    return reviews > 0 && rating > 0 ? rating : null
  }, 'max'), 'top_rated')
  return highlights
}

export const HIGHLIGHT_LABELS: Record<OfferHighlight, string> = {
  lowest_price: 'Lägst pris',
  fastest: 'Snabbast leverans',
  top_rated: 'Högst betyg',
}

export const BUDGET_FIT_LABELS: Record<BudgetFit, string> = {
  under: 'Under din budget',
  within: 'Inom din budget',
  over: 'Över din budget',
}
