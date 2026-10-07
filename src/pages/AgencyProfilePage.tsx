import { categoryLabel } from '@/lib/constants'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CATEGORY_STYLES } from '@/lib/constants'
import { Star, MapPin, CheckCircle, Globe, ArrowRight, Building2, FolderOpen, ExternalLink, CalendarDays } from 'lucide-react'
import { timeAgo } from '@/lib/dateUtils'
import RatingDisplay from '@/components/shared/RatingDisplay'
import VerificationChecklist from '@/components/shared/VerificationChecklist'
import { CATEGORY_PRICE_MAP } from '@/lib/categoryPriceMap'
import { setSEOMeta, setJsonLd } from '@/lib/seoHelpers'
import DirectoryStatus from '@/components/shared/DirectoryStatus'
import { seoLeadPath } from '@/lib/seoLeadPath'
import NotFound from '@/pages/NotFound'

const AgencyProfilePage = () => {
  const { slug } = useParams()
  const [agency, setAgency] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    let cancelled = false
    const fetchAgency = async () => {
      setLoading(true)
      setError(false)
      setAgency(null)
      setProfile(null)
      try {
        const { data, error: queryError } = await supabase.rpc('get_public_agencies').eq('slug', slug).maybeSingle()
        if (cancelled) return
        if (queryError) throw queryError
        setAgency(data)
        setProfile(data)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAgency()
    return () => { cancelled = true }
  }, [slug, attempt])

  useEffect(() => {
    if (agency && profile) {
      const name = profile.company_name || profile.full_name || 'Byrå'
      const url = `https://updro.se/byra/${slug}`
      setSEOMeta({
        title: `${name} – Byråprofil | Updro`,
        description: `Se ${name}s profil på Updro. Tjänster, presentation och portfölj. Beskriv ditt projekt och jämför offerter.`,
        canonical: url,
        ogType: 'profile',
      })

      const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        '@id': url,
        name,
        url,
        description: agency.bio || `${name} – byrå på Updro.`,
        areaServed: profile.city || 'Sverige',
        address: profile.city
          ? { '@type': 'PostalAddress', addressLocality: profile.city, addressCountry: 'SE' }
          : undefined,
        image: agency.logo_url || undefined,
        sameAs: agency.website_url ? [agency.website_url] : undefined,
      }
      if (agency.review_count > 0 && agency.avg_rating > 0) {
        schema.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: Number(agency.avg_rating).toFixed(1),
          reviewCount: agency.review_count,
          bestRating: 5,
          worstRating: 1,
        }
      }
      setJsonLd('agency-jsonld', schema)
    }
  }, [agency, profile, slug])

  if (loading) return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></main>
      <Footer />
    </div>
  )

  if (error) return <div className="updro-content-page min-h-screen flex flex-col"><Navbar /><main className="container flex-1 py-12"><DirectoryStatus loading={false} error retry={() => setAttempt(value => value + 1)} /></main><Footer /></div>
  if (!agency) return <NotFound />

  const services = [...new Set<string>([...(agency.categories || []).map(categoryLabel), ...(agency.services || [])])]
  const stats = [
    ...(agency.review_count > 0 && agency.avg_rating > 0 ? [{ label: 'Betyg', value: `${Number(agency.avg_rating).toFixed(1)} / 5` }, { label: 'Omdömen', value: agency.review_count }] : []),
    ...(agency.completed_projects > 0 ? [{ label: 'Uppdrag via Updro', value: agency.completed_projects }] : []),
    ...(agency.created_at ? [{ label: 'På Updro sedan', value: new Date(agency.created_at).getFullYear() }] : []),
  ]

  return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Cover */}
        <div className="h-20 bg-primary" />

        <div className="container pt-5 mb-16">
          {/* Header */}
          <div className="mb-6 grid grid-cols-[80px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[96px_minmax(0,1fr)_auto]">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full bg-card border-4 border-card shadow-lg flex items-center justify-center text-3xl font-bold text-primary overflow-hidden">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={profile?.company_name ? `${profile.company_name} logotyp` : ''} className="h-full w-full object-contain" />
              ) : (
                (profile?.company_name || profile?.full_name || '?')[0]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold break-words">{profile?.company_name || profile?.full_name}</h1>
                {agency.is_verified && <CheckCircle className="h-5 w-5 shrink-0 text-primary" />}
              </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile?.city || 'Sverige'}</span>
                </div>
                <div className="mt-2">
                  <RatingDisplay avgRating={agency.avg_rating || 0} reviewCount={agency.review_count || 0} size="md" />
                </div>
                <VerificationChecklist
                  isVerified={agency.is_verified}
                  hasFskatt={agency.has_fskatt}
                  creditCheckPassed={agency.credit_check_passed}
                  completedProjects={agency.completed_projects}
                />
            </div>
            <div className="col-span-2 flex flex-wrap gap-2 lg:col-span-1">
              <Button className="min-h-11 bg-accent hover:bg-brand-mint-hover text-accent-foreground rounded-xl" asChild><Link to={`/publicera?kategori=${(agency.categories || [])[0] || ''}`}>
                  Skicka förfrågan <ArrowRight className="ml-2 h-4 w-4" />
                </Link></Button>
              {agency.website_url && (
                <Button variant="outline" className="min-h-11 rounded-xl" asChild><a href={agency.website_url} target="_blank" rel="noopener noreferrer"><Globe className="mr-1 h-4 w-4" /> Hemsida</a></Button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {services.map((cat: string) => (
              <span key={cat} className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_STYLES[cat] || 'bg-muted text-foreground'}`}>{categoryLabel(cat)}</span>
            ))}
          </div>

          {/* Stats strip */}
          {stats.length > 0 && <dl className="flex flex-wrap gap-3 mb-8">{stats.map(stat => <div key={stat.label} className="min-w-36 rounded-xl border bg-card p-4 text-center"><dt className="text-xs text-muted-foreground">{stat.label}</dt><dd className="mt-1 font-display text-xl font-bold">{stat.value}</dd></div>)}</dl>}

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Översikt</TabsTrigger>
              <TabsTrigger value="reviews">Verifierade omdömen ({agency.review_count})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {agency.bio && (
                    <div className="bg-card rounded-xl border p-5">
                      <h3 className="font-semibold mb-2">Om byrån</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{agency.bio}</p>
                    </div>
                  )}
                  {services.length > 0 && (
                    <div className="bg-card rounded-xl border p-5">
                      <h3 className="font-semibold mb-2">Tjänster</h3>
                      <div className="flex flex-wrap gap-2">
                        {services.map((s: string) => (
                          <span key={s} className="bg-muted rounded-full px-3 py-1 text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(agency.portfolio_urls || []).length > 0 && (
                    <div className="bg-card rounded-xl border p-5">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-primary" aria-hidden="true" /> Portfölj
                      </h3>
                      <ul className="space-y-2">
                        {agency.portfolio_urls.map((url: string) => (
                          <li key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium hover:border-primary transition-colors"
                            >
                              <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <aside className="space-y-6">
                  <div className="bg-card rounded-xl border p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> Företagsuppgifter
                    </h3>
                    <dl className="space-y-2.5 text-sm">
                      {agency.org_number && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">Org.nr</dt>
                          <dd className="font-medium">{agency.org_number}</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Ort</dt>
                        <dd className="font-medium">{profile?.city || 'Sverige'}</dd>
                      </div>
                      {agency.has_fskatt && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">F-skatt</dt>
                          <dd className="font-medium text-emerald-700">Registrerad</dd>
                        </div>
                      )}
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">På Updro sedan</dt>
                        <dd className="font-medium inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                          {agency.created_at ? new Date(agency.created_at).getFullYear() : '–'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {(agency.categories || []).some((cat: string) => CATEGORY_PRICE_MAP[cat]) && (
                    <div className="bg-secondary/60 rounded-xl border border-border p-5">
                      <h3 className="font-semibold mb-1.5 text-sm">Vad kostar det?</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Se marknadspriser innan du skickar din förfrågan:
                      </p>
                      <ul className="space-y-1.5">
                        {(agency.categories || [])
                          .filter((cat: string) => CATEGORY_PRICE_MAP[cat])
                          .slice(0, 3)
                          .map((cat: string) => (
                            <li key={cat}>
                              <Link
                                to={`/priser/${CATEGORY_PRICE_MAP[cat].guideSlug}`}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                Prisguide: {CATEGORY_PRICE_MAP[cat].guideLabel} →
                              </Link>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="rounded-xl border bg-card p-6">
                <h2 className="font-display text-xl font-semibold">Omdömen från uppdrag via Updro</h2>
                <p className="mt-3 text-muted-foreground">{agency.review_count > 0 ? `${agency.review_count} omdömen med snittbetyg ${Number(agency.avg_rating).toFixed(1)} av 5.` : 'Det finns ännu inga omdömen kopplade till slutförda uppdrag för den här byrån.'}</p>
                <p className="mt-3 text-sm text-muted-foreground">Här räknas bara omdömen från beställare med ett slutfört projekt och en accepterad offert från byrån. Be även om referenser och arbetsprover som passar ditt behov.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AgencyProfilePage
