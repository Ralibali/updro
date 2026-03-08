import { motion } from 'framer-motion'
import { Check, X, ShieldCheck, TrendingDown, Gift, ClipboardCheck } from 'lucide-react'

const features = [
  { icon: ShieldCheck, text: 'Verifierade beställare via e-post & verifieringsprocess' },
  { icon: TrendingDown, text: '40% lägre pris än konkurrenterna' },
  { icon: Gift, text: '5 gratis leads för nya byråer – inget kreditkort' },
  { icon: ClipboardCheck, text: 'Kvalitetskontroll av alla uppdrag innan publicering' },
]

const comparison = [
  { label: 'Lead-pris', updro: '299 kr', competitor: '490 kr' },
  { label: 'Gratis leads', updro: '5 st', competitor: '0 st' },
  { label: 'Provperiod', updro: '14 dagar', competitor: 'Nej' },
  { label: 'Bindningstid', updro: 'Nej', competitor: 'Nej' },
]

const USPSection = () => {
  return (
    <section className="bg-surface-2 py-20" id="hur-det-fungerar">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
              Bättre leads. Lägre pris.
            </h2>
            <div className="space-y-5">
              {features.map((f) => (
                <div key={f.text} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-accent/10 p-2 text-accent">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-foreground/80">{f.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - comparison */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-card rounded-2xl border overflow-hidden shadow-md">
              {/* Header */}
              <div className="grid grid-cols-3">
                <div className="p-4" />
                <div className="p-4 bg-brand-blue text-center">
                  <span className="font-display font-bold text-primary-foreground text-sm">Updro</span>
                </div>
                <div className="p-4 bg-muted text-center">
                  <span className="font-display font-bold text-muted-foreground text-sm">Konkurrenten</span>
                </div>
              </div>
              {/* Rows */}
              {comparison.map((row) => (
                <div key={row.label} className="grid grid-cols-3 border-t">
                  <div className="p-4 text-sm font-medium text-foreground/80">{row.label}</div>
                  <div className="p-4 text-center text-sm font-semibold text-brand-blue flex items-center justify-center gap-1">
                    <Check className="h-4 w-4 text-accent" />
                    {row.updro}
                  </div>
                  <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {row.competitor === 'Nej' || row.competitor === '0 st' ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null}
                    {row.competitor}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default USPSection
