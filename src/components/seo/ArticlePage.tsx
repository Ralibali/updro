import { useEffect } from 'react'
import { renderMarkdown } from '@/lib/renderMarkdown'
import { Link, useParams } from 'react-router-dom'
import { findArticle, ARTICLES } from '@/lib/seoArticles'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronRight, Calendar } from 'lucide-react'
import SEOLeadCTA from './SEOLeadCTA'
import NotFound from '@/pages/NotFound'

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const page = findArticle(slug || '')

  useEffect(() => {
    if (page) {
      import('@/lib/seoHelpers').then(({ setSEOMeta, getOgImage }) => {
        setSEOMeta({ title: page.metaTitle, description: page.metaDesc, canonical: `https://updro.se/artiklar/${page.slug}`, ogType: 'article', ogImage: getOgImage('artiklar') })
      })
    }
    window.scrollTo(0, 0)
  }, [page])

  if (!page) return <NotFound />

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.h1,
      description: page.metaDesc,
      datePublished: page.publishedDate,
      author: { '@type': 'Organization', name: 'Updro' },
      publisher: { '@type': 'Organization', name: 'Updro', url: 'https://updro.se' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://updro.se/' },
        { '@type': 'ListItem', position: 2, name: 'Artiklar', item: 'https://updro.se/artiklar/' },
        { '@type': 'ListItem', position: 3, name: page.h1, item: `https://updro.se/artiklar/${page.slug}/` },
      ]
    },
  ]

  if (page.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    } as any)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/artiklar" className="hover:text-foreground">Artiklar</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{page.h1}</span>
        </nav>
      </div>

      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{page.category}</span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(page.publishedDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{page.h1}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{page.intro}</p>
        </div>
      </section>

      <div className="container pb-12">
        <div className="max-w-3xl space-y-10">
          {page.sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display text-2xl font-bold mb-4">{section.heading}</h2>
              <div className="prose prose-lg text-muted-foreground max-w-none">
                {renderMarkdown(section.content)}
              </div>
            </section>
          ))}
        </div>
      </div>

      <SEOLeadCTA categoryName="digitala tjänster" />

      {page.faq.length > 0 && (
        <section className="container py-12">
          <h2 className="font-display text-2xl font-bold mb-6">Vanliga frågor</h2>
          <div className="max-w-3xl space-y-4">
            {page.faq.map((item, i) => (
              <details key={i} className="bg-card border rounded-xl p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="container py-12 border-t">
        <h2 className="font-display text-xl font-bold mb-4">Relaterade sidor</h2>
        <div className="flex flex-wrap gap-3">
          {page.relatedLinks.map(link => (
            <Link key={link.href} to={link.href}
              className="bg-muted rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* More articles */}
      <section className="container py-12 border-t">
        <h2 className="font-display text-xl font-bold mb-4">Fler artiklar</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARTICLES.filter(a => a.slug !== page.slug).slice(0, 6).map(a => (
            <Link key={a.slug} to={`/artiklar/${a.slug}`}
              className="bg-card border rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all group">
              <span className="text-xs text-primary font-semibold">{a.category}</span>
              <h3 className="font-display font-semibold mt-1 group-hover:text-primary transition-colors line-clamp-2">{a.h1}</h3>
              <span className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                Läs mer <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ArticlePage
