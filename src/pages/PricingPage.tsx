import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { STRIPE_PRODUCTS, TRIAL_LEADS, TRIAL_DAYS } from '@/lib/constants'
import { Check, Gift, ArrowRight, RotateCcw, Eye, UsersRound } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { setSEOMeta } from '@/lib/seoHelpers'

const supplierPlans = [
  {
    id: 'lead',
    name: 'Pay per lead',
    price: STRIPE_PRODUCTS.lead.price,
    per: 'per upplåst lead',
    description: 'För byråer som vill välja enstaka uppdrag och bara betala när ett lead är relevant.',
    features: [
      'Se projektbrief, budget och tidsram före köp',
      'Lås bara upp leads ni själva väljer',
      'Skicka offert och kommunicera i plattformen',
      'Begär kreditprövning vid ogiltig kontakt',
      'Ingen bindningstid',
    ],
    cta: 'Starta med gratis krediter',
    highlighted: false,
  },
  {
    id: 'monthly',
    name: 'Månadskort',
    price: STRIPE_PRODUCTS.monthly.price,
    per: 'per månad',
    description: 'För byråer som vill kunna låsa upp alla relevanta uppdrag som finns i deras kategorier.',
    features: [
      'Obegränsade upplåsningar under aktiv månad',
      'Samma brief, offert och chattfunktioner',
      'Hantera och avsluta abonnemanget via Stripe',
      'Högst tre byråer kan lämna offert per uppdrag',
      'Ingen uppsägningstid',
    ],
    cta: 'Skapa konto först',
    highlighted: true,
  },
]

