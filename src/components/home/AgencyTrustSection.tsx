import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldCheck, UsersRound, FileSearch, ArrowRight, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'

const trustPoints = [
  {
    icon: FileSearch,
    title: 'Briefen granskas före publicering',
    description: 'Nya uppdrag får status väntande tills Updro har kontrollerat att behovet, budgeten och kontaktuppgifterna är användbara.',
  },
  {
    icon: UsersRound,
    title: 'Högst tre byråer per uppdrag',
    description: 'Beställaren får ett hanterbart beslutsunderlag och varje byrå möter färre konkurrenter än på en öppen massmarknadsplats.',
  },
  {
    icon: LockKeyhole,
    title: 'Kontaktuppgifter skyddas',
    description: 'Byrån ser briefen först och låser bara upp kontakten när uppdraget faktiskt passar. Personuppgifter delas inte öppet.',
  },
  {
    icon: ShieldCheck,
    title: 'Kreditprövning vid dåliga leads',
    description: 'En byrå kan rapportera ogiltig kontakt, falskt uppdrag eller felaktig omfattning och begära att lead-krediten återförs efter granskning.',
  },
]

const AgencyTrustSection = () => {
  return (
    <section className="py-20 border-y bg-card">
      <div className="container">
        <motion.div
          className="max-w-3xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Updros skillnad</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl text-foreground">
            Färre svar. Mer kontroll. Bättre förutsättningar för en riktig affär.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
            Updro försöker inte vinna genom att skicka samma förfrågan till så många som möjligt. Produkten är byggd runt granskade briefar, begränsad konkurrens och tydlig transparens för både beställare och byrå.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl">
          {trustPoints.map((point, index) => (
            <motion.article
              key={point.title}
              className="rounded-2xl border bg-background p-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <point.icon className="h-6 w-6 text-accent" strokeWidth={1.8} />
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{point.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{point.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Link to="/publicera">
            <Button className="rounded-xl">
              Beskriv ditt projekt <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/registrera/byra">
            <Button variant="outline" className="rounded-xl">Registrera din byrå</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default AgencyTrustSection
