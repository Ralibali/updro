import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Clock, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackLeadStarted } from '@/lib/analytics'
import { trackClick } from '@/hooks/usePageTracking'
import UpdroSeal from '@/components/shared/UpdroSeal'

const mockOffers = [
  { initials: 'NA', city: 'Stockholm', price: '48 500 kr', delay: 'efter 4 h', rotate: -2, top: 8 },
  { initials: 'LB', city: 'Göteborg', price: '62 000 kr', delay: 'efter 11 h', rotate: 1, top: 120 },
  { initials: 'MK', city: 'Malmö', price: '54 900 kr', delay: 'efter 19 h', rotate: -1, top: 232 },
]

const HeroSection = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const reduce = useReducedMotion()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const description = query.trim()
    trackLeadStarted('homepage_hero')
    trackClick('lead_started', 'Starta gratis – tar 2 min', {
      source: 'homepage_hero',
      has_description: description.length > 0,
    })
    navigate(`/publicera${description ? `?beskrivning=${encodeURIComponent(description)}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="container relative z-10 py-14 md:py-24">
        <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-center">
          <div className="md:col-span-7 text-left">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground leading-[1.05] [text-wrap:balance]">
              Tre granskade offerter. Inom 24 timmar.
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Beskriv ditt projekt. Updro matchar dig med byråer som verifierats mot Bolagsverket – och du jämför max tre handplockade offerter. Gratis.
            </p>

            {/* Mobile compact stack preview */}
            <div className="md:hidden mt-8">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-mono text-sm font-semibold">
                    NA
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Stockholm</p>
                    <p className="font-mono text-xs text-muted-foreground">48 500 kr · efter 4 h</p>
                  </div>
                  <UpdroSeal size="sm" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground font-mono">+ 2 offerter till</p>
              </div>
            </div>

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
                  className="h-14 rounded-xl px-7 text-base font-semibold shadow-md whitespace-nowrap"
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
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden="true" />
                Verifierade byråer
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden="true" />
                Svar inom 24 h
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" strokeWidth={2} aria-hidden="true" />
                Alltid gratis
              </span>
            </div>
          </div>

          <div className="hidden md:block md:col-span-5 relative h-[420px]" aria-label="Illustrerad offertstack">
            <p className="absolute right-0 -top-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Exempel</p>
            {mockOffers.map((offer, i) => (
              <motion.div
                key={offer.initials}
                initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.15 + i * 0.4, duration: 0.5, ease: 'easeOut' }}
                className="absolute left-0 right-0 mx-auto w-[88%] max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg"
                style={{
                  top: `${offer.top}px`,
                  zIndex: i + 1,
                  transform: `rotate(${offer.rotate}deg)`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 text-primary grid place-items-center font-mono text-sm font-semibold">
                    {offer.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg text-foreground leading-tight">Byrå {offer.initials}</p>
                    <p className="text-xs text-muted-foreground">{offer.city}</p>
                  </div>
                  <UpdroSeal size="sm" />
                </div>
                <div className="mt-4 flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Offert</p>
                    <p className="font-mono text-base font-semibold text-foreground">{offer.price}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                    {offer.delay}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
