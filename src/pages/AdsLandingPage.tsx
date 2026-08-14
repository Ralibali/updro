import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, FileSearch, ShieldCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { setSEOMeta } from '@/lib/seoHelpers'
import { trackLeadStarted } from '@/lib/analytics'

const services = [
  { label: 'Ny hemsida', category: 'Webbutveckling', description: 'Företagssajt, redesign eller helt ny webbplats.' },
  { label: 'Webbshop', category: 'E-handel', description: 'Shopify, WooCommerce eller annan e-handel.' },
  { label: 'SEO', category: 'SEO', description: 'Bättre synlighet och fler relevanta besökare.' },
  { label: 'Marknadsföring', category: 'Digital marknadsföring', description: 'Google Ads, Meta Ads och löpande annonsering.' },
]

const steps: [string, string, string][] = [
  ['1', 'Beskriv behovet', 'Några meningar om projektet, budgetspannet och när du vill komma igång.'],
  ['2', 'Vi granskar uppdraget', 'Updro kontrollerar briefen och matchar den mot relevanta svenska byråer.'],
  ['3', 'Jämför upp till tre offerter', 'Du jämför pris, upplägg och kompetens – utan köpkrav eller massutskick.'],
]

const faqs: [string, string][] = [
  ['Kostar det något?', 'Nej. Updro är kostnadsfritt för dig som beställare och du förbinder dig inte till något.'],
  ['Hur många byråer kontaktar mig?', 'Högst tre relevanta byråer kan lämna offert på ditt uppdrag. Vi skickar inte ut din förfrågan brett.'],
  ['Måste jag skapa konto?', 'Nej. Du kan skicka in uppdraget direkt och skapa konto senare om du vill följa svaren.'],
  ['Vad händer efter att jag skickat?', 'Vi granskar uppdraget innan det blir tillgängligt för matchande byråer. Du får besked via e-post.'],
  ['Vad kostar ett projekt?', 'Det beror helt på omfattningen. Ett budgetspann i briefen gör offerterna betydligt mer jämförbara.'],
]

