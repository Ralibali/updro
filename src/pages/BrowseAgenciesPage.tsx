import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAgencyDirectory } from '@/hooks/useAgencyDirectory'
import DirectoryStatus from '@/components/shared/DirectoryStatus'
import { seoLeadPath } from '@/lib/seoLeadPath'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES, CATEGORY_STYLES } from '@/lib/constants'
import { Search, MapPin, CheckCircle, ArrowRight, FileCheck, Users } from 'lucide-react'
import RatingDisplay from '@/components/shared/RatingDisplay'
import VerificationChecklist from '@/components/shared/VerificationChecklist'
import { setSEOMeta } from '@/lib/seoHelpers'

const BrowseAgenciesPage = () => {
  const { agencies, loading, error, retry } = useAgencyDirectory()
  const [filterCat, setFilterCat] = useState('all')
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    setSEOMeta({
      title: 'Hitta byråer i Sverige – Jämför och välj rätt byrå | Updro',
      description: 'Hitta digitala byråer efter tjänst och stad. Granska profiler och verifieringsuppgifter, eller beskriv projektet gratis för att jämföra högst tre offerter.',
      canonical: 'https://updro.se/byraer',
    })
  }, [])

  const filtered = agencies.filter(a => {
    const profile = a.profiles
    if (filterCat !== 'all' && !(a.categories || []).includes(filterCat)) return false
    if (searchCity && !(profile?.city || '').toLowerCase().includes(searchCity.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-10 md:py-16">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] items-center mb-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent mb-3">DITT NÄSTA BYRÅSAMARBETE</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight max-w-xl">Hitta byrån som passar ditt projekt.</h1>
                <p className="text-muted-foreground mt-5 text-lg max-w-xl">Jämför kompetens och arbetsprover i byråprofilerna. Eller beskriv ditt projekt en gång och jämför upp till tre offerter, helt gratis.</p>
                <Link to={seoLeadPath(filterCat === 'all' ? undefined : filterCat)} className="inline-block mt-6">
                  <Button size="lg" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-brand">Jämför offerter gratis <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-3">Inget konto krävs för att börja · Ingen köpplikt</p>
              </div>
              <aside className="hidden lg:block rounded-3xl border bg-card p-6 md:p-8 shadow-md">
                <h2 className="font-display text-xl font-semibold">Ett tydligare underlag att välja från</h2>
                <div className="mt-5 space-y-5 text-sm">
                  <p className="flex gap-3"><FileCheck className="h-5 w-5 shrink-0 text-primary" /><span><strong className="block text-foreground">Samma brief till byråerna</strong><span className="text-muted-foreground">Beskriv mål, omfattning och budget så att svaren går att jämföra.</span></span></p>
                  <p className="flex gap-3"><Users className="h-5 w-5 shrink-0 text-primary" /><span><strong className="block text-foreground">Högst tre offerter</strong><span className="text-muted-foreground">Updro granskar uppdraget. Relevanta byråer väljer om de vill svara.</span></span></p>
                  <p className="flex gap-3"><CheckCircle className="h-5 w-5 shrink-0 text-primary" /><span><strong className="block text-foreground">Kontrollera varje profil</strong><span className="text-muted-foreground">Verifieringsstatus visas per byrå. Läs arbetsprover och be om referenser.</span></span></p>
                </div>
              </aside>
            </div>
            <div className="border-t pt-8 mb-6">
              <h2 className="font-display text-2xl font-semibold">Utforska byråprofiler</h2>
              <p className="text-sm text-muted-foreground mt-2">Här visas företagsprofiler som markerats verifierade på Updro. Ordningen är ingen redaktionell rekommendation; jämför erfarenhet, arbetsprover och omdömen.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8 rounded-2xl border bg-card p-4 shadow-sm">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Filtrera byråer efter stad"
                  placeholder="Sök stad..."
                  value={searchCity}
                  onChange={e => setSearchCity(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={filterCat} onValueChange={setFilterCat}>
                <SelectTrigger aria-label="Filtrera byråer efter kategori" className="w-full sm:w-56 rounded-xl"><SelectValue placeholder="Alla kategorier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla kategorier</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Grid */}
            {loading || error ? <DirectoryStatus loading={loading} error={error} retry={retry} /> : filtered.length === 0 ? (
              <div className="rounded-2xl border bg-muted/30 p-8">
                <h3 className="font-semibold">Ingen profil matchar de valda filtren</h3>
                <p className="mt-2 text-muted-foreground">Prova en annan tjänst eller stad. Många digitala projekt kan genomföras på distans.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setFilterCat('all'); setSearchCity('') }}>Visa alla byråer</Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(a => {
                  const profile = a.profiles
                  return (
                    <Link key={a.id} to={`/byra/${a.slug}`} className="group block rounded-2xl">
                      <div className="bg-card rounded-2xl border p-6 shadow-sm group-hover:border-accent/40 group-hover:shadow-md motion-safe:group-hover:-translate-y-1 transition-all h-full">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                            {(profile?.company_name || profile?.full_name || '?')[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-semibold">{profile?.company_name || profile?.full_name}</h3>
                              {a.is_verified && <CheckCircle aria-label="Verifierad byrå" className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {profile?.city || 'Sverige'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(a.categories || []).slice(0, 3).map((cat: string) => (
                            <span key={cat} className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[cat] || ''}`}>{cat}</span>
                          ))}
                        </div>

                        {a.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{a.bio}</p>}

                        <RatingDisplay avgRating={a.avg_rating || 0} reviewCount={a.review_count || 0} />

                        <VerificationChecklist
                          isVerified={a.is_verified ?? false}
                          hasFskatt={a.has_fskatt ?? false}
                          creditCheckPassed={a.credit_check_passed ?? false}
                          completedProjects={a.completed_projects ?? 0}
                        />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default BrowseAgenciesPage
