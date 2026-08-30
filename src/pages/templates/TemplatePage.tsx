import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BriefBuilder from '@/components/templates/BriefBuilder'
import { getBriefTemplate } from '@/lib/briefTemplates'

const TemplatePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const template = getBriefTemplate(slug)
  if (!template) return <Navigate to="/mallar" replace />

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container max-w-4xl py-8 sm:py-12">
          <Link to="/mallar" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-7">
            <ArrowLeft className="h-4 w-4" /> Alla mallar
          </Link>

          <header className="max-w-3xl mb-10">
            <p className="text-sm font-semibold text-primary mb-2">{template.categoryName}</p>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">{template.title}</h1>
            <p className="text-lg text-muted-foreground mt-5">{template.intro}</p>
          </header>

          <div className="grid lg:grid-cols-[1fr_260px] gap-8 items-start mb-10">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="text-xl font-bold">Det här bör briefen tydliggöra</h2>
              <ul className="mt-4 space-y-3">
                {template.checklist.map(item => (
                  <li key={item} className="flex gap-3 text-sm"><CheckCircle2 className="h-5 w-5 shrink-0 text-primary" /><span>{item}</span></li>
                ))}
              </ul>
            </div>
            <aside className="rounded-2xl border p-5 bg-muted/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Läs också</p>
              <div className="mt-3 space-y-3">
                {template.links.map(link => (
                  <Link key={link.href} to={link.href} className="flex items-center justify-between gap-2 text-sm font-medium hover:text-primary">
                    {link.label}<ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                ))}
              </div>
            </aside>
          </div>

          <BriefBuilder template={template} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TemplatePage
