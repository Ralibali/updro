import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, FileSearch, LockKeyhole, UsersRound, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PriceCalculatorSection from '@/components/home/PriceCalculatorSection'
import { useEffect } from 'react'
import { setSEOMeta } from '@/lib/seoHelpers'
import { trackClick } from '@/hooks/usePageTracking'

const LandingPage = () => {
  const [params] = useSearchParams()
  const rawCategory = params.get('kategori')?.trim() || 'digitala tjänster'
  const category = rawCategory.slice(0, 80)
  const campaign = params.get('utm_campaign')?.slice(0, 100) || 'buyer_landing'
  const briefSeed = `Jag behöver hjälp med ${category}. `
  const publishUrl = `/publicera?beskrivning=${encodeURIComponent(briefSeed)}`

  useEffect(() => {
    setSEOMeta({
      title: `Jämför offerter för ${category} | Updro`,
      description: `Beskriv ditt behov inom ${category} och få upp till tre relevanta offerter. Briefen granskas och tjänsten är gratis för beställare.`,
      noindex: true,
    })
  }, [category])

  const trackStart = (placement: string) => {
    trackClick('landing_lead_started', 'Beskriv ditt projekt', {
      placement,
      campaign,
      category,
    })
  }

  // Förvälj rätt projekttyp i priskalkylatorn utifrån kampanjens kategori.
  const categoryLower = category.toLowerCase()
  const defaultTypeId =
    categoryLower.includes('ai') || categoryLower.includes('ai-utveckling') ? 'ai'
    : categoryLower.includes('e-handel') ? 'ehandel'
    : categoryLower.includes('seo') ? 'seo'
    : categoryLower.includes('ads') || categoryLower.includes('annonsering') ? 'ads'
    : categoryLower.includes('app') ? 'app'
    : categoryLower.includes('design') || categoryLower.includes('varumärke') ? 'design'
    : 'hemsida'

  const benefits = [
    {
      icon: UsersRound,
      title: 'Högst tre byråer',
      description: 'Du får ett hanterbart antal alternativ och slipper att samma brief skickas till ett stort säljnätverk.',
    },
    {
      icon: FileSearch,
      title: 'Briefen granskas',
      description: 'Uppdraget kontrolleras innan det öppnas, så att byråerna får ett tydligare underlag att svara på.',
    },
    {
      icon: LockKeyhole,
      title: 'Kontakten är låst',
      description: 'Dina kontaktuppgifter visas bara för byråer som aktivt väljer att låsa upp just ditt uppdrag.',
    },
    {
      icon: WalletCards,
      title: 'Gratis och frivilligt',
      description: 'Det kostar inget att skicka in eller jämföra offerter och du måste inte välja någon byrå.',
    },
  ]

  const faqs = [
    ['Hur lång tid tar formuläret?', 'De flesta kan beskriva behov, budget och önskad start på ungefär två minuter. Du kan även använda AI-assistenten för att strukturera briefen.'],
    ['När kommer offerterna?', 'Svarstiden varierar beroende på kategori, budget och tillgängliga byråer. Du får ett meddelande när en offert har lämnats.'],
    ['Måste jag skapa konto?', 'Nej, inte för att skicka in uppdraget. Ett kostnadsfritt konto behövs när du vill följa offerter och dialog på ett ställe.'],
    ['Kan fler än tre byråer kontakta mig?', 'Nej. Högst tre byråer kan lämna offert på samma uppdrag och kontaktuppgifterna är låsta före aktiv upplåsning.'],
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b bg-background">
          <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="container relative py-16 md:py-24">
            <div className="max-w-4xl">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground"
              >
                Hitta rätt byrå – utan massutskick
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl"
              >
                Få upp till tre relevanta offerter för <span className="text-accent">{category}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
              >
                Beskriv projektet en gång. Updro granskar briefen innan matchande svenska byråer får möjlighet att svara. Högst tre relevanta byråer kan lämna offert – med fokus på webb, e-handel och AI, men alla våra kategorier finns med.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link to={publishUrl} onClick={() => trackStart('hero')}>
                  <Button size="lg" className="rounded-xl px-8 py-6 text-base">
                    Beskriv ditt projekt <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#sa-fungerar-det">
                  <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base">Se hur det fungerar</Button>
                </a>
              </motion.div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />Ingen registrering för att börja</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />Gratis för beställare</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />Ingen skyldighet att välja</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl border bg-card p-6"
              >
                <benefit.icon className="h-6 w-6 text-primary" />
                <h2 className="mt-4 font-display text-lg font-semibold">{benefit.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <PriceCalculatorSection defaultTypeId={defaultTypeId} />

        <section id="sa-fungerar-det" className="border-y bg-muted/30 py-16">
          <div className="container max-w-4xl">
            <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Tre steg till ett bättre beslutsunderlag</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                ['1', 'Beskriv behovet', 'Skriv vad ni vill uppnå, ungefärlig budget och när projektet ska starta.'],
                ['2', 'Updro granskar', 'Briefen kontrolleras innan den öppnas för byråer som arbetar inom rätt område.'],
                ['3', 'Jämför svaren', 'Högst tre offerter kan lämnas. Jämför pris, leverans, metod och kompetens.'],
              ].map(([number, title, description]) => (
                <div key={number} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-bold text-primary">{number}</div>
                  <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container max-w-3xl py-16">
          <h2 className="text-center font-display text-3xl font-bold">Vanliga frågor</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map(([question, answer]) => (
              <AccordionItem key={question} value={question}>
                <AccordionTrigger className="text-left">{question}</AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-10 text-center">
            <Link to={publishUrl} onClick={() => trackStart('bottom_cta')}>
              <Button size="lg" className="rounded-xl px-8 py-6 text-base">
                Starta gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
