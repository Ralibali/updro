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

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://updro.se/#organization',
  name: 'Updro',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '3',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Erik S.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Fick tre relevanta offerter inom ett dygn. Valde en byrå i Göteborg som levererade perfekt.',
      datePublished: '2025-11-10',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Sara L.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Som liten byrå får vi nu förfrågningar vi aldrig hade hittat själva.',
      datePublished: '2025-12-03',
    },
    {
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Marcus K.' },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: 'Sparade minst två veckor av research. Updro matchade oss med rätt partners direkt.',
      datePublished: '2026-01-15',
    },
  ],
}

const Index = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Updro – Jämför offerter från digitala byråer i Sverige | Gratis & utan förpliktelser',
      description: 'Beskriv ditt projekt och få upp till fem offerter från kvalitetssäkrade digitala byråer inom 24 timmar. Webbutveckling, SEO, e-handel, apputveckling och mer. Helt gratis.',
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
        <NewsletterSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />

      {/* HowTo JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howItWorksSchema) }}
      />
      {/* Review/Rating JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
    </div>
  )
}

export default Index
