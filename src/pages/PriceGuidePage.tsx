import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowRight, Calculator, ChevronRight, AlertTriangle, Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'
import { PRICE_GUIDES, PRICE_MATRIX, findPriceGuide } from '@/lib/priceGuideData'
import { ARTICLES } from '@/lib/seoArticles'

const SITE = 'https://updro.se'

const PriceGuidePage = () => {
  const { slug = '' } = useParams()
  const guide = findPriceGuide(slug)
  const canonical = guide ? `${SITE}/priser/${guide.slug}` : `${SITE}/priser`

  useEffect(() => {
    if (!guide) return

    setSEOMeta({ title: guide.title, description: guide.metaDescription, canonical })
    setBreadcrumb([
      { name: 'Hem', url: `${SITE}/` },
      { name: 'Priser', url: `${SITE}/priser` },
      { name: guide.h1, url: canonical },
    ])
    setJsonLd('price-guide-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    })
    window.scrollTo(0, 0)
  }, [guide, canonical])

  if (!guide) return <Navigate to="/priser" replace />

  const matrix = PRICE_MATRIX[guide.matrixKey]
  const relatedArticles = guide.relatedArticleSlugs
    .map(articleSlug => ARTICLES.find(article => article.slug === articleSlug))
    .filter(Boolean) as typeof ARTICLES
  const otherGuides = PRICE_GUIDES.filter(otherGuide => otherGuide.slug !== guide.slug)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/priser" className="hover:text-foreground">Priser</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{guide.h1}</span>
        </nav>
      </div>

      <section className="container pt-8 pb-10 md:pt-14 md:pb-14">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            {guide.h1}
          </h1>
          <p className="mt-4 text-lg text-foreground/80 leading-relaxed">{guide.intro}</p>

          <div className="mt-8 rounded-2xl border-2 border-foreground bg-card p-6 md:p-8 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Snabbt svar
            </div>
            <p className="text-foreground text-lg leading-relaxed">
              En <span className="font-semibold">standard-{guide.serviceLabel}</span> kostar normalt{' '}
              <span className="font-mono text-2xl md:text-3xl font-bold text-accent whitespace-nowrap">
                {matrix.standard.range}
              </span>{' '}
              hos en svensk byrå.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{guide.quickAnswer}</p>
          </div>
        </div>
      </section>

      <section className="container pb-12">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
          Prisintervall – {guide.serviceLabel} 2026
        </h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary/70">
              <tr className="text-left">
                <th className="px-4 py-3 font-display font-semibold">Nivå</th>
                <th className="px-4 py-3 font-display font-semibold">Vad ingår</th>
                <th className="px-4 py-3 font-display font-semibold">Prisintervall</th>
                <th className="px-4 py-3 font-display font-semibold">Leveranstid</th>
              </tr>
            </thead>
            <tbody>
              {guide.levels.map(row => {
                const cell = matrix[row.level]
                return (
                  <tr key={row.level} className="border-t">
                    <td className="px-4 py-4 font-semibold text-foreground align-top">{row.label}</td>
                    <td className="px-4 py-4 text-foreground/80 align-top">{row.includes}</td>
                    <td className="px-4 py-4 font-mono text-foreground align-top whitespace-nowrap">{cell.range}</td>
                    <td className="px-4 py-4 text-foreground/80 align-top whitespace-nowrap">{cell.time}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Prisintervall baserat på offerter från granskade svenska byråer på Updro.
        </p>
      </section>

      <section className="container pb-12">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Vad påverkar priset?
          </h2>
          <ul className="space-y-3">
            {guide.drivers.map((driver, index) => (
              <li key={index} className="flex gap-3 text-foreground/85 leading-relaxed">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container pb-12">
        <div className="max-w-3xl rounded-2xl border bg-secondary/50 p-6 md:p-8">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Så genomskådar du en för billig offert
          </h2>
          <ul className="space-y-3">
            {guide.warnings.map((warning, index) => (
              <li key={index} className="flex gap-3 text-foreground/85 leading-relaxed">
                <span className="font-mono text-accent flex-shrink-0">→</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container pb-16">
        <div className="rounded-3xl border-2 border-foreground bg-foreground text-background p-8 md:p-12 shadow-[6px_6px_0_0_hsl(var(--accent))]">
          <h2 className="font-display text-2xl md:text-4xl font-bold">
            Få exakta priser för just ditt projekt
          </h2>
          <p className="mt-3 text-background/80 max-w-2xl">
            Beskriv projektet på tre minuter och få upp till tre relevanta offerter från svenska byråer. Gratis.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/publicera?kategori=${encodeURIComponent(guide.wizardCategoryQuery)}`}
              className="inline-flex items-center gap-2 h-12 px-6 bg-accent text-accent-foreground font-bold font-display uppercase tracking-wide hover:bg-[hsl(14_75%_50%)] transition-colors"
            >
              Publicera uppdrag
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/#kalkylator"
              className="inline-flex items-center gap-2 h-12 px-6 border-2 border-background text-background font-semibold hover:bg-background hover:text-foreground transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Öppna priskalkylatorn
            </Link>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
            Vanliga frågor
          </h2>
          <div className="space-y-4">
            {guide.faq.map((faq, index) => (
              <details key={index} className="group border rounded-xl bg-card p-5 open:shadow-sm">
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-display font-semibold text-foreground">
                  <span>{faq.q}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-foreground/80 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Andra prisguider</h2>
            <ul className="space-y-2">
              {otherGuides.map(otherGuide => (
                <li key={otherGuide.slug}>
                  <Link to={`/priser/${otherGuide.slug}`} className="text-foreground hover:text-accent inline-flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> {otherGuide.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">Läs vidare</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/byraer/kategori/${guide.categorySlug}`}
                  className="text-foreground hover:text-accent inline-flex items-center gap-1"
                >
                  <ArrowRight className="w-3 h-3" /> {guide.categoryLabel}
                </Link>
              </li>
              {relatedArticles.map(article => (
                <li key={article.slug}>
                  <Link
                    to={`/artiklar/${article.slug}`}
                    className="text-foreground hover:text-accent inline-flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" /> {article.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PriceGuidePage
