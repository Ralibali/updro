import { render, screen } from '@testing-library/react'
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

import PillarPage from './PillarPage'

const renderPillar = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:category" element={<PillarPage />} />
      </Routes>
    </MemoryRouter>,
  )

describe('PillarPage hero CTA', () => {
  it('pekar /webbutveckling mot /publicera/webbutveckling', () => {
    renderPillar('/webbutveckling')
    expect(screen.getByRole('link', { name: /Jämför offerter gratis/ })).toHaveAttribute(
      'href',
      '/publicera/webbutveckling',
    )
  })
})
