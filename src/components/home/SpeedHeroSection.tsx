import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clock3, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SpeedHeroSection = () => (
  <section className="bg-hero-gradient py-16 md:py-24">
    <div className="container grid items-center gap-10 md:grid-cols-2">
      <div>
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Tre handplockade offerter. Inom 24 timmar. Gratis.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Beskriv ditt projekt så matchar Updro dig med verifierade svenska byråer. Max tre relevanta offerter, noga utvalda och enkla att jämföra.
        </p>
        <Link to="/publicera" className="mt-8 inline-block">
          <Button size="lg" className="rounded-xl px-7">Starta gratis <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {['100% gratis', 'Verifierade byråer', 'Högst 3 offerter'].map((item) => <span key={item} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-accent" />{item}</span>)}
        </div>
      </div>
      <div className="rounded-3xl border bg-card p-7 shadow-xl">
        <div className="flex gap-3"><Clock3 className="h-6 w-6 text-primary" /><div><h2 className="font-display text-xl font-bold">Första offerten inom 24 timmar</h2><p className="mt-1 text-sm text-muted-foreground">Annars prioriterar vi uppdraget manuellt.</p></div></div>
        <div className="mt-6 flex gap-3 border-t pt-6"><ShieldCheck className="h-6 w-6 text-primary" /><div><h2 className="font-display text-xl font-bold">Tryggare byråval</h2><p className="mt-1 text-sm text-muted-foreground">Företagsuppgifter verifieras innan byrån får låsa upp leads.</p></div></div>
      </div>
    </div>
  </section>
)

export default SpeedHeroSection
