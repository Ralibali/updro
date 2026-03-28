import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldCheck, Star, Clock, ArrowRight, MapPin } from 'lucide-react'

const trustBadges = [
  { icon: ShieldCheck, title: 'Granskade byråer', desc: 'Varje byrå granskas manuellt innan godkännande' },
  { icon: Star, title: 'Verifierade recensioner', desc: 'Riktiga omdömen från verkliga kunder' },
  { icon: Clock, title: 'Svar inom 24 timmar', desc: 'Byråerna förbinder sig att återkomma snabbt' },
]

const exampleAgencies = [
  { name: 'Aurora Media AB', specialization: 'Digital marknadsföring & Webbutveckling', city: 'Linköping', rating: 5.0 },
  { name: 'Pixelcraft Studio', specialization: 'UX/UI Design & E-handel', city: 'Stockholm', rating: 4.9 },
  { name: 'Digiflow AB', specialization: 'SEO & Content Marketing', city: 'Göteborg', rating: 4.8 },
]

const AgencyTrustSection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Kvalitetssäkrade byråer – hela Sverige
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Alla byråer på Updro är granskade och godkända. Vi kontrollerar portfolio, referenskunder och leveranshistorik.
          </p>
        </motion.div>

        {/* Trust badges */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.title}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <badge.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Agency cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {exampleAgencies.map((agency, i) => (
            <motion.div
              key={agency.name}
              className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-sm">
                    {agency.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground">{agency.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {agency.city}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{agency.specialization}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`h-3.5 w-3.5 ${j < Math.floor(agency.rating) ? 'fill-brand-orange text-brand-orange' : 'text-border'}`} />
                  ))}
                  <span className="text-xs font-semibold text-foreground ml-1">{agency.rating}</span>
                </div>
                <span className="text-xs text-primary font-medium">Se profil →</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link to="/byraer" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            Se alla byråer <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default AgencyTrustSection