const PricingPage = () => {
  const [tab, setTab] = useState<'supplier' | 'buyer'>('supplier')

  useEffect(() => {
    setSEOMeta({
      title: 'Priser – Updro | Pay per lead eller månadskort',
      description: `Updro kostar ${STRIPE_PRODUCTS.lead.price} kr per valt lead eller ${STRIPE_PRODUCTS.monthly.price.toLocaleString('sv-SE')} kr/mån för obegränsade upplåsningar. ${TRIAL_LEADS} kostnadsfria lead-krediter vid start.`,
      canonical: 'https://updro.se/priser',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-16 text-center">
          <div className="container">
            <span className="inline-block bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-4">Tydligt från början</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Transparent prissättning</h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Välj bara uppdrag som passar. Inga dolda avgifter och ingen bindningstid.</p>

            <div className="flex justify-center mt-8">
              <div className="inline-flex bg-muted rounded-xl p-1">
                <button onClick={() => setTab('supplier')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'supplier' ? 'bg-card shadow-sm' : ''}`}>För byråer</button>
                <button onClick={() => setTab('buyer')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'buyer' ? 'bg-card shadow-sm' : ''}`}>För beställare</button>
              </div>
            </div>
          </div>
        </section>

        {tab === 'supplier' ? (
          <>
            <section className="container mb-12">
              <div className="bg-mint-gradient rounded-2xl p-6 md:p-8 text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-accent" />
                  <span className="font-display font-bold text-lg">Testa innan ni betalar</span>
                </div>
                <p className="text-muted-foreground mb-4">Nya byråer får {TRIAL_LEADS} kostnadsfria lead-krediter under {TRIAL_DAYS} dagar. Inget kreditkort krävs.</p>
                <Link to="/registrera/byra">
                  <Button className="bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-full px-6">Skapa byråkonto <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            </section>

            <section className="container mb-16">
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {supplierPlans.map(plan => (
                  <article key={plan.id} className={`bg-card rounded-2xl border p-7 relative flex flex-col ${plan.highlighted ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                    {plan.highlighted && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-3 py-1">För högre volym</span>}
                    <h2 className="font-display font-bold text-xl">{plan.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground min-h-[42px]">{plan.description}</p>
                    <div className="mt-5 mb-5">
                      <span className="text-4xl font-bold">{plan.price.toLocaleString('sv-SE')}</span>
                      <span className="text-muted-foreground ml-1">kr {plan.per}</span>
                    </div>
                    {plan.id === 'monthly' && <p className="text-sm text-muted-foreground mb-4 -mt-2">Cirka {Math.round(plan.price / 30)} kr per dag. Tillgänglig leadvolym varierar mellan kategorier.</p>}
                    <ul className="space-y-2.5 mb-7 flex-1">
                      {plan.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" /><span>{feature}</span></li>
                      ))}
                    </ul>
                    <Link to="/registrera/byra" className="mt-auto">
                      <Button className="w-full rounded-xl" variant={plan.highlighted ? 'default' : 'outline'}>{plan.cta}</Button>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <section className="container mb-16">
              <div className="max-w-4xl mx-auto rounded-2xl border bg-muted/30 p-6 md:p-8">
                <h2 className="font-display text-2xl font-bold text-center mb-8">Det som gäller oavsett betalningsmodell</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center"><Eye className="h-6 w-6 mx-auto text-primary" /><h3 className="font-semibold mt-3">Brief före upplåsning</h3><p className="text-sm text-muted-foreground mt-1">Bedöm relevansen innan en kredit används.</p></div>
                  <div className="text-center"><UsersRound className="h-6 w-6 mx-auto text-primary" /><h3 className="font-semibold mt-3">Max tre byråer</h3><p className="text-sm text-muted-foreground mt-1">Begränsad konkurrens på varje uppdrag.</p></div>
                  <div className="text-center"><RotateCcw className="h-6 w-6 mx-auto text-primary" /><h3 className="font-semibold mt-3">Kreditprövning</h3><p className="text-sm text-muted-foreground mt-1">Rapportera ogiltig kontakt, falskt lead eller tydligt fel scope.</p></div>
                </div>
              </div>
            </section>

            <section className="container mb-16 max-w-2xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-center mb-8">Vanliga frågor</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {[
                  ['Vad innebär månadskortet?', `Månadskortet kostar ${STRIPE_PRODUCTS.monthly.price.toLocaleString('sv-SE')} kr/mån och ger obegränsade lead-upplåsningar medan abonnemanget är aktivt. Antalet tillgängliga uppdrag varierar över tid och mellan kategorier.`],
                  ['Hur fungerar pay per lead?', `Ni betalar ${STRIPE_PRODUCTS.lead.price} kr för varje lead ni själva väljer att låsa upp. Brief, kategori, budget och tidsram visas innan beslutet.`],
                  ['Vad händer om kontaktuppgifterna är fel?', 'Ni kan skicka in en begäran om kreditprövning vid ogiltig kontakt, falsk förfrågan, dubblett eller tydligt felaktigt scope. Updro granskar ärendet innan krediten återförs.'],
                  ['Hur fungerar de kostnadsfria krediterna?', `Ett nytt byråkonto får ${TRIAL_LEADS} lead-krediter som kan användas under den ${TRIAL_DAYS} dagar långa provperioden.`],
                  ['Kan abonnemanget avslutas?', 'Ja. Månadskortet kan hanteras och avslutas via Stripe Billing Portal och har ingen uppsägningstid.'],
                  ['Vilka betalningsmetoder accepteras?', 'Kortbetalningar hanteras säkert genom Stripe.'],
                ].map(([question, answer]) => (
                  <AccordionItem key={question} value={question} className="bg-card rounded-xl border px-4">
                    <AccordionTrigger className="text-sm font-medium">{question}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </>
        ) : (
          <section className="container mb-16 text-center">
            <div className="max-w-lg mx-auto bg-card rounded-2xl border p-8">
              <h2 className="font-display text-3xl font-bold mb-2">Gratis för beställare</h2>
              <p className="text-muted-foreground mb-6">Det kostar inget att beskriva ett projekt, ta emot offerter eller välja att avstå.</p>
              <ul className="space-y-3 text-left max-w-sm mx-auto mb-6">
                {['Ingen registrering krävs för att börja', 'Briefen granskas före publicering', 'Högst tre byråer kan lämna offert', 'Jämför pris, upplägg och kompetens utan förpliktelse'].map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-accent" /> {feature}</li>
                ))}
              </ul>
              <Link to="/publicera">
                <Button className="bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-full px-6">Beskriv ditt projekt <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default PricingPage
