import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Check, Globe, ShoppingCart, Search, Smartphone, Megaphone, Bot } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { trackLeadStarted } from '@/lib/analytics'
import { trackClick } from '@/hooks/usePageTracking'

const categories = [
  { icon: Globe, label: 'Webbutveckling', slug: 'webbutveckling' },
  { icon: ShoppingCart, label: 'E-handel', slug: 'ehandel' },
  { icon: Bot, label: 'AI-utveckling', slug: 'ai-utveckling' },
  { icon: Search, label: 'SEO', slug: 'seo' },
  { icon: Megaphone, label: 'Digital marknadsföring', slug: 'digital-marknadsforing' },
  { icon: Smartphone, label: 'App-utveckling', slug: 'apputveckling' },
]

const HeroSection = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const reduce = useReducedMotion()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const description = query.trim()
    trackLeadStarted('homepage_hero')
    trackClick('lead_started', 'Beskriv projektet gratis', { source: 'homepage_hero', has_description: description.length > 0 })
    navigate(`/publicera${description ? `?beskrivning=${encodeURIComponent(description)}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden bg-background border-b border-foreground/10">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="container relative px-5 py-8 sm:px-8 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <motion.div initial={reduce ? undefined : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> Gratis för beställare</span>
              <span className="text-muted-foreground">·</span>
              <span>Högst tre offerter</span>
              <span className="text-muted-foreground">·</span>
              <span>Ingen registrering för att börja</span>
            </motion.div>

            <motion.h1 initial={reduce ? undefined : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="mt-5 font-display text-[2.25rem] sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-foreground [text-wrap:balance]">
              Jämför rätt byrå – <span className="text-accent">utan att jaga offerter.</span>
            </motion.h1>

            <motion.p initial={reduce ? undefined : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="mt-4 text-base md:text-lg text-foreground/80 max-w-2xl leading-relaxed">
              Hitta en svensk byrå för webb, e-handel eller marknadsföring. Beskriv behovet en gång och jämför upp till tre offerter. Gratis och utan köpkrav.
            </motion.p>

            <motion.form id="homepage-project-form" onSubmit={handleSubmit} initial={reduce ? undefined : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} className="mt-6 w-full max-w-2xl">
              <label htmlFor="homepage-description" className="mb-2 block text-sm font-semibold">Vad vill du ha hjälp med?</label>
              <div className="flex flex-col xl:flex-row gap-3">
                <Input id="homepage-description" name="project-description" aria-label="Kort beskrivning av projektet" value={query} onChange={event => setQuery(event.target.value)} placeholder="T.ex. en ny hemsida med bokning" className="min-w-0 flex-1 h-14 rounded-xl text-base px-4 border-2 border-foreground/80 bg-card focus-visible:ring-0 focus-visible:border-accent" maxLength={500} />
                <button type="submit" className="h-14 px-7 bg-accent text-accent-foreground text-sm font-bold font-display border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:-translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1 transition-all whitespace-nowrap inline-flex items-center justify-center gap-2">
                  Beskriv projektet gratis <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                <span>Cirka 2 minuter · Inget konto krävs</span><Link to="/byraer" className="font-medium text-foreground underline underline-offset-4">Se byråerna först</Link>
              </div>
            </motion.form>
          </div>

          <motion.aside initial={reduce ? undefined : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-5">
            <div className="border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ett enklare byråval</p>
              <div className="mt-5 space-y-4">
                {[
                  ['1', 'Beskriv ditt projekt', 'Beskriv behov, budget och önskad start en gång.'],
                  ['2', 'Vi granskar och matchar', 'Högst tre relevanta byråer kan lämna offert.'],
                  ['3', 'Du jämför och väljer', 'Se pris och upplägg. Gå vidare bara om det passar.'],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex gap-4 border-b border-foreground/10 pb-4 last:border-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-foreground bg-secondary font-display font-bold">{number}</span>
                    <div><p className="font-display font-bold">{title}</p><p className="mt-1 text-sm text-muted-foreground leading-relaxed">{text}</p></div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-foreground/10 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vanliga uppdrag</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <Link key={category.label} to={`/publicera/${category.slug}${query.trim() ? `?beskrivning=${encodeURIComponent(query.trim())}` : ''}`} className="group flex min-h-11 items-center gap-2 border border-foreground/15 bg-secondary/60 px-3 py-2 text-xs font-semibold hover:border-foreground hover:bg-secondary transition-colors">
                      <category.icon className="h-4 w-4 shrink-0 text-foreground" /><span>{category.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
