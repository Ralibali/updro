import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldCheck, SlidersHorizontal, UserCheck, ArrowRight, MapPin, Plus } from 'lucide-react'

const trustBadges = [
  { icon: ShieldCheck, title: 'Byråer granskas', desc: 'Företagsuppgifter och presentation kontrolleras före publicering' },
  { icon: SlidersHorizontal, title: 'Färre, mer relevanta svar', desc: 'Varje uppdrag kan få högst fem offerter' },
  { icon: UserCheck, title: 'Du behåller kontrollen', desc: 'Jämför själv och välj om du vill gå vidare' },
]

const foundingAgencies = [
  { name: 'Aurora Media AB', specialization: 'Digital marknadsföring och webbutveckling', city: 'Linköping', badge: 'Grundarbyrå' },
]

const ease = [0.22, 1, 0.36, 1] as const

const AgencyTrustSection = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Ett tryggare urval</p>
          <h2 className="font-display text-3xl text-foreground md:text-5xl">
            Relevanta byråer utan massutskick
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Updro begränsar antalet offerter och gör det lättare att jämföra de byråer som faktiskt passar uppdraget.
          </p>
        </motion.div>

        <div className="mx-auto mb-20 grid max-w-5xl gap-4 md:grid-cols-3">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              className="rounded-2xl border border-border bg-card p-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08, ease }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <badge.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <p className="font-display text-lg leading-tight text-foreground">{badge.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{badge.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mx-auto mb-8 max-w-2xl text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="font-display text-2xl text-foreground md:text-3xl">Byråer på Updro</h3>
          <p className="mt-2 text-sm text-muted-foreground">Nya byråer granskas och läggs till löpande.</p>
        </motion.div>

        <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
          {foundingAgencies.map((agency, index) => (
            <motion.div
              key={agency.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1, ease }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <span className="font-display text-base text-foreground">{agency.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-display text-base leading-tight text-foreground">{agency.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {agency.city}
                    </div>
                  </div>
                </div>
                <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                  {agency.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{agency.specialization}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15, ease }}
          >
            <Link
              to="/registrera/byra"
              className="group flex h-full min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent p-6 text-center transition-colors hover:border-foreground hover:bg-surface-alt"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform group-hover:scale-110">
                <Plus className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <p className="font-display text-base text-foreground">Vill ni synas här?</p>
              <p className="mt-1 text-xs text-muted-foreground">Registrera byrån →</p>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link to="/byraer" className="inline-flex items-center gap-2 font-semibold text-foreground underline decoration-1 underline-offset-4 transition-all hover:decoration-2">
            Utforska alla byråer <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default AgencyTrustSection
