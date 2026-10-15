import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import OfferComparison, { type BuyerOffer } from './OfferComparison'

const offer = (id: string, name: string, overrides: Partial<BuyerOffer> = {}): BuyerOffer => ({
  id, supplier_id: `s-${id}`, title: `Förslag från ${name}`, price: 45_000, delivery_weeks: 6, payment_plan: 'fixed',
  status: 'pending', created_at: '2026-10-01T10:00:00Z', attachment_url: null,
  profiles: { company_name: name, city: 'Malmö' },
  supplier_profiles: { avg_rating: 0, review_count: 0, is_verified: true, has_fskatt: true, credit_check_passed: false, completed_projects: 0 },
  ...overrides,
})

const renderComparison = (offers: BuyerOffer[], handlers = { onAccept: vi.fn(), onShowOffer: vi.fn() }) => {
  render(
    <MemoryRouter>
      <OfferComparison projectId="p1" budgetRange="10k_50k" offers={offers} {...handlers} />
    </MemoryRouter>,
  )
  return handlers
}

afterEach(cleanup)

describe('OfferComparison', () => {
  const offers = [
    offer('a', 'Nordlys', { price: 38_000, delivery_weeks: 8, supplier_profiles: { avg_rating: 4.8, review_count: 5, is_verified: true } }),
    offer('b', 'Kodverket', { price: 62_000, delivery_weeks: 4, created_at: '2026-10-02T10:00:00Z' }),
  ]

  it('puts the open offers side by side with price, budget fit and highlights', () => {
    renderComparison(offers)
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: /Nordlys/ })).toHaveTextContent('Lägst pris')
    // One rated agency has nothing to beat, so no rating badge is shown.
    expect(within(table).getByRole('columnheader', { name: /Nordlys/ })).not.toHaveTextContent('Högst betyg')
    expect(within(table).getByRole('columnheader', { name: /Kodverket/ })).toHaveTextContent('Snabbast leverans')
    expect(within(table).getByText('Inom din budget')).toBeInTheDocument()
    expect(within(table).getByText('Över din budget')).toBeInTheDocument()
    expect(within(table).getByRole('link', { name: 'Ställ en fråga till Kodverket' })).toHaveAttribute('href', '/dashboard/buyer/chatt?project=p1&user=s-b')
  })

  it('lets the buyer choose an agency or jump to the full offer', () => {
    const handlers = renderComparison(offers)
    fireEvent.click(screen.getByRole('button', { name: 'Välj Kodverket' }))
    expect(handlers.onAccept).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Läs hela offerten' })[0])
    expect(handlers.onShowOffer).toHaveBeenCalledWith('a')
  })

  it('stays out of the way with fewer than two open offers or after a decision', () => {
    renderComparison([offers[0], { ...offers[1], status: 'declined' }])
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    cleanup()
    renderComparison([{ ...offers[0], status: 'accepted' }, offers[1]])
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
