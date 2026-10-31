import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatPage from './ChatPage'

const mocks = vi.hoisted(() => ({
  conversations: vi.fn(), party: vi.fn(), thread: vi.fn(), markRead: vi.fn(), send: vi.fn(), error: vi.fn(),
}))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'buyer' }, profile: { role: 'buyer' } }) }))
vi.mock('@/integrations/supabase/client', () => {
  const channel = { on: () => channel, subscribe: () => channel }
  return { supabase: { channel: () => channel, removeChannel: vi.fn() } }
})
vi.mock('sonner', () => ({ toast: { error: mocks.error, success: vi.fn() } }))
vi.mock('@/lib/chat', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/chat')>()),
  loadConversations: mocks.conversations, loadChatParty: mocks.party, loadThread: mocks.thread,
  markConversationRead: mocks.markRead, sendChatMessage: mocks.send,
}))

const conversation = (otherId: string, otherName: string, unread: number) => ({
  otherId, otherName, projectId: 'p1', projectTitle: 'Ny webbplats', lastMessage: 'Hej!', lastAt: '2026-10-31T10:00:00Z', lastFromMe: false, unread,
})

beforeEach(() => {
  vi.clearAllMocks()
  Element.prototype.scrollIntoView = vi.fn()
  mocks.conversations.mockResolvedValue([conversation('agency-a', 'Acme Webb', 2), conversation('agency-b', 'Byrå Två', 0)])
  mocks.thread.mockResolvedValue([{ id: 'm1', project_id: 'p1', sender_id: 'agency-a', receiver_id: 'buyer', content: 'Har ni en deadline?', is_read: false, created_at: '2026-10-31T10:00:00Z' }])
  mocks.markRead.mockResolvedValue(undefined)
})
afterEach(cleanup)

const renderAt = (url = '/dashboard/buyer/chatt') => render(<MemoryRouter initialEntries={[url]}><ChatPage /></MemoryRouter>)

describe('chat', () => {
  it('names each agency so a buyer can tell several conversations apart', async () => {
    renderAt()
    expect(await screen.findByText('Acme Webb')).toBeInTheDocument()
    expect(screen.getByText('Byrå Två')).toBeInTheDocument()
    expect(screen.getByText('två nya')).toBeInTheDocument()
  })

  it('opens a conversation, marks it read and sends with Enter', async () => {
    mocks.send.mockResolvedValue({ id: 'm2', project_id: 'p1', sender_id: 'buyer', receiver_id: 'agency-a', content: 'Ja, i december.', is_read: false, created_at: '2026-10-31T10:05:00Z' })
    renderAt()
    fireEvent.click(await screen.findByText('Acme Webb'))
    expect(await screen.findByText('Har ni en deadline?')).toBeInTheDocument()
    await waitFor(() => expect(mocks.markRead).toHaveBeenCalledWith('buyer', 'buyer', 'p1', 'agency-a'))
    fireEvent.change(screen.getByLabelText('Ditt meddelande'), { target: { value: 'Ja, i december.' } })
    fireEvent.keyDown(screen.getByLabelText('Ditt meddelande'), { key: 'Enter' })
    expect(await screen.findByText('Ja, i december.')).toBeInTheDocument()
    expect(mocks.send).toHaveBeenCalledWith('p1', 'buyer', 'agency-a', 'Ja, i december.')
    expect(screen.getByLabelText('Ditt meddelande')).toHaveValue('')
  })

  it('keeps the text and explains when a message cannot be sent', async () => {
    mocks.send.mockRejectedValue(new Error('Meddelandet kunde inte skickas. Försök igen.'))
    renderAt()
    fireEvent.click(await screen.findByText('Acme Webb'))
    await screen.findByText('Har ni en deadline?')
    fireEvent.change(screen.getByLabelText('Ditt meddelande'), { target: { value: 'Viktig fråga' } })
    fireEvent.click(screen.getByRole('button', { name: 'Skicka meddelande' }))
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Meddelandet kunde inte skickas. Försök igen.'))
    expect(screen.getByLabelText('Ditt meddelande')).toHaveValue('Viktig fråga')
  })

  it('starts a new conversation from an offer card with the agency name', async () => {
    mocks.conversations.mockResolvedValue([])
    mocks.thread.mockResolvedValue([])
    mocks.party.mockResolvedValue({ otherName: 'Ny Byrå AB', projectTitle: 'Ny webbplats' })
    renderAt('/dashboard/buyer/chatt?project=p1&user=agency-c')
    expect(await screen.findAllByText('Ny Byrå AB')).not.toHaveLength(0)
    expect(await screen.findByText(/Skriv det första – Ny Byrå AB får en notis/)).toBeInTheDocument()
  })

  it('refuses to open a conversation with someone outside the project', async () => {
    mocks.conversations.mockResolvedValue([])
    mocks.party.mockResolvedValue(null)
    renderAt('/dashboard/buyer/chatt?project=p1&user=stranger')
    expect(await screen.findByRole('alert')).toHaveTextContent('Du kan bara chatta med beställare och byråer som är kopplade till samma uppdrag.')
  })
})
