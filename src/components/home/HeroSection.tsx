import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HeroSection = () => {
  return (
    <section className="relative min-h-[680px] bg-hero-gradient overflow-hidden flex items-center">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container relative z-10 py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 py-1.5 text-sm font-medium text-brand-blue backdrop-blur">
              <Zap className="h-3.5 w-3.5" />
              Updro.se – Sveriges nya standard för digitala uppdrag
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-8 font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-primary-foreground leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Hitta rätt byrå.
            <br />
            <span className="text-accent">Sluta överkasta pengar.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-6 text-lg md:text-xl text-primary-foreground/70 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Publicera ditt uppdrag gratis och ta emot offerter från kvalificerade byråer inom 24 timmar.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/publicera">
              <Button size="lg" className="bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-full px-8 py-6 text-base font-semibold transition-all active:scale-95">
                Publicera uppdrag – det är gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/registrera/byra">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base font-semibold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 transition-all active:scale-95">
                Jag är byrå – prova gratis 14 dagar
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-primary-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              'Alltid gratis för beställare',
              'Byråer: 5 gratis leads',
              'Inga bindningstider',
            ].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-accent" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
