import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary border-y-2 border-foreground">
      <motion.div
        className="container text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block px-3 py-1 border border-foreground text-[11px] font-bold uppercase tracking-widest bg-background font-display mb-6">
          Kom igång på cirka två minuter
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground leading-[0.95] tracking-tight">
          Hitta rätt byrå – <span className="text-accent">utan massutskick.</span>
        </h2>
        <p className="text-foreground/80 mb-10 text-lg max-w-xl mx-auto">
          Beskriv projektet en gång. Updro granskar briefen och högst tre relevanta svenska byråer kan lämna offert. Gratis och utan förpliktelser.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/publicera">
            <button className="h-14 px-8 bg-accent text-accent-foreground text-base font-bold font-display uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:bg-[hsl(14_75%_50%)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all inline-flex items-center justify-center gap-2">
              Beskriv ditt projekt
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link to="/registrera/byra">
            <button className="h-14 px-8 bg-background text-foreground text-base font-bold font-display uppercase tracking-wide border-2 border-foreground hover:bg-foreground hover:text-background transition-colors inline-flex items-center justify-center gap-2">
              Registrera din byrå
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default CTASection
