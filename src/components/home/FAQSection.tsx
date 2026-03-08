import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'Är det gratis att publicera ett uppdrag?',
    a: 'Ja, det är helt gratis för beställare att publicera uppdrag och ta emot offerter. Du betalar ingenting – det är byråerna som betalar för leads.',
  },
  {
    q: 'Hur många offerter får jag?',
    a: 'Du kan få upp till fem offerter per uppdrag. Vi begränsar antalet medvetet så att varje byrå har en reell chans och du slipper bli överväldigad av kontakter.',
  },
  {
    q: 'Hur väljer ni vilka byråer som får svara?',
    a: 'Alla byråer på Updro är kvalitetssäkrade och verifierade. Byråerna väljer själva vilka uppdrag de vill svara på baserat på sina specialistområden och kapacitet.',
  },
  {
    q: 'Vad kostar det för byråer?',
    a: 'Byråer betalar per lead de låser upp. Priset varierar beroende på plan – från 299 kr per lead. Nya byråer får fem gratis leads för att testa plattformen.',
  },
  {
    q: 'Är beställarna verifierade?',
    a: 'Ja, alla beställare verifieras via mobilnummer eller BankID. Det säkerställer att uppdragen är seriösa och att byråerna inte slösar tid på fejkade förfrågningar.',
  },
  {
    q: 'Hur lång tid tar det att få offerter?',
    a: 'De flesta byråer svarar inom ett dygn. Eftersom konkurrensen om varje uppdrag är begränsad till max fem byråer är motivationen att svara snabbt hög.',
  },
]

const FAQSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-semibold mb-4">
            Vanliga frågor
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Har du frågor? Vi har svar.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border rounded-xl px-5 bg-card shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-sm md:text-base hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>

      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </section>
  )
}

export default FAQSection
