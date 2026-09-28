import { useLocation } from 'react-router-dom'
import { FileCheck, Users, UserRound } from 'lucide-react'
import { resolveSeoLeadCategory } from '@/lib/seoLeadPath'
import InlineBriefForm from '@/components/shared/InlineBriefForm'

const SEOLeadCTA = ({ categoryName, category }: { categoryName: string; category?: string }) => {
  const { pathname } = useLocation()
  return (
    <section className="bg-surface-alt border-y">
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-medium">
            Jämför offerter för {categoryName.toLowerCase()} – kostnadsfritt
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Beskriv behovet en gång. Updro granskar briefen och högst tre relevanta byråer kan lämna offert. Du väljer själv om du vill gå vidare.
          </p>
          <InlineBriefForm
            className="mt-6"
            category={resolveSeoLeadCategory(category || categoryName)}
            source={`seo_cta:${pathname}`}
            placeholder={`Beskriv ditt behov inom ${categoryName.toLowerCase()} – mål, bransch och ungefärlig budget…`}
          />
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><FileCheck className="h-4 w-4 text-primary" /> Briefen granskas</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-brand-amber" /> Högst tre byråer</span>
            <span className="flex items-center gap-1.5"><UserRound className="h-4 w-4 text-accent" /> Inget konto krävs för att börja</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SEOLeadCTA
