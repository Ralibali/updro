import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowRight, Globe, ShoppingCart, Search,
  Smartphone, Megaphone, Bot,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { trackLeadStarted } from '@/lib/analytics'
import { trackClick } from '@/hooks/usePageTracking'

const categories = [
  { icon: Globe, label: 'Webbutveckling' },
  { icon: ShoppingCart, label: 'E-handel' },
  { icon: Bot, label: 'AI-utveckling' },
  { icon: Search, label: 'SEO' },
  { icon: Megaphone, label: 'Digital marknadsföring' },
  { icon: Smartphone, label: 'App-utveckling' },
]

const HeroSection = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const reduce = useReducedMotion()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const description = query.trim()
    trackLeadStarted('homepage_hero')
    trackClick('lead_started', 'Starta gratis – tar 2 min', {
      source: 'homepage_hero',
      has_description: description.length > 0,
    })
    navigate(`/publicera${description ? `?beskrivning=${encodeURIComponent(description)}` : ''}`)
  }

  return (
    <section className="relative bg-background border-b border-foreground/10">
      <div className="container py-14 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 flex flex-col space-y-8">
            <motion.span
              initial={reduce ? undefined : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-block self-start px-3 py-1 border border-foreground text-[11px] font-bold uppercase tracking-widest bg-secondary font-display"
            >
              Sveriges marknadsplats för digitala uppdrag
            </motion.span>

            <motion.h1
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-foreground [text-wrap:balance]"
            >
              Max tre relevanta offerter.{' '}
              <span className="text-accent">Utan massutskick.</span>
            </motion.h1>

            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="text-lg md:text-xl text-foreground/80 max-w-xl leading-relaxed"
            >
              Beskriv behovet på två minuter. Updro granskar briefen och öppnar den för matchande svenska byråer. Högst tre kan lämna offert, så att du kan jämföra ordentligt i stället för att bli nedringd. <span className="font-semibold text-foreground">Gratis för beställare.</span>
            </motion.p>

            <form onSubmit={handleSubmit} className="w-full max-w-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  name="project-description"
                  aria-label="Kort beskrivning av projektet"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="T.ex. ny Shopify-butik eller automatisera kundtjänsten med AI"
                  className="flex-1 h-14 rounded-none text-base px-5 border-2 border-foreground bg-card focus-visible:ring-0 focus-visible:border-accent"
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="h-14 px-8 bg-accent text-accent-foreground text-base font-bold font-display uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:bg-[hsl(14_75%_50%)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all whitespace-nowrap inline-flex items-center justify-center gap-2"
                >
                  Starta gratis – tar 2 min
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Ingen registrering krävs. Du förbinder dig inte till något.
              </p>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {['Max tre byråer', 'Briefen granskas', 'Gratis för beställare'].map(chip => (
                <div
                  key={chip}
                  className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-foreground/15 text-xs font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {chip}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Vanliga uppdrag</p>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.label}
                  initial={reduce ? undefined : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  className={index % 2 === 1 ? 'mt-8' : ''}
                >
                  <Link
                    to={`/publicera?kategori=${encodeURIComponent(category.label)}`}
                    className="group block p-6 bg-secondary border-2 border-foreground hover:bg-foreground transition-colors duration-200 h-full"
                  >
                    <div className="w-10 h-10 mb-4 flex items-center justify-center bg-background border-2 border-foreground group-hover:bg-background">
                      <category.icon className="w-5 h-5 text-foreground" strokeWidth={2} />
                    </div>
                    <h3 className="font-display font-bold text-base leading-tight text-foreground group-hover:text-background transition-colors">
                      {category.label}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
