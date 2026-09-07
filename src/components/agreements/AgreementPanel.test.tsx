import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { buildDefaultAgreementContent, STANDARD_CLAUSES } from '@/lib/agreements'
import AgreementPanel from './AgreementPanel'

const mocks = vi.hoisted(() => ({ load: vi.fn(), save: vi.fn(), success: vi.fn(), error: vi.fn() }))
vi.mock('@/lib/agreementActions', () => ({ getProjectAgreement: mocks.load, updateProjectAgreement: mocks.save }))
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }))

const content = { ...buildDefaultAgreementContent({ title: 'Testuppdrag' }, {
  title: 'Testoffert', description: 'Fullständig omfattning för detta test.', price: 1200, payment_plan: 'hourly', delivery_weeks: 4,
}, 'Testkund AB', 'Testbyrå AB', new Date('2026-09-07T12:00:00Z')), standard_clauses: STANDARD_CLAUSES }
const context = { buyerName: 'Testkund AB', supplierName: 'Testbyrå AB', projectTitle: 'Testuppdrag', buyerId: 'buyer', supplierId: 'supplier' }
const row = { id: 'agreement', revision: 2, content: { ...content, buyer_confirmed_at: '2026-09-07T12:10:00Z' } }

beforeEach(() => { vi.clearAllMocks(); mocks.load.mockResolvedValue({ context, agreement: row }) })
afterEach(cleanup)

describe('AgreementPanel', () => {
  it('requires explicit review of the displayed version before confirming', async () => {
    render(<AgreementPanel projectId="project" offerId="offer" role="supplier" />)
    const button = await screen.findByRole('button', { name: 'Bekräfta samarbetsavtalet' })
    expect(button).toBeDisabled()
    expect(screen.getByText(/Ingen BankID-signering ingår/)).toBeInTheDocument()
    expect(screen.getByText(/\/timme/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox'))
    expect(button).toBeEnabled()
    mocks.save.mockResolvedValue({ ...row, revision: 3, content: { ...row.content, supplier_confirmed_at: '2026-09-07T12:20:00Z' } })
    fireEvent.click(button)
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith('offer', 'confirm', 2, undefined))
    expect(await screen.findByText(/Avtalet är låst/)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('shows a stale-version failure without pretending the agreement is signed', async () => {
    mocks.save.mockRejectedValue({ message: 'Avtalet har ändrats. Ladda om.' })
    render(<AgreementPanel projectId="project" offerId="offer" role="supplier" />)
    await screen.findByRole('checkbox')
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Bekräfta samarbetsavtalet' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Avtalet har ändrats')
    expect(mocks.success).not.toHaveBeenCalled()
    expect(screen.queryByText(/Avtalet är låst/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bekräfta samarbetsavtalet' })).toBeDisabled()
  })

  it('keeps an unsaved edit visible when saving fails', async () => {
    mocks.save.mockRejectedValue(new Error('Kunde inte spara'))
    render(<AgreementPanel projectId="project" offerId="offer" role="buyer" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Redigera utkast' }))
    fireEvent.change(screen.getByLabelText('Omfattning'), { target: { value: 'Mitt osparade tillägg' } })
    fireEvent.click(screen.getByRole('button', { name: 'Spara ändringar' }))
    await screen.findByRole('alert')
    expect(screen.getByLabelText('Omfattning')).toHaveValue('Mitt osparade tillägg')
    expect(mocks.success).not.toHaveBeenCalled()
  })

  it('distinguishes a failed read from an agreement that has not been created', async () => {
    mocks.load.mockRejectedValue(new Error('Avtalstjänsten kunde inte nås'))
    render(<AgreementPanel projectId="project" offerId="offer" role="buyer" />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Avtalstjänsten')
    expect(screen.queryByRole('button', { name: 'Skapa avtalsutkast' })).not.toBeInTheDocument()
    mocks.load.mockResolvedValue({ context, agreement: null })
    fireEvent.click(screen.getByRole('button', { name: 'Läs senaste versionen' }))
    expect(await screen.findByRole('button', { name: 'Skapa avtalsutkast' })).toBeEnabled()
  })
})
