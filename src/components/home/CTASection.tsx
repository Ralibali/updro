import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'

const CTASection = () => {
  const reduce = useReducedMotion()

  return (
    <section className="py-20 md:py-28 bg-secondary border-y-2 border-foreground" aria-labelledby="slut-cta-rubrik">
      <motion.div className="container text-center max-w-3xl mx-auto" initial={reduce ? undefined : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <span className="inline-block px-3 py-1 border border-foreground text-[11px] font-bold uppercase tracking-widest bg-background font-display mb-6">Kom igång på cirka två minuter</span>
        <h2 id="slut-cta-rubrik" className="font-display text-4xl md:text-6xl font-bold mb-6 text-foreground leading-[0.95] tracking-tight">
          Ett projekt. En brief. <span className="text-accent">Max tre offerter.</span>
        </h2>
        <p className="text-foreground/80 mb-9 text-lg max-w-xl mx-auto leading-relaxed">
          Beskriv projektet en gång och få ett tydligare underlag att jämföra. Det kostar inget för beställare och du förbinder dig inte genom att publicera.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/publicera" className="min-h-14 px-8 bg-accent text-accent-foreground text-sm font-bold font-display uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all inline-flex items-center justify-center gap-2">
            Beskriv projektet gratis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/for-byraer" className="min-h-14 px-8 bg-background text-foreground text-sm font-bold font-display uppercase tracking-wide border-2 border-foreground hover:bg-foreground hover:text-background transition-colors inline-flex items-center justify-center gap-2">
            <Building2 className="h-4 w-4" /> Jag driver byrå
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Ingen registrering krävs för att börja · ingen bindning</p>
      </motion.div>
    </section>
  )
}

export default CTASection
