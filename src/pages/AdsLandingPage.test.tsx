import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/seoHelpers', () => ({ setSEOMeta: () => {} }))
vi.mock('@/lib/analytics', () => ({ trackLeadStarted: () => {} }))
vi.mock('@/hooks/usePageTracking', () => ({ trackClick: () => {} }))

vi.mock('@/components/Navbar', () => ({ default: ({ projectHref }: { projectHref: string }) => <nav><Link to={projectHref}>Beskriv ditt projekt</Link></nav> }))
vi.mock('@/components/Footer', () => ({ default: () => <footer>Updro</footer> }))

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

  it.each(['Beskriv ditt projekt', 'Beskriv ditt projekt gratis', 'Jämför offerter gratis'])(
    'behåller den redigerade briefen via länken %s', label => {
      renderAt('/jamfor-offerter?tjanst=webbshop&utm_term=shopify')
      fireEvent.change(screen.getByLabelText('Beskriv ditt projekt'), { target: { value: '  Shopify för vår klädbutik, med svensk checkout.  ' } })
      fireEvent.click(screen.getByRole('link', { name: label }))
      const url = new URL(screen.getByTestId('location').textContent!, 'https://updro.se')
      expect(url.pathname).toBe('/publicera')
      expect(url.searchParams.get('kategori')).toBe('E-handel')
      expect(url.searchParams.get('beskrivning')).toBe('Shopify för vår klädbutik, med svensk checkout.')
    },
  )

  it('behåller den redigerade briefen när besökaren väljer ett annat område', () => {
    renderAt('/jamfor-offerter?tjanst=webbshop&utm_term=shopify')
    fireEvent.change(screen.getByLabelText('Beskriv ditt projekt'), { target: { value: 'Vi behöver bättre Google-synlighet för webbshoppen.' } })
    fireEvent.click(screen.getByRole('link', { name: /^SEO Bättre synlighet/ }))
    const url = new URL(screen.getByTestId('location').textContent!, 'https://updro.se')
    expect(url.searchParams.get('kategori')).toBe('SEO')
    expect(url.searchParams.get('beskrivning')).toBe('Vi behöver bättre Google-synlighet för webbshoppen.')
  })
})
