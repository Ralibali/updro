import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, FileText } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { BRIEF_TEMPLATES } from '@/lib/briefTemplates'

const MallarIndex = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1">
      <section className="border-b bg-muted/30">
        <div className="container max-w-5xl py-14 sm:py-20">
          <p className="text-sm font-semibold text-primary mb-3">Gratis mallar för bättre byråköp</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl">Skriv en bättre brief innan du ber om offert</h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">Välj en mall, svara på de frågor som faktiskt påverkar scope och jämför sedan byråer utifrån samma underlag. Inga kontaktuppgifter krävs för att bygga briefen.</p>
          <div className="flex flex-wrap gap-4 mt-7 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 8 kostnadsfria mallar</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Redigerbar brief</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Kopiera eller ladda ner</span>
          </div>
        </div>
      </section>

      <section className="container max-w-5xl py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-5">
          {BRIEF_TEMPLATES.map(template => (
            <article key={template.slug} className="rounded-2xl border bg-card p-6 flex flex-col shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><FileText className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{template.categoryName}</p>
                  <h2 className="text-xl font-bold mt-1">{template.title}</h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 flex-1">{template.description}</p>
              <Link to={`/mallar/${template.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                Öppna mallen <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-primary/5 border p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Har du redan ett tydligt underlag?</h2>
            <p className="text-muted-foreground mt-2">Beskriv projektet direkt och låt högst tre relevanta byråer lämna offert.</p>
          </div>
          <Link to="/publicera"><Button className="rounded-xl min-h-12 px-6">Starta förfrågan <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>
    </main>
    <Footer />
  </div>
)

export default MallarIndex
