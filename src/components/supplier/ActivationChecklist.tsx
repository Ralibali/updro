import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Circle, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

type ChecklistItem = {
  id: string
  title: string
  description: string
  done: boolean
  href: string
  cta: string
}

const ActivationChecklist = () => {
  const { user, profile, supplierProfile } = useAuth()
  const [firstUnlockDone, setFirstUnlockDone] = useState<boolean | null>(null)
  const [firstOfferDone, setFirstOfferDone] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const [{ count: unlockCount }, { count: offerCount }] = await Promise.all([
        supabase.from('unlocked_leads').select('id', { count: 'exact', head: true }).eq('supplier_id', user.id),
        supabase.from('offers').select('id', { count: 'exact', head: true }).eq('supplier_id', user.id),
      ])
      if (cancelled) return
      setFirstUnlockDone((unlockCount ?? 0) > 0)
      setFirstOfferDone((offerCount ?? 0) > 0)
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!supplierProfile) return null

  const hasProfileInfo = Boolean(
    (supplierProfile.contact_name || profile?.full_name) &&
    (supplierProfile.bio && supplierProfile.bio.trim().length >= 40)
  )
  const hasCompanyInfo = Boolean(supplierProfile.org_number && supplierProfile.org_number.trim().length >= 8)
  const hasCategories = Array.isArray(supplierProfile.categories) && supplierProfile.categories.length > 0
  const hasPortfolio = Boolean(
    (Array.isArray(supplierProfile.portfolio_urls) && supplierProfile.portfolio_urls.length > 0) ||
    (supplierProfile.website_url && supplierProfile.website_url.trim().length > 0) ||
    supplierProfile.logo_url
  )
  const hasNotificationEmail = Boolean(supplierProfile.contact_email && /.+@.+\..+/.test(supplierProfile.contact_email))

  const items: ChecklistItem[] = [
    {
      id: 'profile',
      title: 'Profilinformation',
      description: 'Kontaktperson och en beskrivande bio (minst 40 tecken).',
      done: hasProfileInfo,
      href: '/dashboard/profil',
      cta: 'Fyll i profil',
    },
    {
      id: 'company',
      title: 'Företagsuppgifter',
      description: 'Organisationsnummer så vi kan verifiera byrån.',
      done: hasCompanyInfo,
      href: '/dashboard/profil',
      cta: 'Lägg till org.nr',
    },
    {
      id: 'categories',
      title: 'Valda kategorier',
      description: 'Välj vilka uppdrag ni vill matchas mot.',
      done: hasCategories,
      href: '/dashboard/profil',
      cta: 'Välj kategorier',
    },
    {
      id: 'portfolio',
      title: 'Presentation och portfolio',
      description: 'Logotyp, webbplats eller portfolio-länkar stärker offerterna.',
      done: hasPortfolio,
      href: '/dashboard/profil',
      cta: 'Lägg till portfolio',
    },
    {
      id: 'notifications',
      title: 'Notifieringar',
      description: 'Kontakt-e-post för leadaviseringar.',
      done: hasNotificationEmail,
      href: '/dashboard/profil',
      cta: 'Ange e-post',
    },
    {
      id: 'first_unlock',
      title: 'Första upplåsning',
      description: 'Lås upp ett matchande uppdrag för att se briefen och kontakten.',
      done: firstUnlockDone === true,
      href: '/dashboard/supplier/uppdrag',
      cta: 'Bläddra bland uppdrag',
    },
    {
      id: 'first_offer',
      title: 'Första offert',
      description: 'Skicka in er första offert till en beställare.',
      done: firstOfferDone === true,
      href: '/dashboard/supplier/uppdrag',
      cta: 'Skicka offert',
    },
  ]

  const completed = items.filter(i => i.done).length
  const percent = Math.round((completed / items.length) * 100)
  const nextItem = items.find(i => !i.done)

  if (completed === items.length) return null

  return (
    <section className="mb-8 rounded-2xl border bg-card p-5" aria-labelledby="activation-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div>
          <h2 id="activation-heading" className="font-display text-lg font-semibold">Aktivera ert byråkonto</h2>
          <p className="text-sm text-muted-foreground">{completed} av {items.length} steg klara</p>
        </div>
        <span className="font-display text-2xl font-bold text-primary tabular-nums">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2 mb-4" aria-label={`${percent}% av aktiveringen klar`} />

      {nextItem && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Nästa steg</p>
          <p className="font-semibold text-foreground">{nextItem.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{nextItem.description}</p>
          <Link to={nextItem.href} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            {nextItem.cta} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-start gap-3 text-sm">
            {item.done ? (
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/40" />
            )}
            <div className="flex-1">
              <span className={item.done ? 'text-muted-foreground line-through' : 'font-medium text-foreground'}>
                {item.title}
              </span>
              {!item.done && (
                <span className="ml-2 text-xs text-muted-foreground">— {item.description}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ActivationChecklist
