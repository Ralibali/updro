import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCityHubData, SERVICE_CATEGORIES, CITIES } from '@/lib/seoCities'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react'
import SEOLeadCTA from './SEOLeadCTA'
import NotFound from '@/pages/NotFound'

const CityHubPage = () => {
  const { city } = useParams<{ city: string }>()
  const page = getCityHubData(city || '')

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', page.metaDesc)
      else {
        const m = document.createElement('meta')
        m.name = 'description'
        m.content = page.metaDesc
        document.head.appendChild(m)
      }
    }
    window.scrollTo(0, 0)
  }, [page])

  if (!page) return <NotFound />

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://updro.se/' },
      { '@type': 'ListItem', position: 2, name: 'Städer', item: 'https://updro.se/stader/' },
      { '@type': 'ListItem', position: 3, name: page.name, item: `https://updro.se/stader/${page.slug}/` },
    ]
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/stader" className="hover:text-foreground">Städer</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{page.name}</span>
        </nav>
      </div>

      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-primary mb-3">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Stad</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">{page.h1}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{page.intro}</p>
          <div className="mt-6">
            <Link to="/publicera">
              <Button size="lg" className="rounded-xl shadow-blue">
                Jämför offerter i {page.name} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <h2 className="font-display text-2xl font-bold mb-6">Alla tjänster i {page.name}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {page.services.map(service => (
            <Link key={service.href} to={service.href}
              className="bg-card border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <h3 className="font-display font-semibold group-hover:text-primary transition-colors">{service.name}</h3>
              <span className="text-xs text-primary mt-2 inline-flex items-center gap-1">
                Jämför offerter <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <SEOLeadCTA categoryName={`digitala tjänster i ${page.name}`} />

      {/* Other cities */}
      <section className="container py-12 border-t">
        <h2 className="font-display text-xl font-bold mb-4">Andra städer</h2>
        <div className="flex flex-wrap gap-3">
          {CITIES.filter(c => c.slug !== page.slug).map(c => (
            <Link key={c.slug} to={`/stader/${c.slug}`}
              className="bg-muted rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default CityHubPage
