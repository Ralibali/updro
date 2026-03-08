import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PlaceholderPageProps {
  title: string
  description?: string
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold mb-4">{title}</h1>
          <p className="text-muted-foreground">{description || 'Denna sida är under konstruktion.'}</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default PlaceholderPage
