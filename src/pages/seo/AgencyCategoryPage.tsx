import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCategoryBySlug, SEO_CITIES } from '@/lib/seoAgencyData'
import { setSEOMeta } from '@/lib/seoHelpers'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NotFound from '@/pages/NotFound'
import SEOLeadCTA from '@/components/seo/SEOLeadCTA'
import { ChevronRight, MapPin, Star, ArrowRight, Clock3, FileText, TrendingUp } from 'lucide-react'
import { trackLeadStarted } from '@/lib/analytics'
import {
  findCategoryStats,
  formatResponseTime,
  isValidCategoryStats,
  shouldShowCategoryStats,
  type CategoryStats,
} from '@/lib/categoryMarketStats'

const AgencyCategoryPage = () => {
  const { kategori } = useParams<{ kategori: string }>()
  const category = getCategoryBySlug(kategori || '')
  const [agencies, setAgencies] = useState<any[]>([])
  const [marketStats, setMarketStats] = useState<CategoryStats | null>(null)

  useEffect(() => {
    if (category) {
      setSEOMeta({
        title: `Bästa ${category.name}-byråerna i Sverige | Updro`,
        description: `Jämför Sveriges bästa byråer inom ${category.name.toLowerCase()}. Få gratis offerter via Updro.`,
        canonical: `https://updro.se/byraer/kategori/${category.slug}`,
      })
    }
    window.scrollTo(0, 0)
  }, [category])

  useEffect(() => {
    if (!category) return
    supabase.functions
      .invoke('category-stats')
      .then(({ data }) => {
        if (isValidCategoryStats(data)) {
          setMarketStats(findCategoryStats(data.categories, category.name))
        }
      })
      .catch(() => {
        /* Funktionen är inte deployerad ännu – statistikraden hålls dold. */
      })
  }, [category])

  useEffect(() => {
    if (!category) return
    const fetch = async () => {
      let query = supabase
        .from('supplier_profiles')
        .select('*, profiles!supplier_profiles_id_fkey(full_name, company_name, city, avatar_url)')
        .order('avg_rating', { ascending: false })
        .limit(50)

      if (category.dbCategory) {
        query = query.contains('categories', [category.dbCategory])
      }

      const { data } = await query
      if (data) setAgencies(data)
    }
    fetch()
  }, [category])

  if (!category) return <NotFound />

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://updro.se/' },
      { '@type': 'ListItem', position: 2, name: 'Byråer', item: 'https://updro.se/byraer' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://updro.se/byraer/kategori/${category.slug}` },
    ]},
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <link rel="canonical" href={`https://updro.se/byraer/kategori/${category.slug}`} />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/byraer" className="hover:text-foreground">Byråer</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      <section className="container py-12">
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Hitta {category.name}-byrå i Sverige</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{category.description}</p>
        {shouldShowCategoryStats(marketStats) && marketStats && (
          <div className="mt-6 flex flex-wrap gap-2.5" aria-label="Marknadstal för kategorin">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium">
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              {marketStats.projects} publicerade uppdrag
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
              {marketStats.avg_offers_per_project} offerter per uppdrag i snitt
            </span>
            {formatResponseTime(marketStats.median_hours_to_first_offer) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium">
                <Clock3 className="h-4 w-4 text-accent" aria-hidden="true" />
                Första offerten {formatResponseTime(marketStats.median_hours_to_first_offer)}
              </span>
            )}
          </div>
        )}
      </section>

      {/* Top CTA */}
      <section className="container pb-8">
        <div className="rounded-3xl border-2 border-foreground bg-foreground text-background p-8 md:p-12 shadow-[6px_6px_0_0_hsl(var(--accent))]">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Låt {category.name}-byråerna komma till dig – beskriv ditt projekt så får du upp till 3 offerter gratis
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/publicera?kategori=${encodeURIComponent(category.name)}`}
              onClick={() => trackLeadStarted('seo_category')}
              className="inline-flex items-center gap-2 h-12 px-6 bg-accent text-accent-foreground font-bold font-display uppercase tracking-wide hover:bg-[hsl(14_75%_50%)] transition-colors"
            >
              Publicera uppdrag
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="container pb-16">
        <h2 className="font-display text-xl font-semibold mb-6">{agencies.length} {category.name.toLowerCase()}-byråer i Sverige</h2>
        {agencies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Inga byråer i denna kategori ännu. Publicera ditt uppdrag så hjälper vi dig.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agencies.map(a => (
              <Link key={a.id} to={`/byraer/${a.slug}`} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                <h3 className="font-display font-semibold">{a.profiles?.company_name || a.profiles?.full_name || 'Byrå'}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {a.profiles?.city && <><MapPin className="h-3 w-3" /> {a.profiles.city}</>}
                  {a.avg_rating > 0 && <><Star className="h-3 w-3 ml-2 text-amber-500" /> {a.avg_rating}</>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Top 5 cities for this category */}
      <section className="container pb-8">
        <h2 className="font-display text-lg font-semibold mb-4">{category.name} per stad</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_CITIES.slice(0, 10).map(c => (
            <Link key={c.slug} to={`/byraer/${c.slug}/${category.slug}`}
              className="text-sm px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
              {category.name} i {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container pb-16 pt-4">
        <div className="rounded-3xl border-2 border-foreground bg-foreground text-background p-8 md:p-12 shadow-[6px_6px_0_0_hsl(var(--accent))]">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Låt {category.name}-byråerna komma till dig – beskriv ditt projekt så får du upp till 3 offerter gratis
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/publicera?kategori=${encodeURIComponent(category.name)}`}
              onClick={() => trackLeadStarted('seo_category')}
              className="inline-flex items-center gap-2 h-12 px-6 bg-accent text-accent-foreground font-bold font-display uppercase tracking-wide hover:bg-[hsl(14_75%_50%)] transition-colors"
            >
              Publicera uppdrag
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      <SEOLeadCTA categoryName={category.name.toLowerCase()} />
      <Footer />
    </div>
  )
}

export default AgencyCategoryPage