const AdsLandingPage = () => {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setSEOMeta({
      title: 'Jämför offerter från rätt webbyråer | Updro',
      description: 'Beskriv projektet på två minuter och jämför upp till tre relevanta offerter. Gratis och utan förpliktelser.',
      canonical: 'https://updro.se/jamfor-offerter',
      noindex: true,
    })
  }, [])

  const buildProjectUrl = (category?: string) => {
    const params = new URLSearchParams()
    if (category) params.set('kategori', category)
    const term = searchParams.get('utm_term')
    if (term) params.set('beskrivning', `Jag söker hjälp med ${term}.`)
    const query = params.toString()
    return query ? `/publicera?${query}` : '/publicera'
  }

  const trackCta = (source: string) => trackLeadStarted(source)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold tracking-tight" aria-label="Updro – till startsidan">Updro</Link>
          <span className="hidden sm:inline text-sm text-muted-foreground">Gratis för beställare</span>
          <Button asChild size="sm" className="sm:hidden rounded-lg font-semibold">
            <Link to={buildProjectUrl()} onClick={() => trackCta('google_ads_header')}>Kom igång</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-24 sm:pb-0">
        {/* Hero */}
        <section className="border-b bg-secondary/40">
          <div className="container mx-auto px-4 py-10 sm:py-16 max-w-5xl">
            <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-8 lg:gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 border border-foreground/15 bg-background px-3 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-4">
                  <ShieldCheck className="h-4 w-4 text-accent" /> Gratis och utan förpliktelser
                </span>
                <h1 className="font-display text-[2rem] leading-[1.06] sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                  Jämför offerter från rätt webbyråer
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mb-6 leading-relaxed">
                  Beskriv projektet på två minuter. Vi granskar uppdraget och låter högst tre relevanta svenska byråer lämna offert.
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto rounded-xl px-7 py-6 text-base font-semibold">
                  <Link to={buildProjectUrl()} onClick={() => trackCta('google_ads_hero')}>
                    Beskriv ditt projekt gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {['Ingen registrering', 'Högst tre offerter', 'Inget köpkrav'].map(item => (
                    <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" />{item}</span>
                  ))}
                </div>
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Tar ungefär två minuter
                </p>
              </div>

              <div className="border-2 border-foreground bg-card p-5 sm:p-6 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Så fungerar matchningen</p>
                <div className="space-y-4">
                  <div className="flex gap-3"><FileSearch className="h-5 w-5 text-accent shrink-0 mt-0.5" /><div><p className="font-semibold">Briefen granskas</p><p className="text-sm text-muted-foreground">Färre otydliga förfrågningar och felmatchningar.</p></div></div>
                  <div className="flex gap-3"><Users className="h-5 w-5 text-accent shrink-0 mt-0.5" /><div><p className="font-semibold">Max tre relevanta byråer</p><p className="text-sm text-muted-foreground">Du slipper massutskick och onödiga säljsamtal.</p></div></div>
                  <div className="flex gap-3"><ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" /><div><p className="font-semibold">Du bestämmer själv</p><p className="text-sm text-muted-foreground">Jämför i lugn och ro och gå bara vidare om det känns rätt.</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Val av område – primär konverteringspunkt */}
        <section className="container mx-auto px-4 py-10 sm:py-14 max-w-5xl">
          <div className="text-center mb-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Vad behöver du hjälp med?</h2>
            <p className="text-muted-foreground mt-2">Välj ett område så förbereder vi formuläret åt dig.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {services.map(service => (
              <Link
                key={service.category}
                to={buildProjectUrl(service.category)}
                onClick={() => trackCta(`google_ads_${service.category.toLowerCase().replace(/\s+/g, '_')}`)}
                className="group flex items-center sm:block gap-3 border rounded-xl p-4 sm:p-5 bg-card hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-display font-bold mb-1 sm:mb-2 group-hover:text-primary">{service.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  <span className="hidden sm:inline-flex items-center gap-1 mt-4 text-sm font-semibold">Starta <ArrowRight className="h-4 w-4" /></span>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground sm:hidden" />
              </Link>
            ))}
          </div>
        </section>

        {/* Steg */}
        <section className="bg-muted/40 border-y">
          <div className="container mx-auto px-4 py-10 sm:py-14 max-w-5xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-8">Från behov till offert i tre steg</h2>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {steps.map(([number, title, description]) => (
                <div key={number} className="bg-card rounded-xl border p-5 sm:p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">{number}</span>
                  <h3 className="font-display font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-6">Vanliga frågor</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map(([question, answer]) => (
              <AccordionItem key={question} value={question}>
                <AccordionTrigger className="text-left font-semibold">{question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Avslutande CTA */}
        <section className="container mx-auto px-4 pb-12 sm:pb-16 max-w-3xl">
          <div className="rounded-2xl border-2 border-foreground p-6 sm:p-10 text-center bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))]">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Beskriv projektet – resten hjälper vi dig med</h2>
            <p className="text-muted-foreground mb-6">Det tar ungefär två minuter och du behöver inte skapa konto.</p>
            <Button asChild size="lg" className="w-full sm:w-auto rounded-xl px-8 py-6 text-base font-semibold">
              <Link to={buildProjectUrl()} onClick={() => trackCta('google_ads_bottom')}>
                Jämför offerter gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky mobil-CTA */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button asChild size="lg" className="w-full rounded-xl py-6 text-base font-semibold">
          <Link to={buildProjectUrl()} onClick={() => trackCta('google_ads_sticky')}>
            Beskriv ditt projekt gratis <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Gratis · Inget köpkrav · Två minuter</p>
      </div>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Updro</span>
          <div className="flex gap-4"><Link to="/integritetspolicy" className="hover:underline">Integritetspolicy</Link><Link to="/villkor" className="hover:underline">Villkor</Link></div>
        </div>
      </footer>
    </div>
  )
}

export default AdsLandingPage
