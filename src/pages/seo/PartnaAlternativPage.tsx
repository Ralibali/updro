import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const comparisonRows = [
  ['Pris per lead', '119 kr', '490 kr'],
  ['Månadskort', '1 995 kr – obegränsat', '1 950 kr – 10 leads'],
  ['Konkurrens per uppdrag', 'Max tre byråer', 'Upp till sex byråer'],
  ['Beslutsstöd', 'AI-driven offertjämförelse', 'Manuell jämförelse'],
  ['Leadkvalitet', 'AI-brief och lead score', 'Kvalificerad förfrågan'],
  ['Svarstid', 'Mål om första offert inom 24 timmar', 'Ingen angiven tidsgräns'],
]

const faqs = [
  {
    q: 'Är Updro ett alternativ till Partna?',
    a: 'Ja. Updro är byggt för svenska digitala byråer och företag som vill jämföra offerter inom webb, SEO, e-handel, appar, design och marknadsföring.',
  },
  {
    q: 'Varför får beställaren högst tre offerter?',
    a: 'Tre offerter ger ett tydligt beslutsunderlag utan massutskick. Byråerna möter färre konkurrenter och beställaren slipper sortera bland många likartade svar.',
  },
  {
    q: 'Vad kostar Updro för en byrå?',
    a: 'En byrå kan köpa enstaka leads för 119 kr eller välja månadskortet för 1 995 kr med obegränsad tillgång enligt aktuella villkor.',
  },
  {
    q: 'Kostar Updro något för beställaren?',
    a: 'Nej. Det är gratis för beställaren att beskriva projektet, ta emot offerter och jämföra alternativen.',
  },
]

const PartnaAlternativPage = () => {
  useEffect(() => {
    const canonical = 'https://updro.se/partna-alternativ'
    setSEOMeta({
      title: 'Partna alternativ för digitala byråer – jämför pris | Updro',
      description: 'Jämför Updro och Partna för digitala byråleads. Se leadpris, månadskort, konkurrens per uppdrag och funktioner för offertjämförelse.',
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">För digitala byråer</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl [text-wrap:balance]">
              Betala 119 kr per lead i stället för 490 kr
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Updro är ett alternativ för byråer som vill ha lägre leadkostnad, högst tre konkurrenter per uppdrag och ett obegränsat månadskort.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/registrera/byra">
                <Button size="lg" className="rounded-xl px-7">Registrera byrån <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
              <Link to="/priser">
                <Button size="lg" variant="outline" className="rounded-xl px-7">Se Updros priser</Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ['119 kr', 'per enskilt lead'],
              ['1 995 kr', 'obegränsat per månad'],
              ['Max 3', 'byråer per uppdrag'],
              ['24h', 'mål för första offert'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border bg-card p-5">
                <p className="font-display text-2xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-3xl">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Updro jämfört med Partna</h2>
              <p className="mt-4 text-muted-foreground">Jämförelsen utgår från prisuppgifterna i den aktuella produktplanen. Kontrollera alltid respektive tjänsts senaste villkor före köp.</p>
            </div>
            <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr><th className="p-4">Område</th><th className="p-4">Updro</th><th className="p-4">Partna</th></tr>
                </thead>
                <tbody>
                  {comparisonRows.map(row => (
                    <tr key={row[0]} className="border-t align-top">
                      <td className="p-4 font-medium">{row[0]}</td>
                      <td className="p-4 font-semibold text-primary">{row[1]}</td>
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
            <article className="rounded-2xl border bg-card p-6">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-bold">Räkneexempel: 20 leads</h2>
              <p className="mt-3 text-muted-foreground">20 leads à 490 kr blir 9 800 kr. Updros månadskort kostar 1 995 kr. Skillnaden blir 7 805 kr under samma månad.</p>
            </article>
            <article className="rounded-2xl border bg-card p-6">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-bold">Tre offerter är en produktfördel</h2>
              <p className="mt-3 text-muted-foreground">Beställaren får ett hanterbart urval. Byrån möter högst två konkurrenter och kan lägga mer tid på relevanta, genomarbetade svar.</p>
            </article>
          </div>
        </section>

        <section className="container pb-16">
          <div className="max-w-3xl">
            <h2 className="mb-6 font-display text-3xl font-bold">Vanliga frågor</h2>
            <div className="space-y-3">
              {faqs.map(item => (
                <details key={item.q} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer font-semibold">{item.q}</summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-20">
          <div className="rounded-3xl bg-foreground p-8 text-background md:p-12">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Redo att prova ett billigare leadflöde?</h2>
            <p className="mt-3 max-w-2xl text-background/75">Skapa en byråprofil och välj själv vilka digitala uppdrag som passar er kompetens.</p>
            <Link to="/registrera/byra" className="mt-7 inline-block">
              <Button size="lg" variant="secondary" className="rounded-xl px-7">Registrera byrån <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PartnaAlternativPage
