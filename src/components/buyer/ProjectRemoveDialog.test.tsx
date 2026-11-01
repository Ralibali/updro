import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProjectRemoveDialog from './ProjectRemoveDialog'
import { removeMode, type OfferState } from '@/lib/projectRemoval'

const mocks = vi.hoisted(() => ({ deleteResult: { error: null as null | { message: string } }, close: vi.fn(), success: vi.fn(), error: vi.fn() }))
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => {
    const chain: Record<string, unknown> = {}
    chain.delete = chain.eq = chain.select = () => chain
    chain.single = () => Promise.resolve(mocks.deleteResult)
    return chain
  } },
}))
vi.mock('@/lib/marketplaceActions', () => ({ closeProjectWithoutOffer: mocks.close }))
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }))

const project = { id: 'p1', title: 'Ny webbplats', status: 'active' }
const none: OfferState = { total: 0, pending: 0, accepted: false }
const waiting: OfferState = { total: 2, pending: 2, accepted: false }
const handlers = () => ({ onOpenChange: vi.fn(), onDeleted: vi.fn(), onClosed: vi.fn() })
const renderDialog = (props: Parameters<typeof ProjectRemoveDialog>[0]) =>
  render(<MemoryRouter><ProjectRemoveDialog {...props} /></MemoryRouter>)

beforeEach(() => { vi.clearAllMocks(); mocks.deleteResult = { error: null }; mocks.close.mockResolvedValue(undefined) })
afterEach(cleanup)

describe('removing a buyer project', () => {
  it('closes instead of deleting once agencies have answered', async () => {
    const props = handlers()
    renderDialog({ project, offers: waiting, ...props })
    expect(screen.getByText('Stäng uppdraget i stället?')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ta bort' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Stäng uppdraget' }))
    await waitFor(() => expect(props.onClosed).toHaveBeenCalledWith('p1'))
    expect(mocks.close).toHaveBeenCalledWith('p1')
  })

  it('deletes an untouched project', async () => {
    const props = handlers()
    renderDialog({ project, offers: none, ...props })
    fireEvent.click(screen.getByRole('button', { name: 'Ta bort' }))
    await waitFor(() => expect(props.onDeleted).toHaveBeenCalledWith('p1'))
  })

  it('switches to closing when the database refuses because an agency unlocked', async () => {
    mocks.deleteResult = { error: { message: 'Byråer har redan låst upp eller svarat på uppdraget, så det kan inte raderas.' } }
    const props = handlers()
    renderDialog({ project, offers: none, ...props })
    fireEvent.click(screen.getByRole('button', { name: 'Ta bort' }))
    expect(await screen.findByText('Stäng uppdraget i stället?')).toBeInTheDocument()
    expect(props.onDeleted).not.toHaveBeenCalled()
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('lets the buyer finish a full project without choosing, so agencies stop waiting', async () => {
    const props = handlers()
    renderDialog({ project: { ...project, status: 'closed' }, offers: { total: 3, pending: 3, accepted: false }, ...props })
    expect(screen.getByText('Avsluta utan att välja?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Avsluta utan att välja' }))
    await waitFor(() => expect(mocks.close).toHaveBeenCalledWith('p1'))
  })

  it('sends the buyer to the project page when the list cannot tell the offer state', () => {
    renderDialog({ project: { ...project, status: 'closed' }, offers: { total: 3, pending: null, accepted: null }, ...handlers() })
    expect(screen.getByRole('link', { name: 'Öppna uppdraget' })).toHaveAttribute('href', '/dashboard/buyer/uppdrag/p1')
  })

  it('keeps a project with an agreed agency', () => {
    expect(removeMode(project, { total: 2, pending: 0, accepted: true })).toBe('kept')
    expect(removeMode({ ...project, status: 'closed' }, { total: 2, pending: 0, accepted: false })).toBe('kept')
    renderDialog({ project: { ...project, status: 'closed' }, offers: { total: 2, pending: 0, accepted: true }, ...handlers() })
    expect(screen.getByText('Uppdraget sparas')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Stäng uppdraget|Avsluta/ })).not.toBeInTheDocument()
  })
})
