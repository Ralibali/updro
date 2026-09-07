import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HittaWebbbyraPage, HittaSeoByraPage, HittaDigitalByraPage } from './SEOLandingPages'

vi.mock('@/components/Navbar', () => ({ default: () => null }))
vi.mock('@/components/Footer', () => ({ default: () => null }))
afterEach(cleanup)

describe('service landing page handoff', () => {
  it.each([
    [HittaWebbbyraPage, 'Webbutveckling'],
    [HittaSeoByraPage, 'SEO'],
    [HittaDigitalByraPage, 'Digital marknadsföring'],
  ])('keeps the selected service and starter brief', (Page, category) => {
    render(<MemoryRouter><Page /></MemoryRouter>)
    const url = new URL(screen.getByRole('link', { name: 'Beskriv ditt projekt gratis' }).getAttribute('href')!, 'https://updro.se')
    expect(url.searchParams.get('kategori')).toBe(category)
    expect(url.searchParams.get('beskrivning')).toContain('Vi behöver hjälp')
  })
})
