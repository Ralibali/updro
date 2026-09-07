import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import AgreementPanel from './AgreementPanel'
import { buildDefaultAgreementContent } from '@/lib/agreements'
const m = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  notification: vi.fn(),
  save: vi.fn(),
  loadError: false,
  raw: {} as unknown,
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'buyer' } }),
}))
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: m.from },
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))
beforeEach(() => {
  vi.clearAllMocks()
  m.loadError = false
  m.raw = {
    ...buildDefaultAgreementContent(
      { title: 'Testuppdrag' },
      { title: 'Film', description: 'Tre filmer', price: 5000 },
      'Testbeställare',
      'Testbyrå'
    ),
    buyer_confirmed_at: '2026-09-07T10:00:00Z',
  }
  m.save.mockResolvedValue({
    data: { id: 'agreement', content: m.raw },
    error: null,
  })
  m.notification.mockResolvedValue({ error: null })
  m.from.mockImplementation((table) => {
    let writing = false
    const builder = {
      select: () => builder,
      eq: (...args: unknown[]) => {
        m.eq(...args)
        return builder
      },
      update: (data: unknown) => {
        writing = true
        m.update(data)
        return builder
      },
      insert: m.notification,
      maybeSingle: async () => {
        if (table === 'project_agreements')
          return writing
            ? m.save()
            : {
                data: { id: 'agreement', content: m.raw },
                error: m.loadError ? { message: 'failed' } : null,
              }
        if (table === 'offers')
          return {
            data: {
              id: 'offer',
              status: 'accepted',
              title: 'Film',
              description: 'Tre filmer',
              price: 5000,
              supplier_id: 'supplier',
              projects: {
                id: 'project',
                title: 'Testuppdrag',
                buyer_id: 'buyer',
              },
            },
            error: null,
          }
        return { data: { full_name: 'Testpart' }, error: null }
      },
    }
    return builder
  })
})
const mount = () =>
  render(<AgreementPanel projectId="project" offerId="offer" role="buyer" />)
describe('agreement delivery plan saving', () => {
  it('saves the plan with a comparison to the loaded document and resets confirmation', async () => {
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Redigera' }))
    fireEvent.change(
      screen.getByLabelText('Vad ska levereras? En leverans per rad'),
      { target: { value: 'Tre filmer\nUndertexter' } }
    )
    fireEvent.change(screen.getByLabelText('Korrekturrundor som ingår'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Spara ändringar' }))
    await waitFor(() => expect(m.update).toHaveBeenCalledOnce())
    expect(m.update.mock.calls[0][0].content).toMatchObject({
      delivery_plan: {
        deliverables: ['Tre filmer', 'Undertexter'],
        revision_rounds: 2,
      },
      buyer_confirmed_at: null,
      supplier_confirmed_at: null,
    })
    expect(m.eq).toHaveBeenCalledWith('content', JSON.stringify(m.raw))
    await screen.findByRole('region', { name: 'Leveransunderlag' })
  })
  it('keeps edits visible and never sends a notification if another party changed the document', async () => {
    m.save.mockResolvedValue({ data: null, error: null })
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Redigera' }))
    fireEvent.change(
      screen.getByLabelText('Vad ska levereras? En leverans per rad'),
      { target: { value: 'Ny leverans' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Spara ändringar' }))
    await waitFor(() => expect(m.save).toHaveBeenCalledOnce())
    expect(
      screen.getByLabelText('Vad ska levereras? En leverans per rad')
    ).toHaveValue('Ny leverans')
    expect(m.notification).not.toHaveBeenCalled()
  })
  it('does not notify on a failed send and restores the retry button', async () => {
    m.save.mockRejectedValue(new Error('network'))
    mount()
    fireEvent.click(await screen.findByRole('button', { name: 'Skicka igen' }))
    await waitFor(() => expect(m.save).toHaveBeenCalledOnce())
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Skicka igen' })).toBeEnabled()
    )
    expect(m.notification).not.toHaveBeenCalled()
  })
  it('does not offer to overwrite a document that could not be loaded', async () => {
    m.loadError = true
    mount()
    await screen.findByRole('alert')
    expect(
      screen.queryByRole('button', { name: 'Skapa samarbetsavtal' })
    ).not.toBeInTheDocument()
  })
})
