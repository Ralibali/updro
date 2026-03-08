import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES } from '@/lib/seoArticles'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, ChevronRight, Calendar } from 'lucide-react'
import SEOLeadCTA from './SEOLeadCTA'

const ArticlesIndex = () => {
  useEffect(() => {
    document.title = 'Artiklar & guider om digitala tjänster | Updro'
    const meta = document.querySelector('meta[name="description"]')
    const desc = 'Guider, prisöversikter och tips för webbutveckling, SEO, e-handel, apputveckling och digital marknadsföring.'
    if (meta) meta.setAttribute('content', desc)
    else {
      const m = document.createElement('meta')
      m.name = 'description'
      m.content = desc
      document.head.appendChild(m)
    }
    window.scrollTo(0, 0)
  }, [])

  const categories = [...new Set(ARTICLES.map(a => a.category))]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Artiklar</span>
        </nav>
      </div>

      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Artiklar & guider</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Kunskapsbank med prisguider, jämförelser och tips för att hjälpa dig fatta bättre beslut om digitala tjänster.
          </p>
        </div>
      </section>

      {categories.map(cat => (
        <section key={cat} className="container pb-12">
          <h2 className="font-display text-xl font-bold mb-4">{cat}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARTICLES.filter(a => a.category === cat).map(a => (
              <Link key={a.slug} to={`/artiklar/${a.slug}`}
                className="bg-card border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(a.publishedDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <h3 className="font-display font-semibold group-hover:text-primary transition-colors line-clamp-2">{a.h1}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.metaDesc}</p>
                <span className="text-xs text-primary mt-3 inline-flex items-center gap-1">
                  Läs mer <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <SEOLeadCTA categoryName="digitala tjänster" />
      <Footer />
    </div>
  )
}

export default ArticlesIndex
