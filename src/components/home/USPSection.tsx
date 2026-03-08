import { motion } from 'framer-motion'
import { Check, X, ShieldCheck, TrendingDown, Gift, ClipboardCheck, MessageCircleReply, Timer, Ban } from 'lucide-react'

const features = [
  { icon: MessageCircleReply, text: 'Beställare måste svara – vi följer upp varje offert aktivt' },
  { icon: ShieldCheck, text: 'Kvalitetskontrollerade uppdrag – vi granskar varje projekt innan publicering' },
  { icon: TrendingDown, text: '40% lägre pris per lead – mer valuta för pengarna' },
  { icon: Gift, text: '5 gratis leads vid start – helt utan kreditkort' },
  { icon: Timer, text: 'Inga utdaterade uppdrag – avslutade projekt tas bort direkt' },
  { icon: Ban, text: 'Inga dolda avgifter eller automatisk förnyelse utan varning' },
]

const comparison = [
  { label: 'Lead-pris', updro: '299 kr', competitor: '490 kr', updroGood: true, competitorBad: true },
  { label: 'Gratis leads', updro: '5 st', competitor: '0 st', updroGood: true, competitorBad: true },
  { label: 'Provperiod', updro: '14 dagar', competitor: 'Nej', updroGood: true, competitorBad: true },
  { label: 'Svarsgaranti', updro: 'Ja, aktiv uppföljning', competitor: 'Nej', updroGood: true, competitorBad: true },
  { label: 'Kvalitetskontroll', updro: 'Manuell granskning', competitor: 'Grundläggande', updroGood: true, competitorBad: false },
  { label: 'Bindningstid', updro: 'Nej', competitor: 'Auto-förnyelse', updroGood: true, competitorBad: true },
  { label: 'Kundtjänst', updro: 'Snabb & personlig', competitor: 'Långsam', updroGood: true, competitorBad: true },
]

const USPSection = () => {
  return (
    <section className="bg-surface-2 py-20" id="hur-det-fungerar">
      <div className="container">
        <div className="text-center mb-14">
          <span className="inline-block rounded-full bg-accent/10 text-accent px-4 py-1.5 text-sm font-semibold mb-4">
            Varför byråer väljer oss
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Bättre leads. Lägre pris. Seriösare beställare.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Vi löser de vanligaste frustrationerna för byråer – beställare som inte svarar, dyra leads utan resultat och otydliga uppdrag.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left - features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.text} className="flex items-start gap-3 bg-card rounded-xl border p-4 transition-all hover:shadow-sm">
                  <div className="mt-0.5 rounded-lg bg-accent/10 p-2 text-accent shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <span className="text-foreground/80 text-sm">{f.text}</span>
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
                  <span className="font-display font-bold text-muted-foreground text-sm">Andra</span>
                </div>
              </div>
              {/* Rows */}
              {comparison.map((row) => (
                <div key={row.label} className="grid grid-cols-3 border-t">
                  <div className="p-3 md:p-4 text-xs md:text-sm font-medium text-foreground/80">{row.label}</div>
                  <div className="p-3 md:p-4 text-center text-xs md:text-sm font-semibold text-brand-blue flex items-center justify-center gap-1">
                    <Check className="h-4 w-4 text-accent shrink-0" />
                    <span>{row.updro}</span>
                  </div>
                  <div className="p-3 md:p-4 text-center text-xs md:text-sm text-muted-foreground flex items-center justify-center gap-1">
                    {row.competitorBad ? (
                      <X className="h-4 w-4 text-destructive shrink-0" />
                    ) : null}
                    <span>{row.competitor}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-muted-foreground text-center">
              Jämförelse baserad på marknadens genomsnittspriser
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default USPSection
