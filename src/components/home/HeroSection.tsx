import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackLeadStarted } from '@/lib/analytics'
import { trackClick } from '@/hooks/usePageTracking'

const mockOffers = [
  {
    name: 'Exempel: Webbyrå',
    tag: 'Webbutveckling',
    price: '85 000 – 120 000 kr',
    delivery: '6 veckor',
    stars: 5,
    rotate: -3,
  },
  {
    name: 'Exempel: Designstudio',
    tag: 'Design & UX',
    price: '60 000 – 90 000 kr',
    delivery: '4 veckor',
    stars: 5,
    rotate: 0,
    offset: true,
  },
  {
    name: 'Exempel: SEO-byrå',
    tag: 'SEO',
    price: '15 000 kr / mån',
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

    // This is the beginning of the funnel, not a completed conversion.
    trackLeadStarted('homepage_hero')
    trackClick('lead_started', 'Starta gratis – tar 2 min', {
      source: 'homepage_hero',
      has_description: description.length > 0,
    })

    navigate(`/publicera${description ? `?beskrivning=${encodeURIComponent(description)}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient dark:from-background dark:to-background">
      <div className="container relative z-10 py-14 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
          <div className="md:col-span-7 text-left">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground leading-[1.05] [text-wrap:balance]">
              Jämför offerter från digitala byråer – utan att jaga dem själv
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Beskriv vad du behöver hjälp med. Updro matchar uppdraget med relevanta svenska byråer och du kan jämföra upp till fem offerter. Gratis och utan förpliktelser.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 md:mt-10 max-w-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  name="project-description"
                  aria-label="Kort beskrivning av projektet"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="T.ex. ny Shopify-butik eller hjälp med SEO"
                  className="flex-1 h-14 rounded-xl text-base px-5 border-border bg-card shadow-sm"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 bg-foreground hover:bg-foreground/90 text-background rounded-xl px-7 text-base font-semibold shadow-md whitespace-nowrap"
                >
                  Starta gratis – tar 2 min
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Ingen registrering krävs för att skicka in din förfrågan.
              </p>
            </form>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {[
                '100% gratis',
                'Ingen bindning',
                'Upp till 5 offerter',
              ].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-brand-mint" strokeWidth={2} />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden md:block md:col-span-5 relative h-[430px]" aria-label="Illustrerade exempel på hur offerter kan se ut">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              Illustrerade exempel
            </div>
            {mockOffers.map((offer, i) => (
              <div
                key={offer.name}
                className={`absolute left-0 right-0 mx-auto w-[88%] max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg ${
                  offer.offset ? 'translate-x-6' : ''
                }`}
                style={{
                  top: `${35 + i * 105}px`,
                  zIndex: i + 1,
                  transform: `${offer.offset ? 'translateX(1.5rem) ' : ''}rotate(${offer.rotate}deg)`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display text-base text-foreground leading-tight">{offer.name}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                      {offer.tag}
                    </span>
                  </div>
                  <div className="flex gap-0.5" aria-label={`${offer.stars} av 5 stjärnor i exemplet`}>
                    {[...Array(offer.stars)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pris</p>
                    <p className="text-sm font-semibold text-foreground">{offer.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Leverans</p>
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
