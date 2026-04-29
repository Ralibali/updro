import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import AgencyTrustSection from '@/components/home/AgencyTrustSection'
import TwoSidedSection from '@/components/home/TwoSidedSection'
import StatsSection from '@/components/home/StatsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import FAQSection from '@/components/home/FAQSection'
import CTASection from '@/components/home/CTASection'
import NewsletterSection from '@/components/home/NewsletterSection'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const howItWorksSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Hur man jämför offerter på Updro',
  description: 'Steg-för-steg: Beskriv ditt projekt, få offerter, välj rätt byrå.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Beskriv ditt projekt',
      text: 'Fyll i ett kort formulär med dina behov, budget och tidsram.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Få offerter',
      text: 'Kvalitetssäkrade byråer skickar offerter inom 24 timmar.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Jämför & välj',
      text: 'Jämför pris, kvalitet och omdömen – välj den byrå som passar bäst.',
    },
  ],
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': 'https://updro.se/#organization',
  name: 'Updro',
  legalName: 'Aurora Media AB',
  url: 'https://updro.se',
  logo: {
    '@type': 'ImageObject',
    url: 'https://updro.se/logo-updro.png',
    width: 512,
    height: 512,
  },
  image: 'https://updro.se/og-image.png',
  description:
    'Sveriges marknadsplats för digitala uppdrag. Beskriv ditt projekt gratis och få offerter från kvalitetssäkrade webbyråer, SEO-byråer, UX-byråer, e-handelsbyråer och digitala marknadsföringsbyråer.',
  slogan: 'Hitta rätt byrå för ditt digitala projekt',
  knowsAbout: [
    'Webbutveckling',
    'SEO',
    'UX/UI-design',
    'E-handel',
    'Google Ads',
    'Digital marknadsföring',
    'Apputveckling',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@auroramedia.se',
    contactType: 'customer service',
    availableLanguage: ['Swedish', 'English'],
  },
  areaServed: { '@type': 'Country', name: 'Sweden' },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://updro.se/#website',
  url: 'https://updro.se',
  name: 'Updro',
  inLanguage: 'sv-SE',
}

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Updro – Jämför offerter från webbyrå, SEO-byrå & UX-byrå i Sverige',
      description:
        'Beskriv ditt projekt gratis och få upp till 5 offerter från kvalitetssäkrade digitala byråer inom 24 h. Webbutveckling, SEO, UX/UI, e-handel, Google Ads & apputveckling i hela Sverige.',
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
        {/* AI-friendly answer-first paragraph (often quoted by LLMs) */}
        <section className="container py-10 md:py-12">
          <div className="max-w-3xl bg-muted/40 border rounded-2xl p-6 md:p-8">
            <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground">Vad är Updro?</h2>
            <p className="mt-3 text-foreground/85 leading-relaxed">
              Updro är en svensk marknadsplats där företag publicerar digitala uppdrag och får upp till fem offerter
              från kvalitetssäkrade byråer inom 24 timmar. Tjänsten är gratis för uppdragsgivare och täcker
              webbutveckling, SEO, e-handel, apputveckling och digital marknadsföring i hela Sverige.
            </p>
          </div>
        </section>
        <CategoriesSection />
        <HowItWorksSection />
        <AgencyTrustSection />
        <TwoSidedSection />
        <StatsSection />
        <TestimonialsSection />
        <NewsletterSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default Index
