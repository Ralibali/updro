import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Calculator, FlaskConical } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'
import { STRIPE_PRODUCTS, TRIAL_LEADS, TRIAL_DAYS } from '@/lib/constants'

const partna = {
  payg: 490,
  monthly: 1950,
  monthlyIncluded: 10,
}

const faqs = [
  {
    q: 'Vad är den viktigaste skillnaden för en byrå?',
    a: 'Updro begränsar varje uppdrag till högst tre byråer och låter er se brief, budget och tidsram före upplåsning. Partna anger upp till sex offerter per förfrågan enligt sin publika information.',
  },
  {
    q: 'Är Updro alltid billigare?',
    a: 'Styckepriset är lägre, men verklig ekonomi avgörs av leadkvalitet, volym och vunna affärer. Jämför därför kostnad per bokat möte och kund, inte bara pris per lead.',
  },
  {
    q: 'Hur bör vi testa Updro?',
    a: `Använd de ${TRIAL_LEADS} kostnadsfria krediterna under ${TRIAL_DAYS} dagar. Mät svar, möten, offerter och vunna affärer innan ni väljer betalningsmodell.`,
  },
  {
    q: 'Kan vi använda båda tjänsterna parallellt?',
    a: 'Ja. Det är ett bra sätt att jämföra kanaler på samma mätetal utan att avbryta en befintlig leadkälla för tidigt.',
  },
]

const BytFranPartnaPage = () => {
  useEffect(() => {
    const canonical = 'https://updro.se/for-byraer/byt-fran-partna'
    setSEOMeta({
      title: 'Testa Updro som alternativ till Partna – för digitala byråer',
      description: 'Jämför pris, konkurrens per uppdrag och produktflöde. Börja med fem kostnadsfria lead-krediter och mät faktisk kostnad per vunnen affär.',
      canonical,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'För byråer', url: 'https://updro.se/for-byraer' },
      { name: 'Testa alternativ till Partna', url: canonical },
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

  const exampleLeads = 10
  const updroPayg = exampleLeads * STRIPE_PRODUCTS.lead.price
  const partnaPayg = exampleLeads * partna.payg

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">För digitala byråer</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Testa Updro parallellt – byt först när siffrorna säger det
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Updro är nylanserat och lovar inte samma volym som en etablerad aktör. Erbjudandet är i stället lägre konkurrens per uppdrag, transparent brief före upplåsning och lägre pris per valt lead. Börja kostnadsfritt och jämför faktisk kostnad per möte och kund.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/registrera/byra"><Button size="lg" className="rounded-xl px-7">Få {TRIAL_LEADS} gratis krediter <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/partna-alternativ"><Button size="lg" variant="outline" className="rounded-xl px-7">Se saklig jämförelse</Button></Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-3xl">
              <Calculator className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">Räkneexempel: tio leads med styckepris</h2>
              <p className="mt-3 text-muted-foreground">Exemplet jämför pay-per-lead och säger inget om kvalitet eller hur många affärer som vinns.</p>
            </div>
            <div className="mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Partna pay per lead</p>
                <p className="mt-3 font-display text-3xl font-bold">{partnaPayg.toLocaleString('sv-SE')} kr</p>
                <p className="mt-2 text-sm text-muted-foreground">{exampleLeads} × {partna.payg} kr enligt publik prisuppgift</p>
              </div>
              <div className="rounded-2xl border-2 border-accent bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">Updro pay per lead</p>
                <p className="mt-3 font-display text-3xl font-bold">{updroPayg.toLocaleString('sv-SE')} kr</p>
                <p className="mt-2 text-sm text-muted-foreground">{exampleLeads} × {STRIPE_PRODUCTS.lead.price} kr</p>
              </div>
              <div className="rounded-2xl border bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Prisskillnad</p>
                <p className="mt-3 font-display text-3xl font-bold text-accent">{(partnaPayg - updroPayg).toLocaleString('sv-SE')} kr</p>
                <p className="mt-2 text-sm text-muted-foreground">före hänsyn till kvalitet, volym och konvertering</p>
              </div>
            </div>
            <div className="mt-5 max-w-4xl rounded-xl border border-dashed bg-background/70 p-4 text-xs text-muted-foreground">
              Partna anger även {partna.monthly.toLocaleString('sv-SE')} kr/mån inklusive {partna.monthlyIncluded} förfrågningar. Updro tar {STRIPE_PRODUCTS.monthly.price.toLocaleString('sv-SE')} kr/mån för obegränsade upplåsningar under aktiv månad. Tillgänglig volym varierar och ska vägas in i beslutet.
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ['Högst tre byråer', 'Färre konkurrenter per uppdrag ger varje offert mer utrymme, men garanterar inte en affär.'],
              ['Brief före köp', 'Ni ser kategori, budget, tidsram och beskrivning innan en kredit används.'],
              ['Kreditprövning', 'Ogiltig kontakt, falskt lead, dubblett eller tydligt fel scope kan skickas till Updro för manuell granskning.'],
              ['Transparent start', `Börja med ${TRIAL_LEADS} krediter under ${TRIAL_DAYS} dagar utan att lämna kortuppgifter.`],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container pb-16">
          <div className="rounded-3xl border-2 border-foreground bg-secondary p-7 md:p-10">
            <FlaskConical className="h-7 w-7 text-accent" />
            <h2 className="mt-4 font-display text-3xl font-bold">Mät detta under testperioden</h2>
            <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              {['Antal relevanta leads i era kategorier', 'Andel leads som går att nå', 'Bokade möten per upplåsning', 'Lämnade offerter per upplåsning', 'Vunna kunder och ordervärde', 'Total kostnad per vunnen kund'].map(item => (
                <div key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{item}</span></div>
              ))}
            </div>
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
            <h2 className="font-display text-3xl font-bold md:text-4xl">Låt resultatet avgöra</h2>
            <p className="mt-3 max-w-2xl text-background/75">Registrera byrån, använd de kostnadsfria krediterna och följ samma mätetal som för era andra leadkanaler.</p>
            <Link to="/registrera/byra" className="mt-7 inline-block"><Button size="lg" variant="secondary" className="rounded-xl px-7">Skapa byråkonto <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default BytFranPartnaPage
