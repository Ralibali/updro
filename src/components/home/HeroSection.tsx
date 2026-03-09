import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Check, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HeroSection = () => {
  return (
    <section className="relative min-h-[720px] overflow-hidden flex items-center bg-background">
      {/* Abstract shapes */}
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      <div className="absolute top-40 left-1/3 w-[200px] h-[200px] rounded-full bg-accent/10 blur-2xl" />

      <div className="container relative z-10 py-20 md:py-28">
        <div className="max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
              <Flame className="h-3.5 w-3.5" />
              Bättre leads. Lägre pris. Seriösa beställare.
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-8 font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Kunderna letar redan
            <br />
            <span className="text-brand-gradient">— syns du?</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Kvalitetssäkrade uppdrag med beställare som faktiskt engagerar sig. Max fem byråer per uppdrag – varje lead räknas.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/publicera">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-6 text-base font-semibold shadow-blue transition-all active:scale-[0.98]">
                Publicera uppdrag – gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/registrera/byra">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base font-semibold border-border hover:bg-accent/5 hover:border-accent/30 transition-all active:scale-[0.98]">
                <Sparkles className="mr-2 h-4 w-4 text-accent" />
                Prova gratis i 14 dagar
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              'Gratis för beställare',
              'Fem gratis leads vid start',
              '40% lägre pris per lead',
              'Max fem byråer per uppdrag',
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
