import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

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
    q: 'Vad är skillnaden mellan Updro och Partna för en byrå?',
    a: `Updro tar cirka ${CALC.updroPerLead} kr per lead eller ${CALC.updroMonth.toLocaleString('sv-SE')} kr/mån för obegränsat antal leads och visar max tre byråer per uppdrag. Partna anger cirka ${CALC.partnaPerLead} kr per lead eller ${CALC.partnaMonth.toLocaleString('sv-SE')} kr/mån för ${CALC.partnaMonthLeads} leads och upp till sex byråer per förfrågan enligt publik information.`,
  },
  {
    q: 'Hur mycket kan jag spara genom att byta?',
    a: `Vid ${CALC.leads} leads per månad blir Partna cirka ${(CALC.leads * CALC.partnaPerLead).toLocaleString('sv-SE')} kr. Updro månadskort kostar ${CALC.updroMonth.toLocaleString('sv-SE')} kr, vilket ger en skillnad på cirka ${(CALC.leads * CALC.partnaPerLead - CALC.updroMonth).toLocaleString('sv-SE')} kr per månad.`,
  },
  {
    q: 'Är det bindningstid?',
    a: 'Nej. Månadskortet är löpande per månad. Aktuella villkor bör alltid kontrolleras direkt på respektive plattform.',
  },
  {
    q: 'Får jag färre eller fler leads på Updro?',
    a: 'Updro visar max tre byråer per uppdrag för att öka konverteringen per lead. Volymen beror på kategori, region och byråns profil.',
  },
  {
    q: 'Kan jag ha båda plattformarna parallellt?',
    a: 'Ja. Många byråer testar Updro parallellt en period för att jämföra pris per konverterad kund innan de flyttar sin volym.',
  },
]

const BytFranPartnaPage = () => {
  useEffect(() => {
    const canonical = 'https://updro.se/for-byraer/byt-fran-partna'
    setSEOMeta({
      title: 'Byt från Partna till Updro – räkna på skillnaden',
      description: 'Så mycket kan din byrå spara genom att gå från Partna till Updro. Räkneexempel, prisjämförelse och vanliga frågor för digitala byråer.',
      canonical,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'För byråer', url: 'https://updro.se/for-byraer' },
      { name: 'Byt från Partna', url: canonical },
    ])
    setJsonLd('byt-fran-partna-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }, [])

  const partnaCost = CALC.leads * CALC.partnaPerLead
  const diff = partnaCost - CALC.updroMonth

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">För byråer</p>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground [text-wrap:balance]">
              Byt från Partna till Updro
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Räkna på skillnaden per månad. Updro visar max tre byråer per uppdrag, vilket ökar konverteringsgraden per lead – och månadskortet ger obegränsad volym.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/for-byraer">
                <Button size="lg" className="rounded-xl px-7">
                  Bli byrå på Updro <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/partna-alternativ">
                <Button size="lg" variant="outline" className="rounded-xl px-7">
                  Se full jämförelse
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container pb-4">
          <div className="rounded-3xl border-2 border-foreground bg-secondary p-6 md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Räkneexempel</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight">
              {CALC.leads} leads i månaden
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Partna (per lead)</p>
                <p className="mt-3 font-display text-3xl font-bold">{partnaCost.toLocaleString('sv-SE')} kr</p>
                <p className="mt-2 text-sm text-muted-foreground">{CALC.leads} leads × {CALC.partnaPerLead} kr</p>
              </div>
              <div className="rounded-2xl border-2 border-accent bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">Updro månadskort</p>
                <p className="mt-3 font-display text-3xl font-bold">{CALC.updroMonth.toLocaleString('sv-SE')} kr</p>
                <p className="mt-2 text-sm text-muted-foreground">Obegränsat antal leads / månad</p>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" /> Skillnad
                </p>
                <p className="mt-3 font-display text-3xl font-bold text-accent">{diff.toLocaleString('sv-SE')} kr</p>
                <p className="mt-2 text-sm text-muted-foreground">lägre kostnad per månad</p>
              </div>
            </div>
            <ul className="mt-6 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <li>• Updro: {CALC.updroPerLead} kr/lead eller {CALC.updroMonth.toLocaleString('sv-SE')} kr/mån obegränsat</li>
              <li>• Partna: {CALC.partnaPerLead} kr/lead eller {CALC.partnaMonth.toLocaleString('sv-SE')} kr/mån för {CALC.partnaMonthLeads} leads</li>
              <li>• Updro visar max tre byråer per uppdrag</li>
              <li>• Partna anger upp till sex byråer per förfrågan</li>
            </ul>
            <p className="mt-6 rounded-xl border border-dashed border-muted-foreground/40 bg-background/60 p-4 text-xs text-muted-foreground">
              <strong>Notering:</strong> Priser och villkor är hämtade från publikt tillgänglig information om Partna och Updro och kan ändras. Kontrollera alltid aktuella priser och villkor direkt hos respektive plattform innan beslut.
            </p>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ['Bättre konverteringsgrad', 'Max tre byråer per uppdrag betyder att beställaren faktiskt läser varje offert – i stället för att sålla bland sex eller fler.'],
              ['Förutsägbar kostnad', 'Månadskortet ger fast kostnad oavsett volym, vilket gör budgeteringen enklare för byrån.'],
              ['Fokus på digitala uppdrag', 'Updro är dedikerat digitala byråer – webb, SEO, e-handel, appar, design och marknadsföring.'],
              ['Ingen bindningstid', 'Testa parallellt en månad, jämför pris per vunnen kund och flytta volymen när det passar.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{text}</p>
              </article>
            ))}
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
            <h2 className="font-display text-3xl md:text-4xl font-bold">Redo att byta?</h2>
            <p className="mt-3 max-w-2xl text-background/75">
              Skapa byråprofil på Updro och börja få handplockade leads. Månadskortet aktiveras när du vill.
            </p>
            <Link to="/for-byraer" className="mt-7 inline-block">
              <Button size="lg" variant="secondary" className="rounded-xl px-7">
                Bli byrå på Updro <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default BytFranPartnaPage
