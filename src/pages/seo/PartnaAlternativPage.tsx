import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const comparisonRows = [
  ['Antal offerter per uppdrag', 'Max tre handplockade offerter per uppdrag.', 'Upp till sex offerter per förfrågan enligt Partnas publika information.'],
  ['Pris per lead (byrå)', 'Cirka 119 kr per lead.', 'Cirka 490 kr per lead enligt Partnas publika prislista.'],
  ['Månadskort (byrå)', '1 995 kr/mån för obegränsat antal leads.', '1 950 kr/mån för upp till 10 leads enligt Partnas publika prislista.'],
  ['För beställare', 'Gratis. Svar inom 24 timmar.', 'Gratis offertförfrågan.'],
  ['Primärt fokus', 'Digitala byråer: webb, SEO, e-handel, appar, design och marknadsföring.', 'Digitala projekt och byråmatchning inom flera närliggande områden.'],
]

const CALC = {
  leads: 20,
  partnaPerLead: 490,
  updroMonth: 1995,
  updroPerLead: 119,
  partnaMonth: 1950,
  partnaMonthLeads: 10,
}

const faqs = [
  {
    q: 'Är Updro ett alternativ till Partna?',
    a: 'Ja. Updro är ett svenskt alternativ för företag som vill jämföra offerter från digitala byråer inom webbutveckling, SEO, e-handel, appar och digital marknadsföring.',
  },
  {
    q: 'Vad kostar Updro för en byrå jämfört med Partna?',
    a: 'Updro tar cirka 119 kr per lead eller 1 995 kr/mån för obegränsat antal leads. Partna anger cirka 490 kr per lead och 1 950 kr/mån för upp till 10 leads. Aktuella priser och villkor bör alltid kontrolleras direkt hos respektive plattform.',
  },
  {
    q: 'Hur många offerter kan en beställare få?',
    a: 'På Updro får du max tre handplockade offerter per uppdrag för att göra jämförelsen enkel. Partna anger upp till sex offerter enligt publik information.',
  },
  {
    q: 'Kostar det något att använda Updro som beställare?',
    a: 'Nej. Updro är gratis för beställare. Du beskriver ditt projekt och kan jämföra offerter utan förpliktelser.',
  },
  {
    q: 'När ska jag välja Updro?',
    a: 'Updro passar särskilt bra när du vill hitta en digital byrå, förstå ungefärlig budget och jämföra flera alternativ innan du bestämmer dig.',
  },
]


