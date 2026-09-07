import { Mail, ShieldCheck } from 'lucide-react'

const steps = [
  ['Beskriv behovet', 'Egna ord räcker. Du behöver ingen färdig kravspecifikation.'],
  ['Vi granskar förfrågan', 'När uppdraget godkänts kan byråer läsa beskrivningen och lämna offert.'],
  ['Jämför och välj själv', 'Du får högst tre offerter och behöver inte tacka ja till någon av dem.'],
]

const BuyerConfidence = () => (
  <aside id="forfragan-hjalp" tabIndex={-1} aria-label="Hjälp inför din förfrågan" className="min-w-0 scroll-mt-24 space-y-4 outline-none lg:sticky lg:top-24 lg:self-start">
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2 text-primary">
        <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
        <h2 className="font-display text-base font-bold">Du bestämmer hela vägen</h2>
      </div>
      <ol className="space-y-5">
        {steps.map(([title, description], index) => (
          <li key={title} className="flex gap-3">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>
      <details className="mt-5 border-t border-border pt-4 text-sm">
        <summary className="cursor-pointer font-semibold leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Vem får mina kontaktuppgifter?</summary>
        <p className="mt-3 leading-relaxed text-muted-foreground">Byråer som öppnar kontaktuppgifterna till ditt godkända uppdrag kan nå dig via e-post och det telefonnummer du väljer att ange. Skriv kontaktuppgifter i kontaktfälten, inte i uppdragsbeskrivningen.</p>
        <a href="/integritetspolicy" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-primary underline underline-offset-4" aria-label="Läs integritetspolicyn (öppnas i ny flik)">Läs integritetspolicyn</a>
      </details>
      <details className="mt-4 border-t border-border pt-4 text-sm">
        <summary className="cursor-pointer font-semibold leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Vad kostar det för mig?</summary>
        <p className="mt-3 leading-relaxed text-muted-foreground">Det är gratis att lämna en förfrågan och jämföra offerter. Updro finansieras av byråerna. Om du väljer en byrå kommer ni överens om priset för själva arbetet.</p>
      </details>
    </div>
    <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-6">
      <h2 className="font-display text-base font-bold">Frågor innan du skickar?</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Kontakta oss om du är osäker på hur Updro fungerar eller vad du ska ta med i förfrågan.</p>
      <a href="mailto:info@auroramedia.se" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Mail className="h-4 w-4" aria-hidden="true" /> Mejla Updro
      </a>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Updro drivs av Aurora Media AB<br />Org.nr 559272-0220</p>
      <a href="/om-oss" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-primary underline underline-offset-4" aria-label="Läs om oss (öppnas i ny flik)">Läs om oss</a>
    </div>
  </aside>
)

export default BuyerConfidence
