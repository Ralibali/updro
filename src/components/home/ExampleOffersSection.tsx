import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock3, Star } from 'lucide-react'
import { trackClick } from '@/hooks/usePageTracking'

interface ExampleOffer {
  agency: string
  city: string
  price: string
  weeks: string
  rating: string
  highlights: string[]
  featured?: boolean
}

/**
 * Illustrerat exempel – visar köparen exakt vad de får innan de börjar.
 * Namngivet som exempel både i rubrik och i disclaimer: inga påhittade
 * omdömen presenteras som riktiga.
 */
const EXAMPLE_OFFERS: ExampleOffer[] = [
  {
    agency: 'Norra Studios',
    city: 'Stockholm',
    price: '68 000 kr',
    weeks: '6 veckor',
    rating: '4,8',
    highlights: ['Design och utveckling i samma team', 'CMS med utbildning ingår', 'Driftavtal 490 kr/mån'],
  },
  {
    agency: 'Pixel & Co',
    city: 'Göteborg',
    price: '54 000 kr',
    weeks: '8 veckor',
    rating: '4,9',
    highlights: ['Fast pris med tre revisionsrundor', 'SEO-grund och hastighetsoptimering', 'Lansering på fyra veckor möjlig'],
    featured: true,
  },
  {
    agency: 'Kodfabriken',
    city: 'Malmö',
    price: '79 000 kr',
    weeks: '5 veckor',
    rating: '4,7',
    highlights: ['Senior utvecklare genom hela projektet', 'Integration mot ert affärssystem', 'Sex månaders garanti på leveransen'],
  },
]

const OfferCard = ({ offer, index, reduce }: { offer: ExampleOffer; index: number; reduce: boolean }) => (
  <motion.article
    initial={reduce ? undefined : { opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    className={`relative border-2 border-foreground bg-card p-5 md:p-6 ${
      offer.featured ? 'shadow-[6px_6px_0_0_hsl(var(--accent))]' : 'shadow-[4px_4px_0_0_hsl(var(--foreground))]'
    }`}
  >
    {offer.featured && (
      <span className="absolute -top-3 left-4 bg-accent text-accent-foreground border-2 border-foreground px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest font-display">
        Flest valda
      </span>
    )}
    <header className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display font-bold text-lg text-foreground">{offer.agency}</h3>
        <p className="text-xs text-muted-foreground">{offer.city} · verifierad byrå</p>
      </div>
      <span className="inline-flex items-center gap-1 border border-foreground/20 bg-secondary px-2 py-1 text-xs font-semibold">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
        {offer.rating}
      </span>
    </header>

    <div className="mt-4 flex items-end gap-4">
      <p className="font-display text-2xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{offer.price}</p>
      <p className="mb-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
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
  </motion.article>
)

const ExampleOffersSection = () => {
  const reduce = useReducedMotion()

  return (
    <section className="py-16 md:py-20 bg-secondary border-b-2 border-foreground" aria-labelledby="exempelofferter-rubrik">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Så här ser det ut i Updro</p>
          <h2 id="exempelofferter-rubrik" className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground [text-wrap:balance]">
            Tre offerter. Ett ställe. <span className="text-accent">Du väljer i lugn och ro.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Varje offert visar pris, tidsplan, vad som ingår och byråns omdömen – så att jämförelsen tar minuter, inte veckor.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
          {EXAMPLE_OFFERS.map((offer, index) => (
            <OfferCard key={offer.agency} offer={offer} index={index} reduce={reduce} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Illustrerat exempel med påhittade byråer – så presenteras offerterna i tjänsten.
        </p>

        <div className="mt-8 text-center">
          <Link
            to="/publicera"
            onClick={() => trackClick('example_offers_cta', 'Få riktiga offerter', { placement: 'example_offers' })}
            className="inline-flex h-12 items-center justify-center gap-2 px-8 bg-accent text-accent-foreground font-display font-bold uppercase tracking-wide text-sm border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:bg-[hsl(14_75%_50%)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            Få riktiga offerter – gratis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default ExampleOffersSection
