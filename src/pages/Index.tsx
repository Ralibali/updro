import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import SearchBar from '@/components/home/SearchBar'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import USPSection from '@/components/home/USPSection'
import LatestProjectsSection from '@/components/home/LatestProjectsSection'
import StatsSection from '@/components/home/StatsSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTASection from '@/components/home/CTASection'
import FAQSection from '@/components/home/FAQSection'
import { setSEOMeta } from '@/lib/seoHelpers'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://updro.se/#website',
      url: 'https://updro.se',
      name: 'Updro',
      description: 'Sveriges marketplace för digitala uppdrag – jämför offerter från kvalitetssäkrade byråer gratis.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://updro.se/byraer?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://updro.se/#organization',
      name: 'Updro',
      legalName: 'Aurora Media AB',
      url: 'https://updro.se',
      logo: 'https://updro.se/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@updro.se',
        availableLanguage: 'Swedish',
      },
      areaServed: { '@type': 'Country', name: 'SE' },
    },
  ],
}

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Updro – Jämför offerter från digitala byråer | Gratis',
      description: 'Jämför offerter från kvalitetssäkrade digitala byråer i Sverige. Webbutveckling, SEO, e-handel, apputveckling – helt gratis och utan förpliktelser.',
      canonical: 'https://updro.se/',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SearchBar />
        <CategoriesSection />
        <HowItWorksSection />
        <USPSection />
        <LatestProjectsSection />
        <StatsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />

      {/* Organization + WebSite JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </div>
  )
}

export default Index
