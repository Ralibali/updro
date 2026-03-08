import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/home/HeroSection'
import SearchBar from '@/components/home/SearchBar'
import CategoriesSection from '@/components/home/CategoriesSection'
import USPSection from '@/components/home/USPSection'
import LatestProjectsSection from '@/components/home/LatestProjectsSection'
import StatsSection from '@/components/home/StatsSection'
import CTASection from '@/components/home/CTASection'

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SearchBar />
        <CategoriesSection />
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
