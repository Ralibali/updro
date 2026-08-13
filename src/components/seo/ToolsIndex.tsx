import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS } from '@/lib/seoTools'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { ArrowRight, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react'
import SEOLeadCTA from './SEOLeadCTA'
import { setSEOMeta } from '@/lib/seoHelpers'

const ACTIVE_TOOL_SLUGS = new Set(['hemsida-pris-kalkylator'])

const ToolsIndex = () => {
  const activeTools = TOOLS.filter(tool => ACTIVE_TOOL_SLUGS.has(tool.slug))

  useEffect(() => {
    setSEOMeta({
      title: 'Gratis kalkylatorer för digitala projekt | Updro',
      description: 'Använd Updros färdiga kalkylatorer för att planera och prissätta digitala projekt innan du jämför offerter.',
      canonical: 'https://updro.se/verktyg',
    })
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Brödsmulor">
          <Link to="/" className="hover:text-foreground">Hem</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Verktyg</span>
        </nav>
      </div>

      <section className="container py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gratis · ingen registrering</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight">Verktyg som faktiskt hjälper dig att beställa bättre</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Vi publicerar bara verktyg här när de är färdiga att använda. Inga demoresultat och inga formulär som låtsas vara analysverktyg.
          </p>
        </div>
      </section>

      <section className="container pb-16">
        <div className="grid sm:grid-cols-2 gap-6">
          {activeTools.map(tool => (
            <Link key={tool.slug} to={`/verktyg/${tool.slug}`} className="relative bg-card border-2 border-foreground rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] transition-all group">
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Färdigt
              </span>
              <Calculator className="h-8 w-8 text-primary mb-5" />
              <h2 className="font-display text-xl font-bold group-hover:text-primary transition-colors pr-20">{tool.h1}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{tool.metaDesc}</p>
              <span className="text-sm font-semibold text-primary mt-5 inline-flex items-center gap-1">Använd verktyget <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}

          <div className="rounded-2xl border bg-muted/30 p-6 flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Behöver du ett riktigt pris?</p>
            <h2 className="mt-2 font-display text-xl font-bold">Kalkyl först. Offerter när du är redo.</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Använd kalkylatorn för ett första riktvärde och beskriv sedan projektet en gång för att jämföra högst tre relevanta offerter.</p>
            <Link to="/publicera" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline underline-offset-4">Beskriv projektet gratis <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <SEOLeadCTA categoryName="digitala tjänster" />
      <Footer />
    </div>
  )
}

export default ToolsIndex
