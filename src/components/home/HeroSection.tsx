import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackLeadStarted } from '@/lib/analytics'
import { trackClick } from '@/hooks/usePageTracking'

const mockOffers = [
  {
    name: 'Webbyrå',
    tag: 'Webbutveckling',
    price: '85 000–120 000 kr',
    delivery: '6 veckor',
    stars: 5,
    rotate: -3,
  },
  {
    name: 'Designstudio',
    tag: 'Design och UX',
    price: '60 000–90 000 kr',
    delivery: '4 veckor',
    stars: 5,
    rotate: 0,
    offset: true,
  },
  {
    name: 'SEO-byrå',
    tag: 'SEO',
    price: '15 000 kr/mån',
    delivery: 'Löpande',
    stars: 4,
    rotate: 2,
  },
]

const HeroSection = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const description = query.trim()

    trackLeadStarted('homepage_hero')
    trackClick('lead_started', 'Beskriv ditt uppdrag', {
      source: 'homepage_hero',
      has_description: description.length > 0,
    })

    navigate(`/publicera${description ? `?beskrivning=${encodeURIComponent(description)}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-hero-gradient dark:from-background dark:to-background">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative z-10 py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-14">
          <div className="text-left md:col-span-7">
            <div className="mb-5 inline-flex items-center rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
              Kostnadsfritt för beställare · ingen bindning
            </div>

            <h1 className="font-display text-4xl leading-[1.04] tracking-tight text-foreground [text-wrap:balance] sm:text-5xl md:text-6xl lg:text-7xl">
              Beskriv uppdraget. Jämför upp till fem relevanta byråer.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Slipp ringa runt och jaga svar. Berätta vad du behöver hjälp med, så matchar Updro dig med granskade svenska byråer som passar uppdraget, budgeten och tidsplanen.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 max-w-2xl md:mt-10">
              <div className="rounded-2xl border border-border bg-background/90 p-2 shadow-xl shadow-foreground/5 backdrop-blur">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    name="project-description"
                    aria-label="Beskriv kort vad du behöver hjälp med"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Exempel: Vi behöver en ny webbplats och hjälp med SEO"
                    className="h-14 flex-1 rounded-xl border-0 bg-transparent px-4 text-base shadow-none focus-visible:ring-0"
                    maxLength={500}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 rounded-xl bg-foreground px-6 text-base font-semibold text-background shadow-md hover:bg-foreground/90 sm:whitespace-nowrap"
                  >
                    Beskriv ditt uppdrag
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tar cirka två minuter. Du behöver inte skapa konto för att skicka förfrågan.
              </p>
            </form>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {[
                'Upp till fem offerter',
                'Granskade byråer',
                'Du väljer helt själv',
              ].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand-mint" strokeWidth={2.2} />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden h-[450px] md:col-span-5 md:block" aria-label="Illustrerade exempel på offerter">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              Illustrerade exempel
            </div>
            {mockOffers.map((offer, i) => (
              <div
                key={offer.name}
                className={`absolute left-0 right-0 mx-auto w-[88%] max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl shadow-foreground/10 ${
                  offer.offset ? 'translate-x-6' : ''
                }`}
                style={{
                  top: `${42 + i * 108}px`,
                  zIndex: i + 1,
                  transform: `${offer.offset ? 'translateX(1.5rem) ' : ''}rotate(${offer.rotate}deg)`,
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="font-display text-base leading-tight text-foreground">{offer.name}</p>
                    <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {offer.tag}
                    </span>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${offer.stars} av 5 stjärnor i exemplet`}>
                    {[...Array(offer.stars)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Prisindikation</p>
                    <p className="text-sm font-semibold text-foreground">{offer.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tidsplan</p>
                    <p className="text-sm font-semibold text-foreground">{offer.delivery}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
