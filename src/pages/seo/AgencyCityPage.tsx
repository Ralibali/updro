import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCityBySlug, SEO_AGENCY_CATEGORIES, SEO_CITIES } from '@/lib/seoAgencyData'
import { setSEOMeta } from '@/lib/seoHelpers'
import { supabase } from '@/integrations/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import NotFound from '@/pages/NotFound'
import SEOLeadCTA from '../seo/SEOLeadCTA'
import { ChevronRight, MapPin, Search, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'

const AgencyCityPage = () => {
  const { stad } = useParams<{ stad: string }>()
  const city = getCityBySlug(stad || '')
  const [agencies, setAgencies] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (city) {
      setSEOMeta({
        title: `Byråer i ${city.name} | Updro`,
        description: `Jämför och hitta de bästa byråerna i ${city.name}. Få offerter från digitala byråer, reklambyråer och designbyråer.`,
        canonical: `https://updro.se/byraer/${city.slug}`,
      })
    }
    window.scrollTo(0, 0)
  }, [city])

  useEffect(() => {
    if (!city) return
    const fetch = async () => {
      const { data } = await supabase
        .from('supplier_profiles')
        .select('*, profiles!supplier_profiles_id_fkey(full_name, company_name, city, avatar_url)')
        .order('avg_rating', { ascending: false })
        .limit(50)
      if (data) {
        setAgencies(data.filter(a => {
          const c = (a.profiles?.city || '').toLowerCase()
          return c.includes(city.name.toLowerCase())
        }))
      }
    }
    fetch()
  }, [city])

  if (!city) return <NotFound />

  const filtered = search
    ? agencies.filter(a => (a.profiles?.company_name || '').toLowerCase().includes(search.toLowerCase()))
    : agencies

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hem', item: 'https://updro.se/' },
      { '@type': 'ListItem', position: 2, name: 'Byråer', item: 'https://updro.se/byraer' },
      { '@type': 'ListItem', position: 3, name: city.name, item: `https://updro.se/byraer/${city.slug}` },
    ]},
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <link rel="canonical" href={`https://updro.se/byraer/${city.slug}`} />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/byraer" className="hover:text-foreground">Byråer</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{city.name}</span>
        </nav>
      </div>

      <section className="container py-12">
        <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Byråer i {city.name} – Hitta rätt byrå</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{city.description}</p>

        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Sök byrå..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
      </section>

      {/* Category links */}
      <section className="container pb-8">
        <h2 className="font-display text-xl font-semibold mb-4">Kategorier i {city.name}</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_AGENCY_CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/byraer/${city.slug}/${cat.slug}`}
              className="text-sm px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Agency list */}
      <section className="container pb-16">
        <h2 className="font-display text-xl font-semibold mb-6">{filtered.length} byråer i {city.name}</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Inga byråer registrerade i {city.name} ännu.</p>
            <p className="text-sm text-muted-foreground mt-1">Publicera ditt uppdrag så matchar vi dig med rätt byrå.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => (
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

      {/* Other cities */}
      <section className="container pb-12">
        <h2 className="font-display text-lg font-semibold mb-4">Byråer i andra städer</h2>
        <div className="flex flex-wrap gap-2">
          {SEO_CITIES.filter(c => c.slug !== city.slug).slice(0, 12).map(c => (
            <Link key={c.slug} to={`/byraer/${c.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <SEOLeadCTA />
      <Footer />
    </div>
  )
}

export default AgencyCityPage
