import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock3, Gauge, Sparkles, WalletCards } from 'lucide-react'
import { trackClick } from '@/hooks/usePageTracking'

type DecisionLens = 'balanced' | 'price' | 'speed'

interface ExampleOffer {
  id: string
  title: string
  profile: string
  priceValue: number
  price: string
  weeksValue: number
  weeks: string
  highlights: string[]
  score: number
}

const EXAMPLE_OFFERS: ExampleOffer[] = [
  {
    id: 'a',
    title: 'Offert A',
    profile: 'Specialistteam',
    priceValue: 68000,
    price: '68 000 kr',
    weeksValue: 6,
    weeks: '6 veckor',
    score: 88,
    highlights: ['Design och utveckling i samma team', 'CMS-utbildning ingår', 'Tydlig plan för förvaltning efter lansering'],
  },
  {
    id: 'b',
    title: 'Offert B',
    profile: 'Helhetsbyrå',
    priceValue: 54000,
    price: '54 000 kr',
    weeksValue: 8,
    weeks: '8 veckor',
    score: 92,
    highlights: ['Fast pris med tydliga revisionsrundor', 'SEO-grund och hastighetsoptimering', 'Lägst pris i det här exemplet'],
  },
  {
    id: 'c',
    title: 'Offert C',
    profile: 'Senior utvecklingspartner',
    priceValue: 79000,
    price: '79 000 kr',
    weeksValue: 5,
    weeks: '5 veckor',
    score: 86,
    highlights: ['Senior utvecklare genom hela projektet', 'Integration mot affärssystem ingår', 'Kortast leveranstid i det här exemplet'],
  },
]

const LENSES: Array<{ id: DecisionLens; label: string; icon: typeof Sparkles }> = [
  { id: 'balanced', label: 'Bäst helhet', icon: Sparkles },
  { id: 'price', label: 'Lägst pris', icon: WalletCards },
  { id: 'speed', label: 'Snabbast', icon: Gauge },
]

const pickRecommended = (lens: DecisionLens) => {
  if (lens === 'price') return [...EXAMPLE_OFFERS].sort((a, b) => a.priceValue - b.priceValue)[0]
  if (lens === 'speed') return [...EXAMPLE_OFFERS].sort((a, b) => a.weeksValue - b.weeksValue)[0]
  return [...EXAMPLE_OFFERS].sort((a, b) => b.score - a.score)[0]
}

const recommendationCopy: Record<DecisionLens, string> = {
  balanced: 'Den här offerten ger bäst balans mellan pris, omfattning och tydlighet i det illustrerade exemplet.',
  price: 'Den här offerten har lägst totalpris i det illustrerade exemplet.',
  speed: 'Den här offerten har kortast angiven leveranstid i det illustrerade exemplet.',
}

const ExampleOffersSection = () => {
  const reduce = useReducedMotion()
  const [lens, setLens] = useState<DecisionLens>('balanced')
  const recommended = useMemo(() => pickRecommended(lens), [lens])
  const activeLens = LENSES.find(item => item.id === lens)?.label ?? 'Bäst helhet'

  return (
    <section className="py-16 md:py-20 bg-secondary border-b-2 border-foreground" aria-labelledby="exempelofferter-rubrik">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Se värdet innan du börjar</p>
          <h2 id="exempelofferter-rubrik" className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground [text-wrap:balance]">
            Tre offerter blir först värdefulla när de går att <span className="text-accent">jämföra på riktigt.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Updro strukturerar pris, tidsplan och omfattning så att du kan väga alternativen mot det som är viktigast för just ditt projekt.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Välj vad som är viktigast i offertjämförelsen">
          {LENSES.map(item => {
            const active = lens === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setLens(item.id)}
                className={`inline-flex min-h-11 items-center gap-2 border-2 px-4 text-sm font-display font-bold transition-all ${
                  active
                    ? 'border-foreground bg-foreground text-background shadow-[3px_3px_0_0_hsl(var(--accent))]'
                    : 'border-foreground/20 bg-background text-foreground hover:border-foreground'
                }`}
                aria-pressed={active}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          Prioritering {activeLens}. {recommended.title}, {recommended.profile}, matchar valet bäst i det illustrerade exemplet.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          {EXAMPLE_OFFERS.map((offer, index) => {
            const featured = recommended.id === offer.id
            return (
              <motion.article
                key={offer.id}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`relative border-2 bg-card p-5 md:p-6 transition-all ${
                  featured
                    ? 'border-foreground shadow-[7px_7px_0_0_hsl(var(--accent))] -translate-y-1'
                    : 'border-foreground/35 shadow-[3px_3px_0_0_hsl(var(--foreground))]'
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-4 bg-accent text-accent-foreground border-2 border-foreground px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest font-display">
                    Matchar ditt val
                  </span>
                )}

                <header>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{offer.title}</p>
                  <h3 className="mt-1 font-display font-bold text-lg text-foreground">{offer.profile}</h3>
                </header>

                <div className="mt-4 flex items-end justify-between gap-3 border-y border-foreground/10 py-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Fast pris</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{offer.price}</p>
                  </div>
                  <p className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> {offer.weeks}
                  </p>
                </div>

                <ul className="mt-4 space-y-2">
                  {offer.highlights.map(highlight => (
                    <li key={highlight} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                {featured && (
                  <p className="mt-5 border-t border-foreground/10 pt-4 text-xs leading-relaxed text-muted-foreground">
                    {recommendationCopy[lens]}
                  </p>
                )}
              </motion.article>
            )
          })}
        </div>

        <div className="mx-auto mt-8 max-w-3xl border-2 border-dashed border-foreground/25 bg-background p-5 text-center">
          <p className="font-display text-sm font-bold text-foreground">Illustrerat exempel – inte riktiga byråer eller kundomdömen.</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Syftet är att visa hur ett strukturerat beslutsunderlag kan se ut. Verkliga offerter, priser och leveranstider beror på ditt projekt.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/publicera"
            onClick={() => trackClick('example_offers_cta', 'Få riktiga offerter', { placement: 'example_offers', lens })}
            className="inline-flex h-12 items-center justify-center gap-2 px-8 bg-accent text-accent-foreground font-display font-bold uppercase tracking-wide text-sm border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:bg-[hsl(14_75%_50%)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            Beskriv mitt projekt gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ExampleOffersSection
