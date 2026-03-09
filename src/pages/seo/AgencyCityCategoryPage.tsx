import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCityBySlug, getCategoryBySlug, getPriorityCombo, SEO_AGENCY_CATEGORIES, SEO_CITIES } from '@/lib/seoAgencyData'
import { setSEOMeta } from '@/lib/seoHelpers'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NotFound from '@/pages/NotFound'
import SEOLeadCTA from '@/components/seo/SEOLeadCTA'
import { ChevronRight, MapPin, Star } from 'lucide-react'

const AgencyCityCategoryPage = () => {
  const { stad, kategori } = useParams<{ stad: string; kategori: string }>()
  const city = getCityBySlug(stad || '')
  const category = getCategoryBySlug(kategori || '')
  const priority = city && category ? getPriorityCombo(city.slug, category.slug) : undefined
  const [agencies, setAgencies] = useState<any[]>([])

  useEffect(() => {
    if (city && category) {
      setSEOMeta({
        title: `${category.name} i ${city.name} | Updro`,
        description: `Hitta de bästa byråerna inom ${category.name.toLowerCase()} i ${city.name}. Jämför priser och få offerter direkt.`,
        canonical: `https://updro.se/byraer/${city.slug}/${category.slug}`,
      })
    }
    window.scrollTo(0, 0)
  }, [city, category])

  useEffect(() => {
    if (!city || !category) return
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
      if (data) {
        setAgencies(data.filter(a => {
          const c = (a.profiles?.city || '').toLowerCase()
          return c.includes(city.name.toLowerCase())
        }))
      }
    }
    fetch()
  }, [city, category])

  if (!city || !category) return <NotFound />

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://updro.se/' },
      { '@type': 'ListItem', position: 2, name: 'Byråer', item: 'https://updro.se/byraer' },
      { '@type': 'ListItem', position: 3, name: city.name, item: `https://updro.se/byraer/${city.slug}` },
      { '@type': 'ListItem', position: 4, name: category.name, item: `https://updro.se/byraer/${city.slug}/${category.slug}` },
    ]},
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <link rel="canonical" href={`https://updro.se/byraer/${city.slug}/${category.slug}`} />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/byraer" className="hover:text-foreground">Byråer</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/byraer/${city.slug}`} className="hover:text-foreground">{city.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>
      </div>

      <section className="container py-12">
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">{category.name} i {city.name} – Hitta rätt byrå</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{category.description}</p>
        {priority && (
          <div className="mt-6 bg-primary/5 border border-primary/10 rounded-xl p-5">
            <p className="text-sm leading-relaxed">{priority.extraContent}</p>
          </div>
        )}
      </section>

      <section className="container pb-16">
        <h2 className="font-display text-xl font-semibold mb-6">{agencies.length} byråer inom {category.name.toLowerCase()} i {city.name}</h2>
        {agencies.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Inga byråer hittades för denna kombination ännu.</p>
            <p className="text-sm text-muted-foreground mt-1">Publicera ditt uppdrag så matchar vi dig med rätt byrå.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agencies.map(a => (
              <Link key={a.id} to={`/byraer/${a.slug}`} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                <h3 className="font-display font-semibold">{a.profiles?.company_name || a.profiles?.full_name || 'Byrå'}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {a.profiles?.city || city.name}
                  {a.avg_rating > 0 && <><Star className="h-3 w-3 ml-2 text-amber-500" /> {a.avg_rating}</>}
                </div>
                {a.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {a.categories.slice(0, 3).map((c: string) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{c}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Other categories in this city */}
      <section className="container pb-8">
        <h2 className="font-display text-lg font-semibold mb-4">Andra kategorier i {city.name}</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_AGENCY_CATEGORIES.filter(c => c.slug !== category.slug).map(cat => (
            <Link key={cat.slug} to={`/byraer/${city.slug}/${cat.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Top cities for this category */}
      <section className="container pb-12">
        <h2 className="font-display text-lg font-semibold mb-4">{category.name} i andra städer</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_CITIES.filter(c => c.slug !== city.slug).slice(0, 8).map(c => (
            <Link key={c.slug} to={`/byraer/${c.slug}/${category.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <SEOLeadCTA categoryName={category.name.toLowerCase()} />
      <Footer />
    </div>
  )
}

export default AgencyCityCategoryPage
