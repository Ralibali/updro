import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
const steps = [
  {
    number: '01',
    title: 'Beskriv behovet',
    description:
      'Berätta vad ni vill uppnå, vilken budget ni har och när projektet behöver starta. Du behöver inte ha alla svar från början.'
  },
  {
    number: '02',
    title: 'Vi granskar underlaget',
    description:
      'Förfrågan granskas innan den öppnas. Högst tre relevanta byråer kan sedan välja att lämna offert.'
  },
  {
    number: '03',
    title: 'Jämför och ta dialogen',
    description:
      'Gå igenom pris, omfattning och arbetssätt. Ställ frågor och välj själv om du vill gå vidare med någon av byråerna.'
  }
]
export default function HowItWorksSection() {
  return (
    <section
      className="updro-section bg-surface-alt border-y"
      id="hur-det-fungerar"
    >
      <div className="container">
        <div className="updro-section-heading">
          <div>
            <p className="updro-eyebrow">Från idé till rätt samarbete</p>
            <h2>
              Du har projektet.
              <br />
              Vi gör byråvalet enklare.
            </h2>
          </div>
          <p>
            En tydlig process för både beställare och byrå. Du behåller
            kontrollen över nästa steg.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step) => (
            <article key={step.number}>
              <div className="flex items-center gap-5 text-sm text-primary">
                <span>{step.number}</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t flex flex-wrap items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground flex-1 min-w-48">
            Dina kontaktuppgifter visas inte öppet. En byrå behöver aktivt låsa
            upp ditt uppdrag för att få tillgång till dem.
          </p>
          <Link
            to="/metod"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            Läs om granskningen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
