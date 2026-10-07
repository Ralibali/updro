import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAgencyDirectory } from '@/hooks/useAgencyDirectory'
import DirectoryStatus from './DirectoryStatus'
import InlineBriefForm from './InlineBriefForm'
import { Input } from '@/components/ui/input'

export default function CategoryAgencies({ category, label }: { category?: string; label: string }) {
  const { agencies, loading, error, retry } = useAgencyDirectory({ category })
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const cities = [...new Set(agencies.map(a => a.profiles?.city).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, 'sv'))
  const visible = agencies.filter(a => (!city || a.profiles?.city === city) && `${a.profiles?.company_name || ''} ${a.bio || ''}`.toLocaleLowerCase('sv').includes(query.toLocaleLowerCase('sv')))
  return <section className="container pb-12" aria-labelledby="category-agencies-heading">
    <h2 id="category-agencies-heading" className="font-display text-2xl font-bold mb-5">Byråer inom {label}</h2>
    <div className="mb-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
      <Input aria-label="Sök byrå" placeholder="Sök byrå eller kompetens" value={query} onChange={e => setQuery(e.target.value)} />
      <select aria-label="Filtrera på ort" className="h-11 rounded-lg border border-input bg-background px-3 text-sm" value={city} onChange={e => setCity(e.target.value)}><option value="">Alla orter</option>{cities.map(value => <option key={value}>{value}</option>)}</select>
    </div>
    {loading || error ? <DirectoryStatus loading={loading} error={error} retry={retry} /> : visible.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map(a => <Link key={a.id} to={`/byra/${a.slug}`} className="rounded-xl border bg-card p-5 hover:border-primary focus-visible:ring-2 focus-visible:ring-ring">
      <h3 className="font-display text-lg font-semibold">{a.profiles?.company_name || 'Byrå'}</h3><p className="mt-1 text-sm text-muted-foreground">{a.profiles?.city || 'Sverige'}</p><p className="mt-3 text-sm line-clamp-3">{a.bio}</p><span className="mt-4 inline-block text-primary font-semibold text-sm">Se byråprofil →</span>
    </Link>)}</div> : <div className="max-w-2xl rounded-xl border bg-card p-6">
      <h3 className="font-semibold">Hitta rätt byrå för ditt projekt</h3><p className="mt-2 text-sm text-muted-foreground">{query || city ? 'Ingen byrå matchar filtren. Prova en annan ort eller beskriv ditt uppdrag.' : 'Här finns ännu inga publicerade byråprofiler i kategorin. Beskriv ditt uppdrag så kan relevanta byråer lämna offert.'}</p>
      {(query || city) && <button className="mt-3 min-h-11 text-primary underline" onClick={() => { setQuery(''); setCity('') }}>Rensa filter</button>}
      <InlineBriefForm category={category} source="category_directory_empty" className="mt-5" />
      <Link to="/byraer" className="inline-block mt-4 text-primary underline">Se byråer i hela Sverige</Link>
    </div>}
  </section>
}
