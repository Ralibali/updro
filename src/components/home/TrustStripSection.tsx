import { CheckCircle2, FileSearch, ShieldCheck, UsersRound } from 'lucide-react'

const items = [
  {
    icon: CheckCircle2,
    title: 'Gratis för beställare',
    text: 'Det kostar inget att beskriva projektet eller jämföra offerter.',
  },
  {
    icon: UsersRound,
    title: 'Högst tre offerter',
    text: 'Du får ett hanterbart urval i stället för ett massutskick.',
  },
  {
    icon: FileSearch,
    title: 'Briefen granskas',
    text: 'Vi kontrollerar underlaget innan uppdraget öppnas för byråer.',
  },
  {
    icon: ShieldCheck,
    title: 'Ingen registrering för att börja',
    text: 'Beskriv behovet först. Konto behövs först när du vill följa dialogen.',
  },
]

const TrustStripSection = () => (
  <section className="border-b-2 border-foreground bg-card" aria-label="Så fungerar Updro i korthet">
    <div className="container py-5 md:py-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(item => (
          <div key={item.title} className="flex items-start gap-3 border border-foreground/10 bg-background px-4 py-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border border-foreground bg-secondary">
              <item.icon className="h-4 w-4 text-accent" aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default TrustStripSection
