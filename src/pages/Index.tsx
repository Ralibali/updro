import { lazy, Suspense, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const AgencyTrustSection = lazy(() => import('@/components/home/AgencyTrustSection'))
const TwoSidedSection = lazy(() => import('@/components/home/TwoSidedSection'))
const StatsSection = lazy(() => import('@/components/home/StatsSection'))
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'))
const FAQSection = lazy(() => import('@/components/home/FAQSection'))
const CTASection = lazy(() => import('@/components/home/CTASection'))
const NewsletterSection = lazy(() => import('@/components/home/NewsletterSection'))

const howItWorksSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Så hittar du rätt digital byrå med Updro',
  description: 'Beskriv uppdraget, bli matchad med relevanta byråer och jämför upp till fem offerter.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Beskriv vad du behöver',
      text: 'Beskriv behov, budget och önskad tidsplan med egna ord.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Bli matchad med relevanta byråer',
      text: 'Updro matchar uppdraget med upp till fem granskade byråer.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Jämför och välj',
      text: 'Jämför upplägg, pris och erfarenhet och välj själv om du vill gå vidare.',
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
  description:
    'Svensk marknadsplats där företag beskriver digitala uppdrag och jämför offerter från relevanta byråer.',
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
    <AgencyTrustSection />
    <TwoSidedSection />
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
      title: 'Updro – Hitta och jämför digitala byråer',
      description:
        'Beskriv ditt digitala uppdrag och jämför upp till fem relevanta offerter från granskade svenska byråer. Kostnadsfritt och utan bindning.',
      canonical: 'https://updro.se/',
    })
    setJsonLd('howto-jsonld', howItWorksSchema)
    setJsonLd('organization-jsonld', organizationSchema)
    setJsonLd('website-jsonld', websiteSchema)
    setBreadcrumb([{ name: 'Hem', url: 'https://updro.se/' }])
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        <section className="container py-12 md:py-16">
          <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid-cols-[1.2fr_1fr]">
            <div className="p-7 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vad är Updro?</p>
              <h2 className="mt-3 font-display text-2xl text-foreground md:text-4xl">
                Ett enklare sätt att köpa digital kompetens
              </h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
                Updro samlar uppdrag och byråer på en plats. Du beskriver behovet en gång, får svar från ett begränsat antal relevanta byråer och kan jämföra alternativen utan kostnad eller krav att gå vidare.
              </p>
            </div>
            <div className="grid grid-cols-1 border-t border-border bg-surface-alt p-7 sm:grid-cols-3 md:grid-cols-1 md:border-l md:border-t-0 md:p-8">
              {[
                ['En förfrågan', 'Beskriv behovet en gång i stället för att kontakta flera byråer.'],
                ['Högst fem svar', 'Färre offerter gör jämförelsen mer relevant och överskådlig.'],
                ['Du bestämmer', 'Välj själv vem du vill prata vidare med – eller avstå helt.'],
              ].map(([title, description]) => (
                <div key={title} className="border-border py-4 first:pt-0 last:pb-0 sm:border-l sm:px-4 sm:first:border-l-0 md:border-l-0 md:border-t md:px-0 md:first:border-t-0">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <CategoriesSection />
        <BelowFold />
      </main>
      <Footer />
    </div>
  )
}

export default Index
