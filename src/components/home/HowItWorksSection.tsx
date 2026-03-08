import { motion } from 'framer-motion'
import { ClipboardList, MessageSquareText, Handshake } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    number: '1',
    title: 'Publicera ditt uppdrag',
    description: 'Beskriv vad du behöver – det tar bara två minuter. Helt gratis och utan förpliktelser.',
  },
  {
    icon: MessageSquareText,
    number: '2',
    title: 'Få offerter från byråer',
    description: 'Upp till fem kvalificerade byråer skickar skräddarsydda offerter direkt till dig.',
  },
  {
    icon: Handshake,
    number: '3',
    title: 'Välj rätt byrå',
    description: 'Jämför pris, portfolio och omdömen – och välj den byrå som passar dig bäst.',
  },
]

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/30" id="hur-det-fungerar">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold mb-4">
            Så fungerar det
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Tre enkla steg till rätt byrå
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Från uppdrag till färdig offert – snabbt, enkelt och helt kostnadsfritt för beställare.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
            >
              {/* Connector line (between cards on desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
              )}

              <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-card border shadow-sm">
                <step.icon className="h-8 w-8 text-primary" />
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
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
