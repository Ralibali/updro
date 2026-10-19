import type { Profile, SupplierProfile } from '@/types'
import { readBrowserStorage, writeBrowserStorage } from '@/lib/browserStorage'

/** localStorage-flagga som sätts när byrån öppnat minst ett uppdrag. */
export const VIEWED_PROJECT_STORAGE_KEY = 'updro:activation:viewed_project'

export type ActivationStepId =
  | 'categories'
  | 'profile'
  | 'view_project'
  | 'unlock_lead'
  | 'send_offer'

export interface ActivationStep {
  id: ActivationStepId
  title: string
  description: string
  /** Obligatoriska steg krävs för en komplett byråprofil; frivilliga steg kostar eller beror på marknadens utbud. */
  optional: boolean
  done: boolean
  href: string
  cta: string
}

export interface ActivationInput {
  profile: Pick<Profile, 'full_name'> | null
  supplierProfile: Pick<
    SupplierProfile,
    'contact_name' | 'bio' | 'org_number' | 'categories' | 'portfolio_urls' | 'website_url' | 'logo_url' | 'contact_email'
  > | null
  /** Sann när byrån öppnat minst ett uppdrag (lokal signal, ingen databasfråga). */
  hasViewedProject: boolean
  unlockedLeadCount: number
  offerCount: number
}

export interface ActivationState {
  steps: ActivationStep[]
  completedRequired: number
  requiredTotal: number
  nextStep: ActivationStep | null
  allRequiredDone: boolean
  allDone: boolean
}

const EMAIL_RE = /.+@.+\..+/

export const computeActivationSteps = (input: ActivationInput): ActivationState => {
  const sp = input.supplierProfile
  const steps: ActivationStep[] = [
    {
      id: 'categories',
      title: 'Välj era tjänstekategorier',
      description: 'Kategorierna styr vilka uppdrag som matchas till byrån.',
      optional: false,
      done: Boolean(sp?.categories?.length),
      href: '/dashboard/supplier/profil',
      cta: 'Välj kategorier',
    },
    {
      id: 'profile',
      title: 'Gör byråprofilen komplett',
      description: 'Beskrivning, kontaktmejl och organisationsnummer gör byrån lättare att välja.',
      optional: false,
      done: Boolean(
        (sp?.contact_name || input.profile?.full_name) &&
        (sp?.bio?.trim().length ?? 0) >= 40 &&
        sp?.contact_email && EMAIL_RE.test(sp.contact_email) &&
        (sp?.org_number?.trim().length ?? 0) >= 8,
      ),
      href: '/dashboard/supplier/profil',
      cta: 'Komplettera profilen',
    },
    {
      id: 'view_project',
      title: 'Titta på ett aktuellt uppdrag',
      description: 'Läs en brief och budget innan du bestämmer dig för att svara.',
      optional: false,
      done: input.hasViewedProject,
      href: '/dashboard/supplier/uppdrag',
      cta: 'Hitta uppdrag',
    },
    {
      id: 'unlock_lead',
      title: 'Lås upp din första lead',
      description: 'Upplåsning visar beställarens kontaktuppgifter. Gör det när du hittat ett uppdrag du vill svara på.',
      optional: true,
      done: input.unlockedLeadCount > 0,
      href: '/dashboard/supplier/uppdrag',
      cta: 'Se uppdrag',
    },
    {
      id: 'send_offer',
      title: 'Skicka din första offert',
      description: 'En offert skickas efter att du låst upp kontakten med beställaren.',
      optional: true,
      done: input.offerCount > 0,
      href: '/dashboard/supplier/offerter',
      cta: 'Mina offerter',
    },
  ]
  const required = steps.filter(s => !s.optional)
  const completedRequired = required.filter(s => s.done).length
  const nextStep = steps.find(s => !s.done) ?? null
  return {
    steps,
    completedRequired,
    requiredTotal: required.length,
    nextStep,
    allRequiredDone: completedRequired === required.length,
    allDone: steps.every(s => s.done),
  }
}

export const readViewedProjectFlag = (): boolean =>
  readBrowserStorage('localStorage', VIEWED_PROJECT_STORAGE_KEY) === '1'

export const markViewedProject = (): void => {
  writeBrowserStorage('localStorage', VIEWED_PROJECT_STORAGE_KEY, '1')
}
