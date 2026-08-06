import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileSearch, ShieldCheck, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setSEOMeta } from '@/lib/seoHelpers'
import { trackLeadStarted } from '@/lib/analytics'

const services = [
  { label: 'Ny hemsida', category: 'Webbutveckling', description: 'Företagshemsida, redesign eller ny webbplats.' },
  { label: 'Webbshop', category: 'E-handel', description: 'Shopify, WooCommerce eller annan e-handel.' },
  { label: 'SEO', category: 'SEO', description: 'Bättre synlighet och fler relevanta besökare.' },
  { label: 'Digital marknadsföring', category: 'Digital marknadsföring', description: 'Google Ads, Meta Ads och löpande marknadsföring.' },
]

const steps = [
  ['1', 'Beskriv behovet', 'Skriv några meningar om projektet, budgeten och när du vill komma igång.'],
  ['2', 'Vi granskar briefen', 'Updro kontrollerar uppdraget och matchar det med relevanta svenska byråer.'],
  ['3', 'Jämför upp till tre offerter', 'Du jämför pris, upplägg och kompetens utan köpkrav eller massutskick.'],
]

const faqs = [
  ['Kostar det något?', 'Nej. Updro är kostnadsfritt för dig som beställare och du förbinder dig inte till något.'],
  ['Hur många byråer kontaktar mig?', 'Högst tre relevanta byråer kan lämna offert på uppdraget.'],
  ['Måste jag skapa konto?', 'Nej. Du kan skicka in uppdraget direkt och skapa konto senare om du vill.'],
  ['Vad händer efter att jag skickat?', 'Vi granskar uppdraget innan det blir tillgängligt för matchande byråer.'],
]

const AdsLandingPage = () => {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    setSEOMeta({
      title: 'Få offerter från rätt webbyråer | Updro',
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
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold tracking-tight" aria-label="Updro – till startsidan">Updro</Link>
          <span className="text-xs sm:text-sm text-muted-foreground">Gratis för beställare</span>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b bg-secondary/40">
          <div className="container mx-auto px-4 py-14 sm:py-20 max-w-5xl">
            <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 border border-foreground/15 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wider mb-5">
                  <ShieldCheck className="h-4 w-4 text-accent" /> Kostnadsfritt och utan förpliktelser
                </span>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.02] tracking-tight mb-5">
                  Få offerter från rätt webbyråer
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mb-7 leading-relaxed">
                  Beskriv projektet på två minuter. Updro granskar behovet och låter högst tre relevanta svenska byråer lämna offert.
                </p>
                <Button asChild size="lg" className="rounded-xl px-7 py-6 text-base font-semibold">
                  <Link to={buildProjectUrl()} onClick={() => trackCta('google_ads_hero')}>
                    Beskriv ditt projekt gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {['Ingen registrering', 'Högst tre offerter', 'Inget köpkrav'].map(item => (
                    <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-accent" />{item}</span>
                  ))}
                </div>
              </div>

              <div className="border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Så fungerar matchningen</p>
                <div className="space-y-5">
                  <div className="flex gap-3"><FileSearch className="h-5 w-5 text-accent shrink-0 mt-0.5" /><div><p className="font-semibold">Briefen granskas</p><p className="text-sm text-muted-foreground">Vi minskar otydliga förfrågningar och felmatchningar.</p></div></div>
                  <div className="flex gap-3"><Users className="h-5 w-5 text-accent shrink-0 mt-0.5" /><div><p className="font-semibold">Max tre relevanta byråer</p><p className="text-sm text-muted-foreground">Du slipper massutskick och onödiga säljsamtal.</p></div></div>
                  <div className="flex gap-3"><ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" /><div><p className="font-semibold">Du bestämmer själv</p><p className="text-sm text-muted-foreground">Jämför i lugn och ro och välj bara om det känns rätt.</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 max-w-5xl">
          <div className="text-center mb-9">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Vad behöver du hjälp med?</h2>
            <p className="text-muted-foreground mt-2">Välj ett område så förbereder vi formuläret åt dig.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map(service => (
              <Link
                key={service.category}
                to={buildProjectUrl(service.category)}
                onClick={() => trackCta(`google_ads_${service.category.toLowerCase().replace(/\s+/g, '_')}`)}
                className="group border rounded-xl p-5 bg-card hover:border-primary transition-colors"
              >
                <h3 className="font-display font-bold mb-2 group-hover:text-primary">{service.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold">Starta <ArrowRight className="h-4 w-4" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-muted/40 border-y">
          <div className="container mx-auto px-4 py-14 max-w-5xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">Från behov till offert i tre steg</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {steps.map(([number, title, description]) => (
                <div key={number} className="bg-card rounded-xl border p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">{number}</span>
                  <h3 className="font-display font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-9">Vanliga frågor</h2>
          <div className="space-y-4">
            {faqs.map(([question, answer]) => (
              <div key={question} className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-1.5">{question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16 max-w-3xl">
          <div className="rounded-2xl border-2 border-foreground p-8 sm:p-10 text-center bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))]">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Beskriv projektet – resten hjälper vi dig med</h2>
            <p className="text-muted-foreground mb-6">Det tar ungefär två minuter och du behöver inte skapa konto.</p>
            <Button asChild size="lg" className="rounded-xl px-8 py-6 text-base font-semibold">
              <Link to={buildProjectUrl()} onClick={() => trackCta('google_ads_bottom')}>
                Få offerter gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

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
