import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ActivationChecklist from './ActivationChecklist'
import type { ActivationState } from '@/lib/supplierActivation'

const mocks = vi.hoisted(() => ({
  activation: { current: null as (ActivationState & { loading: boolean }) | null },
  auth: { current: null as Record<string, unknown> | null },
}))

vi.mock('@/hooks/useSupplierActivation', () => ({
  useSupplierActivation: () => mocks.activation.current,
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mocks.auth.current,
}))
vi.mock('@/lib/analytics', () => ({
  trackSupplierActivationViewed: vi.fn(),
  trackSupplierActivationStepCompleted: vi.fn(),
  trackSupplierActivationCompleted: vi.fn(),
}))

const step = (id: string, done: boolean, optional = false) => ({
  id,
  title: `Steg ${id}`,
  description: `Beskrivning ${id}`,
  optional,
  done,
  href: '/dashboard/supplier/profil',
  cta: 'Öppna',
})

const stateFor = (steps: ReturnType<typeof step>[]): ActivationState & { loading: boolean } => {
  const required = steps.filter(s => !s.optional)
  const doneRequired = required.filter(s => s.done).length
  return {
    steps: steps as ActivationState['steps'],
    completedRequired: doneRequired,
    requiredTotal: required.length,
    nextStep: (steps.find(s => !s.done) ?? null) as ActivationState['nextStep'],
    allRequiredDone: doneRequired === required.length,
    allDone: steps.every(s => s.done),
    loading: false,
  }
}

const authBase = {
  supplierProfile: { lead_credits: 2 },
  isOnTrial: false,
  trialLeadsLeft: 0,
  trialDaysLeft: 0,
  hasActiveSubscription: false,
}

afterEach(cleanup)

describe('ActivationChecklist', () => {
  it('renders nothing without a supplier profile', () => {
    mocks.auth.current = { ...authBase, supplierProfile: null }
    mocks.activation.current = stateFor([step('categories', false)])
    const { container } = render(<MemoryRouter><ActivationChecklist /></MemoryRouter>)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows progress and a deep link to the next step', () => {
    mocks.auth.current = authBase
    mocks.activation.current = stateFor([
      step('categories', true),
      step('profile', false),
      step('view_project', false),
      step('unlock_lead', false, true),
    ])
    render(<MemoryRouter><ActivationChecklist /></MemoryRouter>)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25')
    expect(screen.getByText(/1 av 4 steg klara/)).toBeInTheDocument()
    const cta = screen.getAllByRole('link', { name: /Öppna/ })[0]
    expect(cta).toHaveAttribute('href', '/dashboard/supplier/profil')
  })

  it('marks optional steps as frivilliga and shows remaining credits', () => {
    mocks.auth.current = authBase
    mocks.activation.current = stateFor([
      step('categories', true),
      step('profile', true),
      step('view_project', true),
      step('unlock_lead', false, true),
    ])
    render(<MemoryRouter><ActivationChecklist /></MemoryRouter>)
    expect(screen.getByText('(frivilligt)')).toBeInTheDocument()
    expect(screen.getByText(/2 upplåsningskrediter kvar/)).toBeInTheDocument()
  })

  it('shows a discreet done state when everything is complete', () => {
    mocks.auth.current = { ...authBase, hasActiveSubscription: true }
    mocks.activation.current = stateFor([
      step('categories', true),
      step('profile', true),
      step('view_project', true),
      step('unlock_lead', true, true),
    ])
    render(<MemoryRouter><ActivationChecklist /></MemoryRouter>)
    expect(screen.getByText('Klart – byrån är igång')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(screen.queryByRole('link', { name: /Öppna/ })).not.toBeInTheDocument()
  })

  it('shows trial status with correct singular form', () => {
    mocks.auth.current = { ...authBase, isOnTrial: true, trialLeadsLeft: 1, trialDaysLeft: 3 }
    mocks.activation.current = stateFor([step('categories', false)])
    render(<MemoryRouter><ActivationChecklist /></MemoryRouter>)
    expect(screen.getByText(/1 gratis lead kvar, 3 dagar kvar/)).toBeInTheDocument()
  })
})
