import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const PROJECT_TYPES = [
  { label: 'Landningssida', base: 9000 },
  { label: 'Företagshemsida', base: 25000 },
  { label: 'WordPress/CMS-sajt', base: 65000 },
  { label: 'E-handel', base: 95000 },
  { label: 'Webbapp / kundportal', base: 160000 },
]

const FEATURES = [
  { label: 'Kontaktformulär/leadflöde', cost: 12000 },
  { label: 'Bokningssystem', cost: 18000 },
  { label: 'Betalning (Klarna/Stripe)', cost: 25000 },
  { label: 'Blogg/kunskapsbank', cost: 16000 },
  { label: 'Flerspråkighet', cost: 22000 },
  { label: 'Integration med CRM/API', cost: 30000 },
  { label: 'SEO-startpaket', cost: 18000 },
  { label: 'Copywriting', cost: 20000 },
]

const LEVELS = [
  { label: 'Budget / enkel lösning', factor: 0.8 },
  { label: 'Professionell standard', factor: 1 },
  { label: 'Premium / skräddarsytt', factor: 1.35 },
]

const format = (n: number) =>
  (Math.round(n / 1000) * 1000).toLocaleString('sv-SE')

const WebsitePriceCalculator = () => {
  const [typeIndex, setTypeIndex] = useState(1)
  const [pages, setPages] = useState(8)
  const [levelIndex, setLevelIndex] = useState(1)
  const [selected, setSelected] = useState<number[]>([])

  const toggle = (i: number) =>
    setSelected(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]))

  const { low, high } = useMemo(() => {
    const base = PROJECT_TYPES[typeIndex].base
    const pageCost = Math.max(0, pages - 5) * 1800
    const featureCost = selected.reduce((sum, i) => sum + FEATURES[i].cost, 0)
    const l = (base + pageCost + featureCost) * LEVELS[levelIndex].factor
    return { low: l, high: l * 1.45 }
  }, [typeIndex, pages, levelIndex, selected])

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <h2 className="font-display text-xl font-bold mb-6">Beräkna pris</h2>

        <label htmlFor="calc-type" className="block text-sm font-semibold mb-2">Typ av projekt</label>
        <select
          id="calc-type"
          value={typeIndex}
          onChange={e => setTypeIndex(Number(e.target.value))}
          className="w-full h-12 rounded-xl border bg-background px-3 text-base"
        >
          {PROJECT_TYPES.map((t, i) => <option key={t.label} value={i}>{t.label}</option>)}
        </select>

        <label htmlFor="calc-pages" className="block text-sm font-semibold mt-6 mb-2">
          Antal sidor: <span className="text-primary">{pages}</span>
        </label>
        <input
          id="calc-pages"
          type="range"
          min={1}
          max={50}
          value={pages}
          onChange={e => setPages(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <p className="text-sm font-semibold mt-6 mb-2">Funktioner</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <label
              key={f.label}
              className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(i)}
                onChange={() => toggle(i)}
                className="accent-primary h-4 w-4"
              />
              {f.label}
            </label>
          ))}
        </div>

        <label htmlFor="calc-level" className="block text-sm font-semibold mt-6 mb-2">Ambitionsnivå</label>
        <select
          id="calc-level"
          value={levelIndex}
          onChange={e => setLevelIndex(Number(e.target.value))}
          className="w-full h-12 rounded-xl border bg-background px-3 text-base"
        >
          {LEVELS.map((l, i) => <option key={l.label} value={i}>{l.label}</option>)}
        </select>
      </div>

      <aside className="rounded-2xl border bg-card p-6 md:p-8 h-fit md:sticky md:top-24">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uppskattning</p>
        <p className="font-display text-3xl md:text-4xl font-bold tracking-tight my-3">
          {format(low)} – {format(high)} kr
        </p>
        <p className="text-sm text-muted-foreground">
          Detta är ett riktpris, inte en offert. Faktiskt pris beror på byrå, teknikval,
          innehåll, designnivå och integrationsbehov.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
          <li>Jämför alltid flera offerter.</li>
          <li>Be om tydligt scope och leveranslista.</li>
          <li>Kontrollera support, ägande och löpande kostnader.</li>
        </ul>
        <Link to="/publicera" className="block mt-6">
          <Button size="lg" className="w-full rounded-xl shadow-blue">
            Få riktiga offerter gratis <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </aside>
    </div>
  )
}

export default WebsitePriceCalculator
