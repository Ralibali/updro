import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/seoHelpers', () => ({ setSEOMeta: () => {} }))
vi.mock('@/lib/analytics', () => ({ trackLeadStarted: () => {} }))
vi.mock('@/hooks/usePageTracking', () => ({ trackClick: () => {} }))

import AdsLandingPage from './AdsLandingPage'

const LocationProbe = () => {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/jamfor-offerter" element={<AdsLandingPage />} />
        <Route path="/publicera" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  )

describe('AdsLandingPage', () => {
  it('matchar rubriken mot annonsgruppen och förväljer kategorin', () => {
    renderAt('/jamfor-offerter?tjanst=webbshop')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jämför offerter på webbshop')
    fireEvent.change(screen.getByLabelText('Beskriv ditt projekt'), { target: { value: 'Shopify för klädbutik' } })
    fireEvent.click(screen.getByRole('button', { name: /Få offerter gratis/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/publicera?kategori=E-handel&beskrivning=Shopify+f%C3%B6r+kl%C3%A4dbutik')
  })

  it('visar generell rubrik och ignorerar olösta Ads-platshållare', () => {
    renderAt('/jamfor-offerter?tjanst=okand&utm_term={keyword}')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jämför offerter från rätt webbyråer')
    expect(screen.getByLabelText('Beskriv ditt projekt')).toHaveValue('')
  })

  it('förifyller briefen från sökordet', () => {
    renderAt('/jamfor-offerter?utm_term=wordpress%20hemsida')
    expect(screen.getByLabelText('Beskriv ditt projekt')).toHaveValue('Jag söker hjälp med wordpress hemsida. ')
  })
})
