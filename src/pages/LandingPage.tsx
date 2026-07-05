import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, Check, Clock, Shield, Globe, ShoppingCart, Search,
  Smartphone, Megaphone, Palette, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useEffect, useMemo, useRef, useState } from 'react'
import { setSEOMeta } from '@/lib/seoHelpers'

/* -------------------- Live feed data -------------------- */
const LIVE_POOL = [
  { emoji: '🛒', title: 'Ny Shopify-butik', city: 'Göteborg', budget: '80–120 tkr' },
  { emoji: '🔍', title: 'SEO-uppdrag 6 mån', city: 'Stockholm', budget: '15–25 tkr/mån' },
  { emoji: '📱', title: 'App MVP', city: 'Malmö', budget: '150–250 tkr' },
  { emoji: '🌐', title: 'Ny hemsida', city: 'Linköping', budget: '40–60 tkr' },
  { emoji: '🎯', title: 'Google Ads-setup', city: 'Uppsala', budget: '10–18 tkr/mån' },
  { emoji: '🎨', title: 'Rebranding & logotyp', city: 'Örebro', budget: '35–70 tkr' },
  { emoji: '🛍️', title: 'WooCommerce-migrering', city: 'Västerås', budget: '55–90 tkr' },
  { emoji: '📈', title: 'Konverteringsoptimering', city: 'Helsingborg', budget: '20–40 tkr' },
]

