import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SupplierDashboard from './SupplierDashboard'

const mocks = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'supplier' },
    profile: { company_name: 'Testbyrån' },
    supplierProfile: { categories: ['Webbutveckling'], lead_credits: 3 },
    hasActiveSubscription: false,
  }),
}))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }))
vi.mock('@/components/TrialBanner', () => ({ default: () => <p>Provperiod aktiv</p> }))
vi.mock('@/components/supplier/SupplierNotificationsList', () => ({ default: () => null }))
vi.mock('@/components/shared/PushNotificationCard', () => ({ default: () => null }))
vi.mock('@/components/supplier/ActivationChecklist', () => ({ default: () => null }))

const project = { id: 'new', title: 'Ny webbplats', description: 'Beskrivning', category: 'Webbutveckling', budget_range: 'unknown', city: 'Malmö', status: 'active', offer_count: 0, max_offers: 3, created_at: '2026-10-01T12:00:00Z', buyer_id: 'buyer' }
const rows: Record<string, unknown[]> = {
  projects: [
    project,
    { ...project, id: 'answered', title: 'Redan besvarat uppdrag' },
    { ...project, id: 'unlocked', title: 'Upplåst uppdrag' },
  ],
  offers: [{ status: 'pending', project_id: 'answered' }],
  unlocked_leads: [{ project_id: 'answered' }, { project_id: 'unlocked' }],
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.from.mockImplementation((table: string) => {
    const chain: Record<string, any> = {}
    chain.select = chain.eq = chain.order = chain.limit = chain.in = () => chain
    chain.then = (resolve: (value: unknown) => void) => Promise.resolve(resolve({ data: rows[table] || [], error: null }))
    return chain
  })
})
afterEach(cleanup)

describe('supplier dashboard', () => {
  it('shows trial status without opening the account section', () => {
    render(<MemoryRouter><SupplierDashboard /></MemoryRouter>)
    expect(screen.getByText('Provperiod aktiv')).toBeVisible()
  })

  it('hides projects the agency already answered and nudges unlocked ones toward an offer', async () => {
    render(<MemoryRouter><SupplierDashboard /></MemoryRouter>)
    expect(await screen.findByText('Ny webbplats')).toBeInTheDocument()
    expect(screen.queryByText('Redan besvarat uppdrag')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Upplåst uppdrag/ })).toHaveTextContent('Upplåst · skicka offert')
    expect(screen.getByRole('link', { name: /Ny webbplats/ })).toHaveTextContent('Visa uppdrag')
  })
})
