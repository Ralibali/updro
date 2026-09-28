import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/Navbar', () => ({ default: () => <nav>Nav</nav> }))
vi.mock('@/components/Footer', () => ({ default: () => <footer>Footer</footer> }))
vi.mock('./SchemaMarkup', () => ({ default: () => null }))
vi.mock('./SEOLeadCTA', () => ({ default: () => null }))
vi.mock('@/lib/seoHelpers', () => ({
  setSEOMeta: () => {},
  getOgImage: () => '',
}))
vi.mock('@/lib/seoDeepEnrichment', () => ({
  mergeDeep: () => {},
}))

import { useLocation } from 'react-router-dom'
import PillarPage from './PillarPage'

vi.mock('@/lib/analytics', () => ({ trackLeadStarted: () => {} }))
vi.mock('@/hooks/usePageTracking', () => ({ trackClick: () => {} }))

const LocationProbe = () => {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

const renderPillar = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:category" element={<PillarPage />} />
        <Route path="/publicera" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  )

describe('PillarPage hero CTA', () => {
  it('tar med briefen och kategorin från /webbutveckling in i wizarden', () => {
    renderPillar('/webbutveckling')
    fireEvent.change(screen.getByLabelText('Beskriv ditt projekt'), { target: { value: 'Ny hemsida för bageri' } })
    fireEvent.click(screen.getByRole('button', { name: /Få offerter gratis/ }))
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/publicera?kategori=Webbutveckling&beskrivning=Ny+hemsida+f%C3%B6r+bageri',
    )
  })
})
