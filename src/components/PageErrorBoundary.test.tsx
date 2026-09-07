import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PageErrorBoundary from './PageErrorBoundary'

const FailedSection = () => { throw new Error('Failed to fetch dynamically imported module') }

describe('PageErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('keeps the project form available when a below-fold section fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<><label>Projektbeskrivning<input /></label><PageErrorBoundary embedded><FailedSection /></PageErrorBoundary></>)
    expect(screen.getByLabelText('Projektbeskrivning')).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent('Vi kunde inte ladda hela sidan')
    expect(screen.getByRole('button', { name: 'Ladda om sidan' })).toBeVisible()
  })

  it('shows the page normally when loading succeeds', () => {
    render(<PageErrorBoundary><h1>Hitta byrå</h1></PageErrorBoundary>)
    expect(screen.getByRole('heading', { name: 'Hitta byrå' })).toBeVisible()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
