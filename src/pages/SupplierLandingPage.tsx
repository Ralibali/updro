import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Gift, ShieldCheck, UsersRound, Zap, CreditCard, MessageCircle, FileSearch, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect } from 'react'
import { setSEOMeta } from '@/lib/seoHelpers'
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
    icon: ShieldCheck,
    title: 'Uppdrag granskas före publicering',
    description: 'Nya projekt ligger väntande tills Updro har kontrollerat att underlaget går att arbeta med.',
  },
  {
    icon: RotateCcw,
    title: 'Kreditprövning vid ogiltigt lead',
    description: 'Rapportera falsk förfrågan, felaktig kontakt eller uppenbart fel scope och begär krediten tillbaka efter granskning.',
  },
  {
    icon: MessageCircle,
    title: 'Offert och dialog på samma ställe',
    description: 'Skicka strukturerad offert, bifoga underlag och fortsätt dialogen i plattformen.',
  },
]

const steps = [
  { number: '1', title: 'Skapa byråkonto', description: 'Fyll i byrånamn, kontaktuppgifter och de kategorier ni arbetar inom.' },
  { number: '2', title: 'Välj relevanta uppdrag', description: 'Granska brief och matchpoäng innan ni använder en kredit för kontaktuppgifterna.' },
  { number: '3', title: 'Lämna en tydlig offert', description: 'Högst tre byråer kan svara på uppdraget. Följ sedan dialog och status i dashboarden.' },
]

const SupplierLandingPage = () => {
  const [params] = useSearchParams()
  const campaign = params.get('utm_campaign') || 'supplier_landing'

  useEffect(() => {
    setSEOMeta({
      title: 'Få digitala uppdrag med mindre konkurrens | Updro',
      description: `Registrera din byrå och få ${numWord(TRIAL_LEADS)} kostnadsfria lead-krediter. Se briefen före upplåsning, max tre byråer per uppdrag och ingen bindningstid.`,
      noindex: true,
    })
  }, [])

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
        <section className="relative overflow-hidden bg-background">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />

          <div className="container relative z-10 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                  <Zap className="h-3.5 w-3.5" />
                  {TRIAL_LEADS} kostnadsfria lead-krediter – inget kort krävs
                </span>
              </motion.div>

              <motion.h1
                className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Färre konkurrenter per uppdrag.{' '}
                <span className="text-brand-gradient">Mer kontroll över era leads.</span>
              </motion.h1>

              <motion.p
                className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                Updro visar brief, budget och tidsram innan ni låser upp kontakten. Högst tre byråer kan lämna offert på samma uppdrag och ni väljer själva vilka leads som är värda er tid.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Link to="/registrera/byra" onClick={() => trackSignup('supplier_hero')}>
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-10 py-6 text-base font-semibold shadow-blue transition-all active:scale-[0.98]">
                    Skapa byråkonto gratis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/priser">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base">Se priser och villkor</Button>
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

        <section className="border-y bg-card">
          <div className="container py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              {[
                [`${TRIAL_LEADS}`, 'gratis lead-krediter'],
                ['3', 'byråer per uppdrag som mest'],
                [`${STRIPE_PRODUCTS.lead.price} kr`, 'per valt lead'],
                [`${STRIPE_PRODUCTS.monthly.price.toLocaleString('sv-SE')} kr`, 'månadskort utan bindningstid'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container max-w-5xl">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-center mb-4">Byggt för bättre lead-ekonomi</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Updro är nylanserat och lovar inte en viss volym. I stället bygger vi produkten runt lägre konkurrens, transparent underlag och skydd mot uppenbart dåliga leads.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map(benefit => (
                <div key={benefit.title} className="rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow">
                  <div className="rounded-xl bg-primary/10 w-10 h-10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-card border-y">
          <div className="container max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">Från registrering till offert</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map(step => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary font-display font-bold text-xl flex items-center justify-center mb-4">{step.number}</div>
                  <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5 border-b">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">Börja utan risk och utvärdera med riktiga siffror</h2>
            <p className="text-muted-foreground mb-5 text-lg">
              Använd de kostnadsfria krediterna, följ svarsfrekvens och vunna affärer och välj sedan pay-per-lead eller månadskort utifrån den volym som faktiskt finns i er kategori.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> {TRIAL_LEADS} kostnadsfria krediter</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> {TRIAL_DAYS} dagars provperiod</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-accent" /> Ingen bindningstid</span>
            </div>
            <Link to="/registrera/byra" onClick={() => trackSignup('supplier_bottom_cta')}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-10 py-6 text-base font-semibold shadow-blue transition-all active:scale-[0.98]">
                Skapa byråkonto gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
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
