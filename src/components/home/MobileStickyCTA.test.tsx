import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ isAuthenticated: false, isSupplier: false, isAdmin: false }) }))
vi.mock('@/hooks/usePageTracking', () => ({ trackClick: vi.fn() }))
vi.mock('@/lib/analytics', () => ({ trackLeadStarted: vi.fn() }))
vi.mock('./ExampleOffersSection', () => ({ default: () => null }))

import HeroSection from './HeroSection'
import MobileStickyCTA from './MobileStickyCTA'

const LocationProbe = () => {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

afterEach(() => vi.unstubAllGlobals())

describe('homepage mobile sticky CTA', () => {
  it('submits the hero draft and selected category after scrolling past the form', () => {
    vi.stubGlobal('innerWidth', 390)
    let scrollPastHero = () => {}
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        scrollPastHero = () => callback([
          { isIntersecting: false, boundingClientRect: { bottom: -1 } } as IntersectionObserverEntry,
        ], this as unknown as IntersectionObserver)
      }
      observe() {}
      disconnect() {}
    })
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<><HeroSection /><MobileStickyCTA /></>} />
          <Route path="/publicera" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Webbshop' }))
    fireEvent.change(screen.getByLabelText('Beskriv ditt projekt'), { target: { value: 'Shopify för vår klädbutik, med svensk checkout.' } })
    act(() => scrollPastHero())
    fireEvent.click(screen.getByRole('button', { name: 'Starta gratis' }))
    const url = new URL(screen.getByTestId('location').textContent!, 'https://updro.se')
    expect(url.pathname).toBe('/publicera')
    expect(url.searchParams.get('kategori')).toBe('E-handel')
    expect(url.searchParams.get('beskrivning')).toBe('Shopify för vår klädbutik, med svensk checkout.')
  })
})
