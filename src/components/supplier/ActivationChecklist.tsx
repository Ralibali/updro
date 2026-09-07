import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const ActivationChecklist = () => {
  const { profile, supplierProfile } = useAuth()
  if (!supplierProfile) return null
  const items = [
    { title: 'Beskriv byrån', done: Boolean((supplierProfile.contact_name || profile?.full_name) && supplierProfile.bio?.trim().length >= 40) },
    { title: 'Lägg till organisationsnummer', done: Boolean(supplierProfile.org_number?.trim().length >= 8) },
    { title: 'Välj era tjänstekategorier', done: Boolean(supplierProfile.categories?.length) },
    { title: 'Visa webbplats, logotyp eller arbetsprover', done: Boolean(supplierProfile.portfolio_urls?.length || supplierProfile.website_url?.trim() || supplierProfile.logo_url) },
    { title: 'Ange kontaktmejl', done: Boolean(supplierProfile.contact_email && /.+@.+\..+/.test(supplierProfile.contact_email)) },
  ]
  const next = items.find(item => !item.done)
  if (!next) return null
  const completed = items.filter(item => item.done).length
  return <section className="rounded-2xl border bg-card p-4 sm:p-5" aria-label="Din byråprofil">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-display font-semibold">Gör byrån lättare att välja</h2><p className="mt-1 text-sm text-muted-foreground">Nästa steg: {next.title.toLocaleLowerCase('sv-SE')}.</p></div>
      <Button asChild variant="outline" size="sm"><Link to="/dashboard/supplier/profil">Komplettera profilen <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
    </div>
    <details className="mt-3 text-sm"><summary className="cursor-pointer text-muted-foreground">Visa checklistan · {completed} av {items.length} klara</summary>
      <ul className="mt-3 space-y-2">{items.map(item => <li key={item.title} className="flex items-center gap-2">
        {item.done ? <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Klart" /> : <span className="h-4 w-4 shrink-0 rounded-full border" aria-label="Återstår" />}
        <span className={item.done ? 'text-muted-foreground' : ''}>{item.title}</span>
      </li>)}</ul>
    </details>
  </section>
}
export default ActivationChecklist
