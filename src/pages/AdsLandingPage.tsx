import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calculator, FileSignature, FileSearch, ShieldCheck, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { setSEOMeta } from '@/lib/seoHelpers'
import { trackLeadStarted } from '@/lib/analytics'

/**
 * Dedikerad landningssida för betald trafik (Google Ads).
 * Medvetet avskalad: ingen full navigation, en enda primär CTA till
 * /publicera. Sidan är noindex – den ska inte konkurrera med de
 * organiska prisguiderna i sökresultaten.
 */

const steps = [
  {
    number: '1',
    title: 'Beskriv ditt projekt',
    description: 'Svara på några frågor om vad du behöver – det tar ungefär två minuter.',
  },
  {
    number: '2',
    title: 'Vi granskar och matchar',
    description: 'Vi kontrollerar din brief och högst tre byråer inom rätt kategori får lämna offert.',
  },
  {
    number: '3',
    title: 'Jämför och välj i lugn och ro',
    description: 'Du får pris och upplägg från byråerna och väljer bara om det känns rätt.',
  },
]

const reasons = [
  {
    icon: Users,
    title: 'Högst tre byråer – aldrig fem',
    description: 'Du slipper massutskick och spammiga säljsamtal. Varje offert får större utrymme.',
  },
  {
    icon: FileSearch,
    title: 'Varje uppdrag granskas',
    description: 'Vi kontrollerar alla briefar före publicering, så byråerna tar ditt projekt på allvar.',
  },
  {
    icon: Star,
    title: 'Verifierade omdömen',
    description: 'Byråernas betyg bygger på genomförda uppdrag – inte på vem som betalar mest.',
  },
  {
    icon: FileSignature,
    title: 'Digitala avtal i plattformen',
    description: 'När du valt en byrå kan ni bekräfta omfattning, pris och leverans direkt i Updro.',
  },
]

const faqs = [
  {
    question: 'Kostar det något att använda Updro?',
    answer: 'Nej, det är helt kostnadsfritt för dig som beställare. Byråerna betalar för att få lämna offerter.',
  },
  {
    question: 'Hur väljs byråerna ut?',
    answer: 'Ditt uppdrag granskas först av oss. Därefter kan högst tre byråer inom rätt kategori låsa upp din brief och lämna offert.',
  },
  {
    question: 'Måste jag välja en av byråerna?',
    answer: 'Nej. Offerterna är helt utan förpliktelser – du går vidare bara om du hittar en byrå som känns rätt.',
  },
  {
    question: 'Vad händer när jag har valt en byrå?',
    answer: 'Ni kan bekräfta samarbetet med ett digitalt avtal direkt i plattformen och fortsätta dialogen i chatten.',
  },
]

const AdsLandingPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Få upp till tre offerter från granskade webbyråer | Updro',
      description: 'Beskriv ditt projekt en gång – högst tre granskade byråer återkommer med pris och upplägg. Kostnadsfritt och utan förpliktelser.',
      canonical: 'https://updro.se/jamfor-offerter',
      noindex: true,
    })
  }, [])

  const trackCta = () => trackLeadStarted('ads_landing')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Avskalad header: logotypen är den enda vägen bort */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link to="/" className="font-display text-xl font-bold tracking-tight" aria-label="Updro – till startsidan">
            Updro
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden text-white" style={{ background: 'linear-gradient(160deg, hsl(245 62% 38%), hsl(245 58% 48%), hsl(260 50% 42%))' }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-white/5 blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="relative container mx-auto px-4 py-16 sm:py-20 max-w-3xl text-center">
            <span className="inline-block rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-6">
              Kostnadsfritt för beställare
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Få upp till tre offerter från granskade webbyråer
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Beskriv ditt projekt en gång. Högst tre byråer återkommer med pris och
              upplägg – du jämför och väljer i lugn och ro.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl px-8 py-6 text-base font-semibold">
              <Link to="/publicera" onClick={trackCta}>
                Beskriv ditt projekt – tar 2 minuter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-white/70">
              Kostnadsfritt · Inga förpliktelser · Högst tre offerter
            </p>
          </div>
        </section>

        {/* Tre steg */}
        <section className="container mx-auto px-4 py-14 max-w-4xl">
          <h2 className="font-display text-2xl font-bold text-center mb-10">Så fungerar det</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map(step => (
              <div key={step.number} className="bg-card rounded-xl border p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
                  {step.number}
                </span>
                <h3 className="font-display font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Varför Updro */}
        <section className="bg-muted/40 border-y">
          <div className="container mx-auto px-4 py-14 max-w-4xl">
            <h2 className="font-display text-2xl font-bold text-center mb-10">Därför väljer beställare Updro</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {reasons.map(reason => (
                <div key={reason.title} className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/15 p-2.5 shrink-0">
                    <reason.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{reason.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-card rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold">Osäker på vad det borde kosta?</h3>
                <p className="text-sm text-muted-foreground">
                  Våra prisguider visar vad hemsidor, webbshoppar och SEO faktiskt kostar 2026 – innan du pratar med en byrå.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-xl shrink-0">
                <Link to="/priser">Se prisguiderna</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Vanliga frågor */}
        <section className="container mx-auto px-4 py-14 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-center mb-10">Vanliga frågor</h2>
          <div className="space-y-4">
            {faqs.map(faq => (
              <div key={faq.question} className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-1.5">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Avslutande CTA */}
        <section className="container mx-auto px-4 pb-16 max-w-3xl">
          <div className="rounded-2xl border-2 border-foreground p-8 sm:p-10 text-center bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))]">
            <ShieldCheck className="h-8 w-8 mx-auto mb-4 text-accent" />
            <h2 className="font-display text-2xl font-bold mb-3">Redo att jämföra offerter?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Det tar två minuter att beskriva projektet. Högst tre byråer återkommer –
              du förbinder dig till ingenting.
            </p>
            <Button asChild size="lg" className="bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl px-8 py-6 text-base font-semibold">
              <Link to="/publicera" onClick={trackCta}>
                Kom igång – det är gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Updro</span>
          <div className="flex gap-4">
            <Link to="/integritetspolicy" className="hover:underline">Integritetspolicy</Link>
            <Link to="/villkor" className="hover:underline">Villkor</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AdsLandingPage
