import { Link } from 'react-router-dom'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { HOME_FAQ } from '@/lib/homeSeo'
export default function FAQSection() {
  return (
    <section className="updro-section">
      <div className="container grid lg:grid-cols-[.8fr_1.2fr] gap-10 lg:gap-20">
        <div>
          <p className="updro-eyebrow">Bra att veta</p>
          <h2 className="updro-section-title">
            Lite mer klarhet.
            <br />
            Redan från början.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Undrar du över något annat?
            <br />
            <Link
              to="/support"
              className="text-primary underline underline-offset-4"
            >
              Kontakta oss
            </Link>{' '}
            så hjälper vi dig.
          </p>
        </div>
        <Accordion type="single" collapsible>
          {HOME_FAQ.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`faq-${index}`}
              className="border-b first:border-t"
            >
              <AccordionTrigger className="text-left font-medium text-base hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
