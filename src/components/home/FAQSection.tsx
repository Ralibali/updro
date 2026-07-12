import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'Kostar det något att använda Updro?',
    a: 'Nej. Det är gratis för dig som söker byrå. Byråer betalar per lead de själva väljer att låsa upp eller använder ett månadskort.',
  },
  {
    q: 'Hur många offerter kan jag få?',
    a: 'Högst tre byråer kan lämna offert på samma uppdrag. Tanken är att du ska få ett hanterbart antal relevanta alternativ, inte ett massutskick.',
  },
  {
    q: 'Hur snabbt får jag svar?',
    a: 'Svarstiden beror på kategori, budget och tillgängliga byråer. Updro öppnar uppdraget efter granskning och meddelar dig när en offert kommer, men garanterar inte en viss svarstid.',
  },
  {
    q: 'Hur granskas uppdrag och byråer?',
    a: 'Nya uppdrag granskas innan de aktiveras. Byråer lämnar företags- och kontaktuppgifter och kan få olika verifieringsnivåer när underlaget har kontrollerats. Aktuell verifieringsstatus visas i tjänsten.',
  },
  {
    q: 'Måste jag registrera mig?',
    a: 'Nej. Du kan skicka in en förfrågan utan konto. Ett kostnadsfritt konto behövs först när du vill följa offerter och dialog i dashboarden.',
  },
  {
    q: 'Vad händer med mina kontaktuppgifter?',
    a: 'Kontaktuppgifterna är låsta och blir bara synliga för en byrå som aktivt väljer att låsa upp just ditt uppdrag. De visas inte öppet i marknadsplatsen.',
  },
]

const FAQSection = () => {
  return (
    <section className="py-20">
      <div className="container max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-5xl text-foreground">Vanliga frågor</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`} className="border-b border-border last:border-0">
                <AccordionTrigger className="text-left font-display text-lg md:text-xl text-foreground hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />
    </section>
  )
}

export default FAQSection
