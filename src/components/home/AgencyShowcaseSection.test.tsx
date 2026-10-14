import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgencyShowcaseSection from './AgencyShowcaseSection'

const mocks = vi.hoisted(() => ({ rows: [] as unknown[], error: null as null | { message: string } }))
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: () => {
      const chain: Record<string, any> = {}
      chain.eq = chain.order = chain.limit = () => chain
      chain.then = (resolve: (value: unknown) => void) => Promise.resolve(resolve({ data: mocks.error ? null : mocks.rows, error: mocks.error }))
      return chain
    },
  },
}))

const agency = (index: number, overrides: Record<string, unknown> = {}) => ({
  id: `a${index}`, slug: `byra-${index}`, company_name: `Byrå ${index}`, city: 'Malmö', categories: ['SEO'], logo_url: null, avatar_url: null, ...overrides,
})
const renderSection = () => render(<MemoryRouter><AgencyShowcaseSection /></MemoryRouter>)

beforeEach(() => { mocks.rows = []; mocks.error = null })
afterEach(cleanup)

describe('AgencyShowcaseSection', () => {
  it('links to each verified agency profile', async () => {
    mocks.rows = [agency(1), agency(2), agency(3)]
    renderSection()
    expect(await screen.findByRole('heading', { name: /Riktiga byråer/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Byrå 1/ })).toHaveAttribute('href', '/byra/byra-1')
    expect(screen.getAllByText('Malmö')).toHaveLength(3)
  })

  it('stays hidden until there are enough complete profiles', async () => {
    mocks.rows = [agency(1), agency(2), agency(3, { slug: null })]
    const { container } = renderSection()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(container).toBeEmptyDOMElement()
  })

  it('stays hidden when the directory cannot be read', async () => {
    mocks.error = { message: 'offline' }
    const { container } = renderSection()
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(container).toBeEmptyDOMElement()
  })
})