const LiveFeed = () => {
  const reduce = useReducedMotion()
  const [items, setItems] = useState(LIVE_POOL.slice(0, 4))
  const idxRef = useRef(4)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => {
      const next = LIVE_POOL[idxRef.current % LIVE_POOL.length]
      idxRef.current += 1
      setItems((cur) => [next, ...cur.slice(0, 3)])
    }, 4000)
    return () => clearInterval(t)
  }, [reduce])

  return (
    <div className="bg-card border rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          Senaste uppdragen
        </h3>
        <span className="text-xs font-mono text-muted-foreground">LIVE</span>
      </div>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {items.map((it, i) => (
            <motion.li
              key={`${it.title}-${it.city}-${i}-${idxRef.current}`}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/60"
            >
              <span className="text-2xl leading-none">{it.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{it.title}</div>
                <div className="text-xs text-muted-foreground font-mono truncate">
                  {it.city} · {it.budget}
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">Uppdaterat i realtid</p>
    </div>
  )
}

/* -------------------- Count up -------------------- */
const CountUp = ({ end, suffix = '', prefix = '', duration = 1200 }: {
  end: number; suffix?: string; prefix?: string; duration?: number
}) => {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [val, setVal] = useState(reduce ? end : 0)

  useEffect(() => {
    if (!inView || reduce) { setVal(end); return }
    let raf = 0
    const start = performance.now()
    const step = (t: number) => {
      const p = Math.min((t - start) / duration, 1)
      setVal(Math.round(end * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, end, duration, reduce])

  return <span ref={ref} className="font-mono">{prefix}{val}{suffix}</span>
}

/* -------------------- Calculator -------------------- */
const PROJECT_TYPES = [
  { id: 'hemsida', label: 'Ny hemsida', query: 'Ny hemsida' },
  { id: 'ehandel', label: 'E-handel', query: 'E-handel' },
  { id: 'seo', label: 'SEO', query: 'SEO' },
  { id: 'ads', label: 'Google Ads', query: 'Google Ads' },
  { id: 'app', label: 'Apputveckling', query: 'Apputveckling' },
  { id: 'design', label: 'Design & varumärke', query: 'Design & varumärke' },
] as const

type LevelKey = 'enkel' | 'standard' | 'avancerad'

const PRICE_MATRIX: Record<string, Record<LevelKey, { range: string; time: string; matches: number }>> = {
  hemsida: {
    enkel: { range: '25 000 – 45 000 kr', time: '2–3 veckor', matches: 24 },
    standard: { range: '45 000 – 90 000 kr', time: '4–6 veckor', matches: 31 },
    avancerad: { range: '90 000 – 180 000 kr', time: '8–12 veckor', matches: 18 },
  },
  ehandel: {
    enkel: { range: '50 000 – 90 000 kr', time: '4–6 veckor', matches: 17 },
    standard: { range: '90 000 – 180 000 kr', time: '6–10 veckor', matches: 22 },
    avancerad: { range: '180 000 – 400 000 kr', time: '10–16 veckor', matches: 12 },
  },
  seo: {
    enkel: { range: '8 000 – 15 000 kr/mån', time: 'löpande', matches: 28 },
    standard: { range: '15 000 – 30 000 kr/mån', time: 'löpande', matches: 21 },
    avancerad: { range: '30 000 – 60 000 kr/mån', time: 'löpande', matches: 11 },
  },
  ads: {
    enkel: { range: '6 000 – 12 000 kr/mån', time: 'löpande', matches: 19 },
    standard: { range: '12 000 – 25 000 kr/mån', time: 'löpande', matches: 15 },
    avancerad: { range: '25 000 – 50 000 kr/mån', time: 'löpande', matches: 9 },
  },
  app: {
    enkel: { range: '100 000 – 200 000 kr', time: '8–12 veckor', matches: 11 },
    standard: { range: '200 000 – 450 000 kr', time: '12–20 veckor', matches: 14 },
    avancerad: { range: '450 000 – 900 000 kr', time: '20–32 veckor', matches: 7 },
  },
  design: {
    enkel: { range: '20 000 – 40 000 kr', time: '2–3 veckor', matches: 26 },
    standard: { range: '40 000 – 80 000 kr', time: '3–5 veckor', matches: 20 },
    avancerad: { range: '80 000 – 160 000 kr', time: '5–8 veckor', matches: 12 },
  },
}

const Calculator = () => {
  const [type, setType] = useState<typeof PROJECT_TYPES[number]>(PROJECT_TYPES[0])
  const [level, setLevel] = useState<LevelKey>('standard')
  const result = PRICE_MATRIX[type.id][level]

  return (
    <div className="rounded-3xl border shadow-xl p-6 md:p-12 bg-card">
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          1 · Projekttyp
        </div>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((t) => {
            const active = t.id === type.id
            return (
              <button
                key={t.id}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-accent text-accent-foreground border-accent shadow-hard-sm'
                    : 'bg-background border-border hover:border-accent/60'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          2 · Omfattning
        </div>
        <div className="inline-flex rounded-lg border-2 border-foreground overflow-hidden">
          {(['enkel', 'standard', 'avancerad'] as LevelKey[]).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${
                level === l
                  ? 'bg-foreground text-background'
                  : 'bg-background text-foreground hover:bg-secondary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${type.id}-${level}`}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl bg-secondary/60 border p-6 md:p-8"
        >
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Prisintervall
          </div>
          <div className="font-mono text-3xl md:text-5xl font-bold text-foreground mb-4">
            {result.range}
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Typisk leveranstid: <span className="text-foreground font-medium">{result.time}</span>
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-mono text-foreground font-medium">{result.matches}</span> byråer matchar
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8">
        <Link
          to={`/publicera?kategori=${encodeURIComponent(type.query)}`}
          className="inline-flex items-center gap-2 h-14 px-8 bg-accent text-accent-foreground text-base font-bold font-display uppercase tracking-wide border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:bg-[hsl(14_75%_50%)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          Få exakta offerter för ditt projekt
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

/* -------------------- Categories -------------------- */
const CATEGORIES = [
  { icon: Globe, name: 'Webbutveckling', desc: 'Hemsidor, plattformar, CMS', count: 42, to: '/kategori/webbutveckling' },
  { icon: ShoppingCart, name: 'E-handel', desc: 'Shopify, Woo, custom', count: 28, to: '/kategori/ehandel' },
  { icon: Search, name: 'SEO', desc: 'Teknisk & innehålls-SEO', count: 34, to: '/kategori/seo' },
  { icon: Megaphone, name: 'Google Ads', desc: 'Sök, display, shopping', count: 26, to: '/kategori/google-ads' },
  { icon: Smartphone, name: 'Apputveckling', desc: 'iOS, Android, React Native', count: 18, to: '/kategori/apputveckling' },
  { icon: Palette, name: 'Design & UX', desc: 'Varumärke, gränssnitt', count: 31, to: '/kategori/grafisk-design' },
  { icon: Sparkles, name: 'Digital marknadsföring', desc: 'Sociala medier, content', count: 29, to: '/kategori/digital-marknadsforing' },
]

/* -------------------- FAQ -------------------- */
const FAQS = [
  { q: 'Kostar det verkligen ingenting?', a: 'Nej. Updro är helt gratis för dig som köpare. Byråerna betalar för att få tillgång till uppdrag, du betalar aldrig något till oss.' },
  { q: 'Måste jag välja någon av offerterna?', a: 'Nej. Du förbinder dig inte till något genom att publicera ett uppdrag. Gillar du ingen offert tackar du bara nej.' },
  { q: 'Hur snabbt får jag offerter?', a: 'De flesta uppdrag får sin första offert inom 24 timmar. Inom 2–3 dagar har du normalt 3–5 offerter att jämföra.' },
  { q: 'Hur vet jag att byråerna är seriösa?', a: 'Varje byrå granskas manuellt innan de godkänns: organisationsnummer, F-skatt, kundcase och referenser.' },
  { q: 'Vilka typer av projekt kan jag publicera?', a: 'Allt digitalt: hemsidor, e-handel, SEO, annonsering, appar, design och varumärke. Från 10 000 kr till miljonprojekt.' },
  { q: 'Vad händer med mina kontaktuppgifter?', a: 'De delas bara med byråer som aktivt låser upp ditt uppdrag – aldrig säljs vidare eller spammas.' },
]

/* -------------------- Section wrapper -------------------- */
const Section = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    {children}
  </motion.section>
)

/* -------------------- Page -------------------- */
const LandingPage = () => {
  const [params] = useSearchParams()
  const category = params.get('kategori') || 'digitala tjänster'

  useEffect(() => {
    setSEOMeta({
      title: `Jämför offerter för ${category} – Gratis | Updro`,
      description: `Få upp till fem offerter från kvalitetssäkrade byråer inom ${category}. Helt gratis och utan förpliktelser. Svar inom 24 timmar.`,
      noindex: true,
    })
  }, [category])

  const scrollToSteps = () => {
    document.getElementById('sa-funkar-det')?.scrollIntoView({ behavior: 'smooth' })
  }

  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }), [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-background border-b border-foreground/10">
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-foreground/5 blur-3xl pointer-events-none" />

          <div className="container relative z-10 py-16 md:py-24 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
              <div className="lg:col-span-3 space-y-8">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-4 py-1.5 text-sm font-medium"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  24 byråer online just nu
                </motion.span>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 }}
                  className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-foreground"
                >
                  Rätt byrå.{' '}
                  <span className="text-brand-gradient">Fem offerter.</span>{' '}
                  Ett dygn.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
                >
                  Beskriv ditt projekt en gång. Vi matchar dig med kvalitetssäkrade digitala byråer som tävlar om ditt uppdrag – helt gratis och utan förpliktelser.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.24 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link to="/publicera">
                    <Button size="lg" className="rounded-xl px-10 py-6 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground shadow-hard">
                      Publicera ditt projekt – gratis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={scrollToSteps}
                    className="rounded-xl px-8 py-6 text-base font-semibold"
                  >
                    Se hur det funkar
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                  className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
                >
                  <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />100 % gratis för köpare</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" />Offerter inom 24 h</span>
                  <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-accent" />Endast granskade byråer</span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <LiveFeed />
              </motion.div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="py-12 border-y bg-secondary/40">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { render: <><CountUp end={120} suffix="+" /></>, label: 'Granskade byråer' },
                { render: <><CountUp end={24} suffix=" h" /></>, label: 'Snitt till första offert' },
                { render: <><CountUp end={5} /></>, label: 'Offerter per uppdrag' },
                { render: <><CountUp end={0} suffix=" kr" /></>, label: 'Kostnad för köpare' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="text-center md:text-left"
                >
                  <div className="text-4xl md:text-5xl font-bold text-foreground">
                    {s.render}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <Section className="py-24 md:py-32" >
          <div id="sa-funkar-det" className="container">
            <div className="max-w-2xl mb-14">
              <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">Processen</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Från idé till offert på ett dygn
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { n: '01', t: 'Beskriv ditt projekt', d: 'Svara på några frågor om vad du behöver. Tar 3 minuter, kräver inga tekniska förkunskaper.' },
                { n: '02', t: 'Byråerna tävlar', d: 'Matchande byråer får se ditt uppdrag och lämnar skarpa offerter med pris och tidsplan.' },
                { n: '03', t: 'Du väljer vinnaren', d: 'Jämför offerter sida vid sida, chatta med byråerna och välj den som passar. Eller tacka nej – det kostar inget.' },
              ].map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative rounded-2xl border bg-card p-8 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all"
                >
                  <span className="absolute top-4 right-4 font-mono text-6xl font-bold text-accent/20 select-none">
                    {s.n}
                  </span>
                  <h3 className="font-display text-2xl font-bold mb-3 relative">{s.t}</h3>
                  <p className="text-muted-foreground leading-relaxed relative">{s.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* CALCULATOR */}
        <Section className="py-24 md:py-32 bg-secondary/40 border-y">
          <div className="container">
            <div className="max-w-2xl mb-10">
              <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">Prisguide</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Vad kostar ditt projekt?
              </h2>
              <p className="text-lg text-muted-foreground">
                Välj projekttyp och få ett prisintervall baserat på verkliga offerter.
              </p>
            </div>
            <Calculator />
          </div>
        </Section>

        {/* CATEGORIES */}
        <Section className="py-24 md:py-32">
          <div className="container">
            <div className="max-w-2xl mb-14">
              <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">Kategorier</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Hitta rätt byrå för varje behov
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <Link
                    to={c.to}
                    className="group block h-full p-6 rounded-2xl border-2 border-border bg-card hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg transition-all"
                  >
                    <c.icon className="w-7 h-7 text-accent mb-4" strokeWidth={2} />
                    <h3 className="font-display text-lg font-bold mb-1">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
                    <div className="font-mono text-xs text-foreground/70">{c.count} byråer</div>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: CATEGORIES.length * 0.05 }}
              >
                <Link
                  to="/kategorier"
                  className="group flex flex-col justify-between h-full p-6 rounded-2xl border-2 border-dashed border-foreground/30 bg-secondary/40 hover:border-accent hover:-translate-y-1 transition-all"
                >
                  <div className="font-display text-lg font-bold">Se alla kategorier</div>
                  <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </Section>

        {/* QUALITY */}
        <Section className="py-24 md:py-32 bg-secondary/40 border-y">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">Kvalitet</div>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  Varför inte bara googla?
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  En Google-sökning ger dig 200 000 träffar och noll vägledning. Updro granskar varje byrå innan de släpps in: verifierat organisationsnummer, dokumenterade kundcase och referenser. Bara de som håller måttet får lämna offerter.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  'Verifierat org.nr och F-skatt',
                  'Granskade kundcase',
                  'Referenser från tidigare kunder',
                  'Betygsätts efter varje uppdrag',
                ].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    className="flex items-start gap-4 p-5 rounded-xl bg-card border"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="font-medium pt-2">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* FOR AGENCIES */}
        <Section className="py-16 md:py-24">
          <div className="mx-4 md:mx-8">
            <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
              <div className="relative max-w-3xl">
                <div className="text-xs font-mono uppercase tracking-widest text-accent mb-4">
                  För byråer
                </div>
                <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-6">
                  Trött på att jaga leads?<br />
                  Låt uppdragen komma till dig.
                </h2>
                <p className="text-lg md:text-xl opacity-80 leading-relaxed mb-8 max-w-2xl">
                  Kvalificerade uppdrag från riktiga köpare med budget. Lås upp enstaka leads för <span className="font-mono">119 kr</span> eller kör obegränsat för <span className="font-mono">1 995 kr/mån</span>. Testa premium gratis i 7 dagar.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/registrera-byra">
                    <Button size="lg" className="rounded-xl px-8 py-6 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
                      Registrera din byrå
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/priser">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl px-8 py-6 text-base font-semibold bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      Se prissättning
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 font-mono text-sm opacity-70">
                  Inga bindningstider · Avsluta när du vill
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section className="py-24 md:py-32">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <div className="text-xs font-mono uppercase tracking-widest text-accent mb-3">FAQ</div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Vanliga frågor
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border rounded-xl bg-card px-5 data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left font-display text-lg py-5 hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
          </div>
        </Section>

        {/* FINAL CTA */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-accent to-accent/80 text-white">
          <div className="container max-w-3xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl md:text-6xl font-bold leading-[1.05] mb-6"
            >
              Ditt projekt förtjänar fler än en offert.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="text-lg md:text-xl opacity-90 mb-10"
            >
              Publicera gratis. Jämför i lugn och ro. Välj rätt.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              <Link to="/publicera">
                <Button
                  size="lg"
                  className="rounded-xl px-10 py-7 text-lg font-bold bg-white text-foreground hover:bg-white/90 shadow-xl"
                >
                  Kom igång på 3 minuter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage
