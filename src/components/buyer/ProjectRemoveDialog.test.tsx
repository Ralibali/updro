import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import ProjectRemoveDialog from './ProjectRemoveDialog'

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
const handlers = () => ({ onOpenChange: vi.fn(), onDeleted: vi.fn(), onClosed: vi.fn() })

beforeEach(() => { vi.clearAllMocks(); mocks.deleteResult = { error: null }; mocks.close.mockResolvedValue(undefined) })
afterEach(cleanup)

describe('removing a buyer project', () => {
  it('closes instead of deleting once agencies have answered', async () => {
    const props = handlers()
    render(<ProjectRemoveDialog project={project} hasOffers {...props} />)
    expect(screen.getByText('Stäng uppdraget i stället?')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ta bort' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Stäng uppdraget' }))
    await waitFor(() => expect(props.onClosed).toHaveBeenCalledWith('p1'))
    expect(mocks.close).toHaveBeenCalledWith('p1')
  })

  it('deletes an untouched project', async () => {
    const props = handlers()
    render(<ProjectRemoveDialog project={project} hasOffers={false} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ta bort' }))
    await waitFor(() => expect(props.onDeleted).toHaveBeenCalledWith('p1'))
  })

  it('switches to closing when the database refuses because an agency unlocked', async () => {
    mocks.deleteResult = { error: { message: 'Byråer har redan låst upp eller svarat på uppdraget, så det kan inte raderas.' } }
    const props = handlers()
    render(<ProjectRemoveDialog project={project} hasOffers={false} {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ta bort' }))
    expect(await screen.findByText('Stäng uppdraget i stället?')).toBeInTheDocument()
    expect(props.onDeleted).not.toHaveBeenCalled()
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('explains that a closed project with answers is kept', () => {
    render(<ProjectRemoveDialog project={{ ...project, status: 'closed' }} hasOffers {...handlers()} />)
    expect(screen.getByText('Uppdraget sparas')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Stäng uppdraget' })).not.toBeInTheDocument()
  })
})
