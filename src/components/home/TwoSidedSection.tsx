import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const buyerBullets = [
  'Kostnadsfritt och utan bindning',
  'Upp till fem relevanta offerter',
  'Jämför pris, upplägg och erfarenhet',
  'Skicka förfrågan utan att skapa konto',
]

const supplierBullets = [
  'Hitta uppdrag som passar er kompetens',
  'Se kategori, budget och ort före upplåsning',
  'Börja med fem kostnadsfria kundförfrågningar',
  'Välj styckpris eller månadsabonnemang',
]

const TwoSidedSection = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Två sidor, ett enklare samarbete</p>
          <h2 className="font-display text-3xl text-foreground md:text-5xl">
            Byggt för både beställare och byråer
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <motion.div
            className="rounded-3xl bg-foreground p-8 text-background shadow-xl shadow-foreground/10 md:p-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-background/60">För beställare</p>
            <h3 className="font-display text-3xl md:text-4xl">Hitta rätt byrå utan onödigt letande</h3>
            <ul className="mb-9 mt-7 space-y-3">
              {buyerBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" strokeWidth={2.2} />
                  {bullet}
                </li>
              ))}
            </ul>
            <Link to="/publicera">
              <Button className="rounded-xl bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90">
                Beskriv ditt uppdrag
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="rounded-3xl border border-border bg-surface-alt p-8 md:p-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">För byråer</p>
            <h3 className="font-display text-3xl text-foreground md:text-4xl">Lägg tiden på rätt kundförfrågningar</h3>
            <ul className="mb-9 mt-7 space-y-3">
              {supplierBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.2} />
                  {bullet}
                </li>
              ))}
            </ul>
            <Link to="/registrera/byra">
              <Button variant="outline" className="rounded-xl px-6 font-semibold">
                Registrera byrån
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default TwoSidedSection
