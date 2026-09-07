import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProjectUnlock from './ProjectUnlock'
import { readOfferDraft } from '@/lib/offerDrafts'

const mocks = vi.hoisted(() => ({
  from: vi.fn(), unlock: vi.fn(), contact: vi.fn(), submit: vi.fn(), success: vi.fn(), error: vi.fn(),
  user: { id: 'supplier' }, refresh: vi.fn(), existing: false, unlocked: false,
}))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: mocks.user, supplierProfile: { lead_credits: 3 }, refreshProfile: mocks.refresh, hasActiveSubscription: false }) }))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mocks.from } }))
vi.mock('@/lib/marketplaceActions', () => ({
  getUnlockedProjectContact: mocks.contact, unlockProject: mocks.unlock, submitProjectOffer: mocks.submit,
  OFFER_ATTACHMENT_ACCEPT: '.pdf', OFFER_ATTACHMENT_BUCKET: 'offer-attachments',
  uploadOfferAttachment: vi.fn(), validateOfferAttachment: vi.fn(),
}))
vi.mock('@/lib/analytics', () => ({ trackLeadViewed: vi.fn(), trackLeadUnlocked: vi.fn(), trackLeadUnlockStarted: vi.fn(), trackOfferSubmitted: vi.fn(), trackFirstOfferReceived: vi.fn() }))
vi.mock('@/components/supplier/LeadRefundDialog', () => ({ default: () => null }))
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error, info: vi.fn() } }))

const renderPage = () => render(<MemoryRouter initialEntries={['/uppdrag/project']}><Routes><Route path="/uppdrag/:id" element={<ProjectUnlock />} /></Routes></MemoryRouter>)
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  mocks.existing = false
  mocks.unlocked = false
  mocks.refresh.mockResolvedValue(undefined)
  mocks.from.mockImplementation((table: string) => {
    const chain: Record<string, any> = {}
    const result = () => Promise.resolve({ data: table === 'projects' ? {
      id: 'project', title: 'Testuppdrag', description: 'Beskrivning av ett syntetiskt testuppdrag.', category: 'Webbutveckling', status: 'active', offer_count: 0, max_offers: 3, created_at: '2026-09-07T12:00:00Z',
    } : table === 'unlocked_leads' ? mocks.unlocked ? { id: 'unlock' } : null : mocks.existing ? { id: 'offer' } : null, error: null })
    chain.select = chain.eq = () => chain
    chain.single = chain.maybeSingle = result
    return chain
  })
})
afterEach(cleanup)

describe('supplier offer flow', () => {
  it('restores an account draft and submits only after the preview is confirmed', async () => {
    mocks.unlocked = true
    mocks.contact.mockResolvedValue({ full_name: 'Testkund' })
    mocks.submit.mockResolvedValue({})
    const first = renderPage()
    fireEvent.change(await screen.findByLabelText('Offert-titel *'), { target: { value: 'Mitt förslag' } })
    fireEvent.change(screen.getByLabelText('Beskrivning *'), { target: { value: 'Fem sidor med mobilanpassning och överlämning.' } })
    fireEvent.change(screen.getByLabelText('Totalpris (kr) *'), { target: { value: '24000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Spara utkast' }))
    expect(mocks.submit).not.toHaveBeenCalled()
    first.unmount(); renderPage()
    expect(await screen.findByLabelText('Offert-titel *')).toHaveValue('Mitt förslag')
    fireEvent.click(screen.getByRole('button', { name: 'Granska offert →' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('24 000 kr')
    expect(mocks.submit).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Fortsätt redigera' }))
    expect(screen.getByLabelText('Beskrivning *')).toHaveValue('Fem sidor med mobilanpassning och överlämning.')
    fireEvent.click(screen.getByRole('button', { name: 'Granska offert →' }))
    fireEvent.click(screen.getByRole('button', { name: 'Skicka offert' }))
    await waitFor(() => expect(mocks.submit).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(readOfferDraft('supplier', 'project')).toBeNull())
  })
  it('keeps a successful unlock even if loading the contact details fails', async () => {
    mocks.unlock.mockResolvedValue({ already_unlocked: false, credits_left: 2 })
    mocks.contact.mockRejectedValue(new Error('Network failed'))
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Lås upp \(/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Bekräfta' }))
    await waitFor(() => expect(mocks.success).toHaveBeenCalledWith('Uppdraget är upplåst.'))
    expect(await screen.findByText('Uppdraget är upplåst, men kontaktuppgifterna kunde inte läsas.')).toBeInTheDocument()
    expect(mocks.error).not.toHaveBeenCalled()
    mocks.contact.mockResolvedValue({ full_name: 'Testkund', company_name: 'Test AB', email: 'qa@example.invalid', phone: null })
    fireEvent.click(screen.getByRole('button', { name: 'Hämta kontaktuppgifterna igen' }))
    expect(await screen.findByText('qa@example.invalid')).toBeInTheDocument()
    expect(mocks.unlock).toHaveBeenCalledTimes(1)
  })
  it('shows the next step instead of a duplicate offer form', async () => {
    mocks.existing = true
    mocks.unlocked = true
    mocks.contact.mockResolvedValue({ full_name: 'Testkund', company_name: null, email: null, phone: null })
    renderPage()
    expect(await screen.findByText('Din offert är redan skickad')).toBeInTheDocument()
    expect(screen.queryByLabelText('Offert-titel *')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Öppna Mina offerter' })).toHaveAttribute('href', '/dashboard/supplier/offerter')
  })
})
