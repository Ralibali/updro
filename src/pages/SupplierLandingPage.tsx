import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CreditCard,
  FileSearch,
  Gift,
  HandCoins,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setBreadcrumb, setJsonLd, setSEOMeta } from '@/lib/seoHelpers'
import { STRIPE_PRODUCTS, TRIAL_LEADS, TRIAL_DAYS } from '@/lib/constants'
import { numWord } from '@/lib/numberWords'
import { trackClick } from '@/hooks/usePageTracking'

const benefits = [
  {
    icon: Gift,
    title: `${numWord(TRIAL_LEADS)} kostnadsfria lead-krediter`,
    description: `Testa plattformen under de första ${TRIAL_DAYS} dagarna utan kortuppgifter eller bindningstid.`,
  },
  {
    icon: UsersRound,
    title: 'Max tre byråer per uppdrag',
    description: 'Varje offert får större utrymme och beställaren slipper hantera ett stort massutskick.',
  },
  {
    icon: FileSearch,
    title: 'Se briefen innan ni låser upp',
    description: 'Kategori, budget, tidsram och projektbeskrivning visas först så att ni bara väljer relevanta leads.',
  },
  {
    icon: HandCoins,
    title: '0 % provisionsavgift på vunna projekt',
    description: 'Updro tar ingen procent av projektvärdet när kunden väljer er. Plattformskostnaden är frikopplad från er offert.',
  },
  {
    icon: ShieldCheck,
    title: 'Uppdrag granskas före publicering',
    description: 'Nya projekt ligger väntande tills Updro har kontrollerat att underlaget går att arbeta med.',
  },
  {
    icon: RotateCcw,
    title: 'Kreditprövning vid ogiltigt lead',
    description: 'Rapportera falsk förfrågan, felaktig kontakt eller uppenbart fel scope och begär krediten tillbaka efter granskning.',
  },
]

const steps = [
  { number: '1', title: 'Skapa byråkonto', description: 'Fyll i byrånamn, kontaktuppgifter och de kategorier ni arbetar inom.' },
  { number: '2', title: 'Välj relevanta uppdrag', description: 'Granska brief, budget och matchning innan ni använder en kredit för kontaktuppgifterna.' },
  { number: '3', title: 'Lämna en tydlig offert', description: 'Högst tre byråer kan svara på uppdraget. Följ sedan dialog och status i dashboarden.' },
]

const faqs = [
  {
    q: 'Tar Updro provision när vi vinner ett projekt?',
    a: 'Nej. Updro tar ingen procent av offert- eller projektvärdet när beställaren väljer er. Ni betalar enligt vald lead- eller abonnemangsmodell.',
  },
  {
    q: 'Vad kostar ett lead?',
    a: `Ett enskilt valt lead kostar ${STRIPE_PRODUCTS.lead.price} kr exklusive moms. Ni ser brief, kategori, budget och tidsram innan ni väljer att låsa upp kontakten.`,
  },
  {
    q: 'Hur många byråer konkurrerar om samma uppdrag?',
    a: 'Högst tre byråer kan lämna offert på samma uppdrag. Det begränsar konkurrensen och ger beställaren ett mer hanterbart beslutsunderlag.',
  },
  {
    q: 'Måste vi teckna abonnemang?',
    a: 'Nej. Ni kan använda pay-per-lead. För högre volym finns även månadskort med obegränsade upplåsningar under aktiv period.',
  },
  {
    q: 'Vad händer om ett lead är felaktigt?',
    a: 'Ni kan begära kreditprövning vid exempelvis ogiltig kontakt, falsk förfrågan, dubblett eller tydligt felaktigt scope. Updro granskar ärendet innan krediten eventuellt återförs.',
  },
]

