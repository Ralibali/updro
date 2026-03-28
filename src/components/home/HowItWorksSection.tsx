import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '1',
    title: 'Beskriv ditt projekt',
    description: 'Berätta vad du behöver hjälp med – det tar två minuter. Ingen registrering krävs.',
  },
  {
    number: '2',
    title: 'Matcha med byråer',
    description: 'Vi matchar din förfrågan med upp till 5 kvalitetssäkrade byråer som passar ditt uppdrag och din budget.',
  },
  {
    number: '3',
    title: 'Jämför och välj',
    description: 'Byråerna kontaktar dig direkt med offerter. Du jämför, ställer frågor och väljer den som passar bäst.',
  },
]

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-[#F8FAFF] dark:bg-muted/20" id="hur-det-fungerar">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Så enkelt fungerar Updro – beskriv projekt, få offerter, välj byrå
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
            >
              {/* Arrow connector on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-8 left-[65%] w-[70%] items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-primary/30" />
                </div>
              )}

              <div className="mb-5">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-2xl font-bold">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
