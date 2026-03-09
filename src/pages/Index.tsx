import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import SearchBar from '@/components/home/SearchBar'
import CategoriesSection from '@/components/home/CategoriesSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import USPSection from '@/components/home/USPSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTASection from '@/components/home/CTASection'
import FAQSection from '@/components/home/FAQSection'
import { setSEOMeta } from '@/lib/seoHelpers'

const aggregateRatingSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': 'https://updro.se/#product',
  name: 'Updro – Jämför offerter från digitala byråer',
  description: 'Sveriges ledande marknadsplats för att jämföra offerter från kvalitetssäkrade digitala byråer. Gratis för beställare.',
  brand: { '@type': 'Brand', name: 'Updro' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '127',
    reviewCount: '94',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'SEK',
    description: 'Gratis för beställare – jämför upp till 5 offerter',
    availability: 'https://schema.org/InStock',
  },
}

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
      title: 'Updro – Jämför offerter från digitala byråer i Sverige | 100% Gratis',
      description: 'Jämför offerter från kvalitetssäkrade digitala byråer i Sverige. Webbutveckling, SEO, e-handel, apputveckling – helt gratis och utan förpliktelser. Svar inom 24 timmar.',
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
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />

      {/* AggregateRating JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />
      {/* HowTo JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
      />
    </div>
  )
}

export default Index
