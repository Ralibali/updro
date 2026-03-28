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
import { setSEOMeta } from '@/lib/seoHelpers'

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

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Updro – Jämför offerter från digitala byråer i Sverige | Gratis & utan förpliktelser',
      description: 'Beskriv ditt projekt och få upp till 5 offerter från kvalitetssäkrade digitala byråer inom 24 timmar. Webbutveckling, SEO, e-handel, apputveckling och mer. Helt gratis.',
      canonical: 'https://updro.se/',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <HowItWorksSection />
        <AgencyTrustSection />
        <TwoSidedSection />
        <StatsSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />

      {/* HowTo JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
      />
    </div>
  )
}

export default Index