const SupplierLandingPage = () => {
  const [params] = useSearchParams()
  const location = useLocation()
  const campaign = params.get('utm_campaign') || 'supplier_landing'
  const isOrganicPage = location.pathname.replace(/\/$/, '') === '/for-byraer'
  const canonical = isOrganicPage ? 'https://updro.se/for-byraer' : 'https://updro.se/landing/byra'

  useEffect(() => {
    setSEOMeta({
      title: isOrganicPage
        ? 'Få fler kunder som webbyrå – digitala leads utan provision | Updro'
        : 'Få digitala uppdrag med mindre konkurrens | Updro',
      description: isOrganicPage
        ? `Få digitala leads till din webbyrå eller digitalbyrå. ${TRIAL_LEADS} gratis lead-krediter, max tre byråer per uppdrag, brief före köp och 0 % provision på vunna projekt.`
        : `Registrera din byrå och få ${numWord(TRIAL_LEADS)} kostnadsfria lead-krediter. Se briefen före upplåsning, max tre byråer per uppdrag och ingen bindningstid.`,
      canonical,
      noindex: !isOrganicPage,
    })

    if (isOrganicPage) {
      setBreadcrumb([
        { name: 'Hem', url: 'https://updro.se/' },
        { name: 'För byråer', url: canonical },
      ])
      setJsonLd('supplier-faq-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      })
    }
  }, [canonical, isOrganicPage])

  const trackSignup = (placement: string) => {
    trackClick('supplier_signup_started', 'Skapa byråkonto', {
      source: placement,
      campaign,
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-background border-b-2 border-foreground">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />

          <div className="container relative z-10 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <span className="inline-flex items-center gap-2 border-2 border-foreground bg-secondary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-foreground">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  {TRIAL_LEADS} kostnadsfria lead-krediter · inget kort krävs
                </span>
              </motion.div>

              <motion.h1
                className="mt-6 font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.98] [text-wrap:balance]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Få fler relevanta uppdrag.{' '}
                <span className="text-accent">Behåll hela projektvärdet.</span>
              </motion.h1>

              <motion.p
                className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                Updro visar brief, budget och tidsram innan ni låser upp kontakten. Högst tre byråer kan lämna offert på samma uppdrag och Updro tar <strong className="text-foreground">0 % provision på projektet när ni vinner.</strong>
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link to="/registrera/byra" onClick={() => trackSignup('supplier_hero')}>
                  <Button size="lg" className="min-h-14 bg-accent hover:bg-accent/90 text-accent-foreground rounded-none border-2 border-foreground px-10 text-base font-bold shadow-[5px_5px_0_0_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none">
                    Starta med {TRIAL_LEADS} gratis leads
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/priser">
                  <Button size="lg" variant="outline" className="min-h-14 rounded-none border-2 border-foreground px-8 text-base font-bold">Se priser och villkor</Button>
                </Link>
              </motion.div>

              <motion.p
                className="mt-4 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                Ingen bindningstid · Inga kortuppgifter vid registrering · Välj bara leads som passar
              </motion.p>
            </div>
          </div>
        </section>

        <section className="border-b-2 border-foreground bg-card">
          <div className="container py-6 md:py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {[
                [`${TRIAL_LEADS}`, 'gratis lead-krediter'],
                ['3', 'byråer per uppdrag som mest'],
                [`${STRIPE_PRODUCTS.lead.price} kr`, 'per valt lead'],
                ['0 %', 'provision på vunnet projekt'],
              ].map(([value, label]) => (
                <div key={label} className="border border-foreground/15 bg-background p-4 text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bättre lead-ekonomi</p>
              <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight">Betala för tillgången – inte en procent av er egen leverans.</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Målet är enkelt: ni ska kunna bedöma relevansen innan ni spenderar en kredit, konkurrera mot ett begränsat antal byråer och behålla marginalen när ni faktiskt vinner affären.
              </p>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map(benefit => (
                <article key={benefit.title} className="border-2 border-foreground/20 bg-card p-6 hover:border-foreground transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center border border-foreground bg-secondary mb-4">
                    <benefit.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary border-y-2 border-foreground">
          <div className="container max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Så räknar ni</p>
                <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold">Mät kostnad per vunnen affär – inte bara pris per lead.</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Ett lead är bara värdefullt om det leder till rätt samtal. Börja med gratiskrediterna, följ hur många leads som blir möten och kunder och välj sedan den prismodell som passar er faktiska volym.
                </p>
                <Link to="/partna-alternativ" className="mt-5 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4 hover:text-accent">
                  Jämför Updro och Partna sakligt <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="border-2 border-foreground bg-background p-6 md:p-8 shadow-[7px_7px_0_0_hsl(var(--accent))]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-foreground/15 p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Pay per lead</p>
                    <p className="mt-2 font-display text-4xl font-bold">{STRIPE_PRODUCTS.lead.price} kr</p>
                    <p className="mt-2 text-sm text-muted-foreground">per kontakt ni själva väljer att låsa upp</p>
                  </div>
                  <div className="border border-foreground/15 p-5">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">När ni vinner</p>
                    <p className="mt-2 font-display text-4xl font-bold">0 %</p>
                    <p className="mt-2 text-sm text-muted-foreground">Updro tar ingen procent av ert projektvärde</p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-3 bg-muted/50 p-4 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p>Leadvolym och konvertering varierar mellan kategori, budget och tidpunkt. Updro garanterar inte ett visst antal affärer.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-b">
          <div className="container max-w-4xl">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-10">Från registrering till offert</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map(step => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto w-12 h-12 border-2 border-foreground bg-accent text-accent-foreground font-display font-bold text-xl flex items-center justify-center mb-4">{step.number}</div>
                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16 max-w-3xl">
          <h2 className="font-display text-3xl font-bold mb-6">Vanliga frågor från byråer</h2>
          <div className="space-y-3">
            {faqs.map(item => (
              <details key={item.q} className="border-2 border-foreground/15 bg-card p-5 open:border-foreground">
                <summary className="cursor-pointer font-display font-bold">{item.q}</summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="py-16 bg-foreground text-background border-t-2 border-foreground">
          <div className="container max-w-3xl text-center">
            <h2 className="font-display text-3xl md:text-5xl font-bold">Testa med riktiga leads innan ni bestämmer er.</h2>
            <p className="mt-4 text-background/70 text-lg">
              Börja med {TRIAL_LEADS} kostnadsfria krediter under {TRIAL_DAYS} dagar. Inget kreditkort krävs för att skapa kontot.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-background/70">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> {TRIAL_LEADS} kostnadsfria krediter</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> {TRIAL_DAYS} dagars provperiod</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> 0 % projektprovision</span>
            </div>
            <Link to="/registrera/byra" onClick={() => trackSignup('supplier_bottom_cta')}>
              <Button size="lg" className="mt-8 min-h-14 bg-accent hover:bg-accent/90 text-accent-foreground rounded-none border-2 border-background px-10 text-base font-bold">
                Skapa byråkonto gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-background/60 flex items-center justify-center gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Inget kreditkort krävs för att starta
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default SupplierLandingPage
