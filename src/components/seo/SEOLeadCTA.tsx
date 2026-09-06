import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileCheck, Users, UserRound } from 'lucide-react'
import { seoLeadPath } from '@/lib/seoLeadPath'

const SEOLeadCTA = ({ categoryName, category }: { categoryName: string; category?: string }) => (
  <section className="bg-primary/5 border-y">
    <div className="container py-12 md:py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          Jämför offerter för {categoryName.toLowerCase()} – kostnadsfritt
        </h2>
        <p className="mt-3 text-muted-foreground text-lg">
          Beskriv behovet en gång. Updro granskar briefen och högst tre relevanta byråer kan lämna offert. Du väljer själv om du vill gå vidare.
        </p>
        <Link to={seoLeadPath(category || categoryName)}>
          <Button size="lg" className="mt-6 rounded-xl shadow-blue text-base px-8">
            Beskriv projektet gratis <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><FileCheck className="h-4 w-4 text-primary" /> Briefen granskas</span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-amber" /> Högst tre byråer</span>
          <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4 text-accent" /> Inget konto krävs för att börja</span>
        </div>
      </div>
    </div>
  </section>
)

export default SEOLeadCTA
