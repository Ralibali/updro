import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES, type ArticlePage } from '@/lib/seoArticles'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, ChevronRight, Calendar } from 'lucide-react'
import SEOLeadCTA from './SEOLeadCTA'
import { setSEOMeta, getOgImage } from '@/lib/seoHelpers'

const ArticlesIndex = () => {
  const [articles, setArticles] = useState<ArticlePage[]>(ARTICLES)

  useEffect(() => {
    setSEOMeta({
      title: 'Artiklar & guider om digitala tjänster | Updro',
      description: 'Guider, prisöversikter och tips för webbutveckling, SEO, e-handel, apputveckling och digital marknadsföring.',
      canonical: 'https://updro.se/artiklar',
      ogImage: getOgImage('artiklar'),
    })
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    supabase
      .from('articles')
      .select('slug, meta_title, meta_desc, h1, category, published_date, intro')
      .eq('status', 'published')
      .order('published_date', { ascending: false })
      .then(({ data }) => {
        if (cancelled || !data) return
        const dbArticles: ArticlePage[] = data.map((a: any) => ({
          slug: a.slug,
          metaTitle: a.meta_title,
          metaDesc: a.meta_desc,
          h1: a.h1,
          category: a.category,
          publishedDate: a.published_date,
          intro: a.intro || '',
          sections: [],
          faq: [],
          relatedLinks: [],
        }))
        const seen = new Set(dbArticles.map(a => a.slug))
        const merged = [...dbArticles, ...ARTICLES.filter(a => !seen.has(a.slug))]
        merged.sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))
        setArticles(merged)
      })
    return () => { cancelled = true }
  }, [])

  const categories = [...new Set(articles.map(a => a.category))]

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
            {articles.filter(a => a.category === cat).map(a => (
              <Link key={a.slug} to={`/artiklar/${a.slug}`}
                className="bg-card border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-shadow group">
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
