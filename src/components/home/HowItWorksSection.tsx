import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, SearchCheck, MessagesSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    number: '01',
    icon: FileText,
    title: 'Beskriv vad du behöver',
    description: 'Skriv med egna ord eller ta hjälp av vår AI-assistent. Det tar ungefär två minuter och inget konto krävs.',
  },
  {
    number: '02',
    icon: SearchCheck,
    title: 'Vi hittar relevanta byråer',
    description: 'Updro matchar uppdraget med upp till fem granskade byråer utifrån kompetens, budget och tidsplan.',
  },
  {
    number: '03',
    icon: MessagesSquare,
    title: 'Jämför i lugn och ro',
    description: 'Granska upplägg, pris och erfarenhet. Ställ frågor och välj den byrå som känns rätt – utan krav att gå vidare.',
  },
]

const HowItWorksSection = () => {
  return (
    <section className="border-y border-border/70 bg-surface-alt py-20 md:py-24" id="hur-det-fungerar">
      <div className="container">
        <motion.div
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Så fungerar det</p>
          <h2 className="font-display text-3xl text-foreground md:text-5xl">
            Från behov till rätt byrå i tre enkla steg
          </h2>
          <p className="mt-4 text-muted-foreground">
            Du beskriver uppdraget en gång. Därefter får relevanta byråer möjlighet att svara med ett konkret förslag.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.number}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-sm md:p-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="absolute right-5 top-3 font-display text-6xl text-muted-foreground/10" aria-hidden="true">
                {step.number}
              </span>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" strokeWidth={1.7} />
              </div>
              <h3 className="font-display text-2xl text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Link to="/publicera">
            <Button size="lg" className="h-12 rounded-xl px-6 font-semibold">
              Beskriv ditt uppdrag
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorksSection
