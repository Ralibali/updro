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
import CTASection from '@/components/home/CTASection'
import { setSEOMeta } from '@/lib/seoHelpers'

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
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default Index
