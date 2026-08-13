import { lazy, Suspense, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import TrustStripSection from '@/components/home/TrustStripSection'
import MobileStickyCTA from '@/components/home/MobileStickyCTA'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'
import { HOME_TITLE, HOME_DESCRIPTION, HOME_CANONICAL, HOME_FAQ } from '@/lib/homeSeo'

const ExampleOffersSection = lazy(() => import('@/components/home/ExampleOffersSection'))
const PriceCalculatorSection = lazy(() => import('@/components/home/PriceCalculatorSection'))
const AgencyTrustSection = lazy(() => import('@/components/home/AgencyTrustSection'))
const TwoSidedSection = lazy(() => import('@/components/home/TwoSidedSection'))
const ComparisonSection = lazy(() => import('@/components/home/ComparisonSection'))
const StatsSection = lazy(() => import('@/components/home/StatsSection'))
const FAQSection = lazy(() => import('@/components/home/FAQSection'))
const CTASection = lazy(() => import('@/components/home/CTASection'))

const howItWorksSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Hur man jämför offerter på Updro',
  description: 'Steg-för-steg: Beskriv ditt projekt, få upp till tre relevanta offerter och välj rätt byrå.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Beskriv ditt projekt',
      text: 'Fyll i ett kort formulär med behov, budget och önskad start. Ingen registrering krävs.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Briefen granskas och matchas',
      text: 'Updro granskar förfrågan innan relevanta byråer får möjlighet att svara.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Jämför och välj',
      text: 'Högst tre byråer kan lämna offert. Jämför pris, upplägg och kompetens och välj bara när det känns rätt.',
    },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://updro.se/#organization',
  name: 'Updro',
  url: 'https://updro.se',
  logo: 'https://updro.se/logo-updro.png',
  description: 'Svensk marknadsplats för digitala uppdrag med granskade projektbriefar och högst tre offerter per uppdrag.',
  founder: { '@type': 'Organization', name: 'Aurora Media AB' },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@auroramedia.se',
    contactType: 'customer service',
    availableLanguage: ['Swedish', 'English'],
  },
  areaServed: { '@type': 'Country', name: 'Sweden' },
  sameAs: [],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://updro.se/#website',
  url: 'https://updro.se',
  name: 'Updro',
  inLanguage: 'sv-SE',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://updro.se/byraer?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const BelowFold = () => (
  <Suspense fallback={null}>
    <ExampleOffersSection />
    <PriceCalculatorSection />
    <ComparisonSection />
    <AgencyTrustSection />
    <TwoSidedSection />
    <StatsSection />
    <FAQSection />
    <CTASection />
  </Suspense>
)

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      canonical: HOME_CANONICAL,
    })
    setJsonLd('howto-jsonld', howItWorksSchema)
    setJsonLd('organization-jsonld', organizationSchema)
    setJsonLd('website-jsonld', websiteSchema)
    setJsonLd('faq-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: HOME_FAQ.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    })
    setBreadcrumb([{ name: 'Hem', url: HOME_CANONICAL }])
  }, [])

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <TrustStripSection />
        <section className="container py-10 md:py-14">
          <div className="grid gap-6 border-y-2 border-foreground py-8 md:grid-cols-[0.85fr_1.15fr] md:items-start md:gap-12 md:py-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Varför Updro?</p>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-foreground md:text-4xl">
                Varför inte bara googla fram en byrå?
              </h2>
            </div>
            <div>
              <p className="text-base leading-relaxed text-foreground/85 md:text-lg">
                Det kan du. Men då behöver du själv hitta kandidater, förklara samma projekt flera gånger och försöka göra helt olika offerter jämförbara. Med Updro beskriver du behovet en gång, briefen granskas och högst tre relevanta byråer får möjlighet att lämna offert.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Resultatet är inte fler svar – utan ett tydligare beslutsunderlag med pris, tidsplan och omfattning samlat på ett ställe.
              </p>
            </div>
          </div>
        </section>
        <CategoriesSection />
        <HowItWorksSection />
        <BelowFold />
      </main>
      <Footer />
      <MobileStickyCTA />
    </div>
  )
}

export default Index
