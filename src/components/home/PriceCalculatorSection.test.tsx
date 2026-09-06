import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PROJECT_TYPES } from '@/lib/priceGuideData'
import { CATEGORIES } from '@/lib/constants'
import { resolveWizardCategory } from '@/lib/wizardPrefill'
import PriceCalculatorSection from './PriceCalculatorSection'

vi.mock('@/hooks/usePageTracking', () => ({ trackClick: vi.fn() }))

describe('price calculator to project wizard', () => {
  it('carries every selected service to a valid wizard category along with the brief', () => {
    render(<MemoryRouter><PriceCalculatorSection /></MemoryRouter>)
    for (const type of PROJECT_TYPES) {
      fireEvent.click(screen.getByRole('button', { name: type.label }))
      const url = new URL(screen.getByRole('link', { name: 'Jämför riktiga offerter' }).getAttribute('href')!, 'https://updro.se')
      expect(CATEGORIES).toContain(type.category)
      expect(resolveWizardCategory(null, url.searchParams.get('kategori'))).toBe(type.category)
      expect(url.searchParams.get('beskrivning')).toContain(type.query.toLowerCase())
    }
  })
})
