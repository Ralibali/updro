import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MatchedProjectsPage from './MatchedProjectsPage'

const mocks = vi.hoisted(() => ({ fail: false, from: vi.fn(), user: { id: 'supplier' } }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: mocks.user, supplierProfile: { categories: ['Webbutveckling'], lead_credits: 2 }, profile: null }) }))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }))
vi.mock('@/components/TrialBanner', () => ({ default: () => null }))
const project = { id: 'open', title: 'Ny webbplats', description: 'En beskrivning av webbplatsen', category: 'Webbutveckling', budget_range: 'small', city: 'Malmö', status: 'active', offer_count: 1, max_offers: 3, created_at: '2026-09-07T12:00:00Z', buyer_id: 'buyer' }
beforeEach(() => {
  vi.clearAllMocks(); mocks.fail = false
  mocks.from.mockImplementation((table: string) => {
    const chain: Record<string, any> = {}
    chain.select = chain.eq = chain.order = chain.limit = () => chain
    chain.then = (resolve: (value: unknown) => void) => Promise.resolve(resolve({
      data: mocks.fail ? null : table === 'projects' ? [project, { ...project, id: 'full', title: 'Fullt uppdrag', offer_count: 3 }] : [{ project_id: 'closed', projects: { ...project, id: 'closed', title: 'Tidigare upplåst uppdrag', status: 'closed' } }],
      error: mocks.fail ? { message: 'Network failed' } : null,
    }))
    return chain
  })
})
afterEach(cleanup)
const open = () => render(<MemoryRouter><MatchedProjectsPage /></MemoryRouter>)
describe('browsing supplier projects', () => {
  it('lets suppliers inspect available projects and keeps closed unlocked projects accessible', async () => {
    open()
    expect(await screen.findByRole('link', { name: 'Ny webbplats' })).toHaveAttribute('href', '/dashboard/supplier/uppdrag/open')
    expect(screen.queryByText('Fullt uppdrag')).not.toBeInTheDocument()
    expect(screen.queryByText('Tidigare upplåst uppdrag')).not.toBeInTheDocument()
    expect(screen.getByText('2 offertplatser kvar')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Upplåsta' }))
    expect(screen.getByRole('link', { name: 'Kontakt och offert' })).toHaveAttribute('href', '/dashboard/supplier/uppdrag/closed')
    expect(screen.getByText('Tar inte emot fler offerter')).toBeInTheDocument()
  })
  it('searches the current selection and resets an empty search', async () => {
    open(); await screen.findByText('Ny webbplats')
    fireEvent.change(screen.getByLabelText('Sök uppdrag'), { target: { value: 'Saknas helt' } })
    expect(screen.queryByRole('link', { name: 'Ny webbplats' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Visa alla uppdrag' }))
    expect(screen.getByRole('link', { name: 'Ny webbplats' })).toBeInTheDocument()
  })
  it('distinguishes a read failure from no projects and offers recovery', async () => {
    mocks.fail = true; open()
    expect(await screen.findByRole('alert')).toHaveTextContent('Uppdragen kunde inte hämtas')
    expect(screen.queryByText('Inga uppdrag i urvalet just nu')).not.toBeInTheDocument()
    mocks.fail = false; fireEvent.click(screen.getByRole('button', { name: 'Försök igen' }))
    expect(await screen.findByRole('link', { name: 'Ny webbplats' })).toBeInTheDocument()
  })
})
