import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { resolveWizardCategory } from '@/lib/wizardPrefill'
import WebsitePriceCalculator from './WebsitePriceCalculator'

describe('website estimate to project request', () => {
  it('keeps the selected ecommerce scope when the buyer asks for real offers', () => {
    render(<MemoryRouter><WebsitePriceCalculator /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Typ av projekt'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText(/Antal sidor/), { target: { value: '12' } })
    fireEvent.click(screen.getByLabelText('Bokningssystem'))
    fireEvent.change(screen.getByLabelText('Ambitionsnivå'), { target: { value: '2' } })
    const url = new URL(screen.getByRole('link', { name: 'Få riktiga offerter gratis' }).getAttribute('href')!, 'https://updro.se')
    expect(resolveWizardCategory(null, url.searchParams.get('kategori'))).toBe('E-handel')
    expect(url.searchParams.get('beskrivning')).toContain('e-handel, cirka 12 sidor')
    expect(url.searchParams.get('beskrivning')).toContain('Bokningssystem')
    expect(url.searchParams.get('beskrivning')).toContain('Premium / skräddarsytt')
    expect(url.searchParams.get('beskrivning')).toContain('riktpriset')
    expect(url.searchParams.has('budget')).toBe(false)
  })
})