const PartnaAlternativPage = () => {
  useEffect(() => {
    const canonical = 'https://updro.se/partna-alternativ'
    setSEOMeta({
      title: 'Partna alternativ – jämför digitala byråer med Updro',
      description: 'Letar du efter ett alternativ till Partna? Updro hjälper företag att få offerter från kvalitetssäkrade digitala byråer inom webb, SEO, e-handel, appar och marknadsföring.',
      canonical,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'Partna alternativ', url: canonical },
    ])
    setJsonLd('partna-alternativ-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Alternativ till Partna</p>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground [text-wrap:balance]">
              Jämför digitala byråer utan att fastna i fel matchning
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Updro är byggt för företag som vill hitta rätt webbyrå, SEO-byrå, e-handelsbyrå eller digital partner snabbare. Beskriv projektet, få relevanta offerter och jämför upplägg, pris och leverans innan du väljer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/publicera">
                <Button size="lg" className="rounded-xl px-7">
                  Få offerter gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/hitta-webbyra">
                <Button size="lg" variant="outline" className="rounded-xl px-7">
                  Se hur det fungerar
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ['Gratis', 'för uppdragsgivare'],
              ['Max 3', 'handplockade offerter'],
              ['24h', 'svar från byråer'],
              ['Sverige', 'digitala byråer i flera kategorier'],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border bg-card p-5">
                <p className="font-display text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>


        <section className="border-y bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-3xl mb-8">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Updro vs Partna – vad ska du titta på?</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Välj plattform efter vad du behöver: snabb prisbild, bra matchning, tydlig projektbrief och byråer som faktiskt passar ditt projekt.
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th className="p-4 font-semibold">Område</th>
                    <th className="p-4 font-semibold">Updro</th>
                    <th className="p-4 font-semibold">Partna</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(row => (
                    <tr key={row[0]} className="border-t align-top">
                      <td className="p-4 font-medium text-foreground">{row[0]}</td>
                      <td className="p-4 text-muted-foreground">{row[1]}</td>
                      <td className="p-4 text-muted-foreground">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ['Tydligare projektbrief', 'Updro hjälper dig formulera mål, budget, tidsplan, teknik och krav så att byråerna kan lämna bättre offerter.'],
              ['Kategorier som matchar köpintention', 'Webbyrå, SEO-byrå, Shopify, Google Ads, apputveckling och lokala byråer kräver olika typer av matchning.'],
              ['Jämför mer än pris', 'Se helheten: process, leverans, support, kompetens, portfolio och hur byrån tänker mäta resultat.'],
              ['Byggt för digitala uppdrag', 'Updro fokuserar på digitala byråtjänster och ska hjälpa både beställare och leverantörer att hitta bättre matchningar.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container pb-4">
          <div className="rounded-3xl border-2 border-foreground bg-secondary p-6 md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Räkneexempel</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight">
              {CALC.leads} leads i månaden – så mycket skiljer det
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Partna (per lead)</p>
                <p className="mt-3 font-display text-3xl font-bold">
                  {(CALC.leads * CALC.partnaPerLead).toLocaleString('sv-SE')} kr
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {CALC.leads} leads × {CALC.partnaPerLead} kr
                </p>
              </div>
              <div className="rounded-2xl border-2 border-accent bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">Updro månadskort</p>
                <p className="mt-3 font-display text-3xl font-bold">
                  {CALC.updroMonth.toLocaleString('sv-SE')} kr
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Obegränsat antal leads / månad
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Skillnad</p>
                <p className="mt-3 font-display text-3xl font-bold text-accent">
                  {(CALC.leads * CALC.partnaPerLead - CALC.updroMonth).toLocaleString('sv-SE')} kr
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  lägre kostnad per månad med Updro
                </p>
              </div>
            </div>
            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <li>• Updro: {CALC.updroPerLead} kr/lead eller {CALC.updroMonth.toLocaleString('sv-SE')} kr/mån obegränsat</li>
              <li>• Partna: {CALC.partnaPerLead} kr/lead eller {CALC.partnaMonth.toLocaleString('sv-SE')} kr/mån för {CALC.partnaMonthLeads} leads</li>
              <li>• Updro visar max tre byråer per uppdrag</li>
              <li>• Partna anger upp till sex byråer per förfrågan</li>
            </ul>
            <p className="mt-6 rounded-xl border border-dashed border-muted-foreground/40 bg-background/60 p-4 text-xs text-muted-foreground">
              <strong>Notering:</strong> Priser och villkor är samlade från publikt tillgänglig information om Partna och Updro och kan ändras. Kontrollera alltid aktuella priser och villkor direkt hos respektive plattform innan beslut.
            </p>
          </div>
        </section>

        <section className="container pb-16">
          <div className="max-w-3xl">

            <h2 className="font-display text-3xl font-bold mb-6">Vanliga frågor</h2>
            <div className="space-y-3">
              {faqs.map(item => (
                <details key={item.q} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer font-semibold">{item.q}</summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-20">
          <div className="rounded-3xl bg-foreground p-8 md:p-12 text-background">
            <h2 className="font-display text-3xl md:text-4xl font-bold">Redo att jämföra byråer?</h2>
            <p className="mt-3 max-w-2xl text-background/75">
              Beskriv ditt projekt idag och få relevanta offerter från digitala byråer. Det tar bara några minuter och kostar inget.
            </p>
            <Link to="/publicera" className="mt-7 inline-block">
              <Button size="lg" variant="secondary" className="rounded-xl px-7">
                Starta gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PartnaAlternativPage
