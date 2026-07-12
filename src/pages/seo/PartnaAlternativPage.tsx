import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Info } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const comparisonRows = [
  ['Antal offerter', 'Högst tre byråer kan lämna offert på samma uppdrag.', 'Partna anger upp till sex offerter per förfrågan i sin publika information.'],
  ['Pay per lead', '119 kr per valt lead.', 'Partna anger 490 kr per uppdragsförfrågan.'],
  ['Månadskort', '1 995 kr/mån för obegränsade upplåsningar under aktiv månad.', 'Partna anger 1 950 kr/mån inklusive tio uppdragsförfrågningar.'],
  ['Provstart', 'Fem lead-krediter under sju dagar utan kortuppgifter.', 'Kontrollera aktuellt introduktionserbjudande direkt hos Partna.'],
  ['Beställare', 'Gratis, granskad brief och låsta kontaktuppgifter.', 'Gratis offertförfrågan med BankID-baserade och verifierade funktioner enligt Partna.'],
  ['Marknadsläge', 'Nylanserad tjänst där leadvolymen fortfarande byggs upp.', 'Etablerad aktör med större befintligt nätverk.'],
]

const faqs = [
  {
    q: 'Är Updro ett alternativ till Partna?',
    a: 'Ja. Updro fokuserar på digitala uppdrag och skiljer sig främst genom högst tre byråer per uppdrag, lägre styckepris och val mellan pay per lead och obegränsat månadskort.',
  },
  {
    q: 'Vad kostar Updro jämfört med Partna?',
    a: 'Updro tar 119 kr per valt lead eller 1 995 kr/mån. Partna anger 490 kr per uppdragsförfrågan eller 1 950 kr/mån inklusive tio förfrågningar. Priser och villkor kan ändras och bör kontrolleras hos respektive tjänst.',
  },
  {
    q: 'Betyder lägre leadpris att Updro alltid är billigare?',
    a: 'Nej. Den verkliga kostnaden beror på leadkvalitet, tillgänglig volym och hur många leads som blir kunder. Jämför kostnad per vunnen affär, inte bara pris per kontakt.',
  },
  {
    q: 'Hur många offerter får beställaren?',
    a: 'På Updro kan högst tre byråer lämna offert. Partna anger upp till sex offerter enligt sin publika information.',
  },
  {
    q: 'Kan en byrå använda båda tjänsterna?',
    a: 'Ja. Det kan vara klokt att testa flera kanaler parallellt och mäta svarsfrekvens, möten, vunna affärer och faktisk kundanskaffningskostnad.',
  },
]

const PartnaAlternativPage = () => {
  useEffect(() => {
    const canonical = 'https://updro.se/partna-alternativ'
    setSEOMeta({
      title: 'Alternativ till Partna – jämför Updro och Partna',
      description: 'Jämför Updro och Partna för digitala uppdrag: antal byråer per uppdrag, pay-per-lead, månadskort, verifiering och marknadsläge.',
      canonical,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'Alternativ till Partna', url: canonical },
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
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Updro eller Partna – vad passar bäst?
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Båda tjänsterna hjälper företag att hitta digitala leverantörer. Updro väljer en tydligare nisch: granskade digitala projektbriefar, högst tre byråer per uppdrag och transparent leadpris. Partna har samtidigt ett större och mer etablerat nätverk samt funktioner kring BankID och företagsverifiering.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/publicera"><Button size="lg" className="rounded-xl px-7">Beskriv ett projekt <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/registrera/byra"><Button size="lg" variant="outline" className="rounded-xl px-7">Testa Updro som byrå</Button></Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-3xl mb-8">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Saklig jämförelse</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Uppgifterna om Partna bygger på deras publika webbplats kontrollerad i juli 2026. Kontrollera alltid aktuella priser och villkor innan köp.</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr><th className="p-4 font-semibold">Område</th><th className="p-4 font-semibold">Updro</th><th className="p-4 font-semibold">Partna</th></tr>
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
              ['Välj Updro för lägre konkurrens per lead', 'Högst tre byråer kan lämna offert, vilket ger varje svar mer utrymme. Det garanterar dock inte att leadet blir kund.'],
              ['Välj efter faktisk ekonomi', 'Mät kostnad per möte och vunnen kund. Ett billigt lead utan affär är dyrare än ett dyrare lead som konverterar.'],
              ['Ta hänsyn till marknadsläget', 'Updro är nylanserat och volymen varierar. Partnas större nätverk kan ge en annan tillgänglighet i vissa kategorier.'],
              ['Jämför produktupplevelsen', 'Titta på briefkvalitet, verifiering, antal konkurrenter, dialog, offertflöde och hur dåliga leads hanteras.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex gap-3 rounded-2xl border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Updro ska inte vinna genom att påstå att Partna är dåligt. Skillnaden ska bevisas med färre konkurrenter, transparent pris, bättre briefar och senare med verkliga data om möten och vunna affärer.</p>
          </div>
        </section>

        <section className="container pb-16">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold mb-6">Vanliga frågor</h2>
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
            <h2 className="font-display text-3xl font-bold md:text-4xl">Bedöm Updro med riktiga uppdrag</h2>
            <p className="mt-3 max-w-2xl text-background/75">Beställare använder tjänsten gratis. Byråer kan börja med fem kostnadsfria lead-krediter och utvärdera faktisk kvalitet innan de betalar.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/publicera"><Button size="lg" variant="secondary" className="rounded-xl px-7">Beskriv ditt projekt</Button></Link>
              <Link to="/registrera/byra"><Button size="lg" variant="outline" className="rounded-xl border-background text-background hover:bg-background hover:text-foreground">Skapa byråkonto</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PartnaAlternativPage
