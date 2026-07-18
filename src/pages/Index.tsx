import { lazy, Suspense, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const PriceCalculatorSection = lazy(() => import('@/components/home/PriceCalculatorSection'))
const AgencyTrustSection = lazy(() => import('@/components/home/AgencyTrustSection'))
const TwoSidedSection = lazy(() => import('@/components/home/TwoSidedSection'))
const ComparisonSection = lazy(() => import('@/components/home/ComparisonSection'))
const ExampleOffersSection = lazy(() => import('@/components/home/ExampleOffersSection'))
const StatsSection = lazy(() => import('@/components/home/StatsSection'))
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'))
const FAQSection = lazy(() => import('@/components/home/FAQSection'))
const CTASection = lazy(() => import('@/components/home/CTASection'))
const NewsletterSection = lazy(() => import('@/components/home/NewsletterSection'))

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
    <PriceCalculatorSection />
    <AgencyTrustSection />
    <TwoSidedSection />
    <ComparisonSection />
    <ExampleOffersSection />
    <StatsSection />
    <TestimonialsSection />
    <NewsletterSection />
    <FAQSection />
    <CTASection />
  </Suspense>
)

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Updro – Hitta rätt byrå utan massutskick',
      description: 'Se prisspannet innan du skickar. Beskriv projektet på två minuter – Updro granskar briefen och högst tre relevanta svenska byråer kan lämna offert. Gratis för beställare.',
      canonical: 'https://updro.se/',
    })
    setJsonLd('howto-jsonld', howItWorksSchema)
    setJsonLd('organization-jsonld', organizationSchema)
    setJsonLd('website-jsonld', websiteSchema)
    setBreadcrumb([{ name: 'Hem', url: 'https://updro.se/' }])
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <section className="container py-8 md:py-12">
          <div className="max-w-3xl bg-muted/40 border rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">Vad är Updro?</h2>
            <p className="mt-3 text-foreground/85 leading-relaxed">
              Updro är en svensk marknadsplats där företag beskriver ett digitalt behov utan att först skapa konto. Vi granskar briefen innan den öppnas för matchande byråer, och högst tre relevanta byråer kan lämna offert. Tjänsten är gratis för beställare och prioriterar webbutveckling, e-handel och AI – men täcker också SEO, appar, digital marknadsföring, UX/design, IT-support, affärsutveckling, video/foto, mjukvara och varumärke/PR.
            </p>
          </div>
        </section>
        <CategoriesSection />
        <HowItWorksSection />
        <BelowFold />
      </main>
      <Footer />
    </div>
  )
}

export default Index
