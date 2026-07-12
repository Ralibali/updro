import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Beskriv ditt projekt',
    description: 'Berätta vad du behöver hjälp med, ungefärlig budget och önskad start. Det tar cirka två minuter och kräver inget konto.',
    align: 'left' as const,
  },
  {
    number: '02',
    title: 'Vi granskar och matchar',
    description: 'Updro granskar briefen innan den öppnas för relevanta byråer. Högst tre byråer kan lämna offert på samma uppdrag.',
    align: 'right' as const,
  },
  {
    number: '03',
    title: 'Jämför i lugn och ro',
    description: 'Jämför pris, upplägg och kompetens. Du väljer själv om du vill gå vidare och förbinder dig inte till något.',
    align: 'left' as const,
  },
]

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-surface-alt" id="hur-det-fungerar">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-5xl text-foreground">
            Så enkelt fungerar Updro
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Färre men mer relevanta svar gör det lättare att faktiskt jämföra byråerna.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-16 md:space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className={`flex items-start gap-6 max-w-md ${
                step.align === 'right' ? 'md:ml-auto md:mr-0' : 'md:ml-0 md:mr-auto'
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-display text-6xl font-normal text-muted-foreground/40 leading-none shrink-0">
                {step.number}
              </span>
              <div className="pt-2">
                <h3 className="font-display text-2xl text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
