import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AgencyCityCategoryPage from './AgencyCityCategoryPage'
import AgencyCityPage from './AgencyCityPage'
import AgencyCategoryPage from './AgencyCategoryPage'
import { getAllStaticSeoRoutes } from '@/lib/seoStatic'
import { setSEOMeta } from '@/lib/seoHelpers'

vi.mock('@/components/Navbar', () => ({ default: () => null }))
vi.mock('@/components/Footer', () => ({ default: () => null }))
vi.mock('@/hooks/useAgencyDirectory', () => ({ useAgencyDirectory: () => ({ agencies: [], loading: false, error: null, retry: vi.fn() }) }))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { functions: { invoke: vi.fn().mockResolvedValue({ data: null }) } } }))
vi.stubGlobal('scrollTo', vi.fn())
afterEach(cleanup)

const routes = getAllStaticSeoRoutes()
const noindex = new Set(routes.filter(route => route.noindex).map(route => route.path))

describe('React directory indexability', () => {
  it.each(['/byraer/stockholm', '/byraer/kategori/seo', '/byraer/stockholm/seo'])('keeps contextual links out of noindex pages on %s', path => {
    render(<MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/byraer/:stad" element={<AgencyCityPage />} />
      <Route path="/byraer/kategori/:kategori" element={<AgencyCategoryPage />} />
      <Route path="/byraer/:stad/:kategori" element={<AgencyCityCategoryPage />} />
    </Routes></MemoryRouter>)
    const links = screen.getAllByRole('link').map(link => link.getAttribute('href')!)
    expect(links.filter(link => /^\/byraer\//.test(link)).length).toBeGreaterThan(0)
    expect(links.filter(link => noindex.has(link))).toEqual([])
  })
  it('keeps a thin combination noindex, follow after React renders', () => {
    const path = routes.find(route => route.noindex)!.path
    render(<MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/byraer/:stad/:kategori" element={<AgencyCityCategoryPage />} />
    </Routes></MemoryRouter>)
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow')
    expect(screen.getAllByRole('link').some(link => link.getAttribute('href') === '/byraer')).toBe(true)
  })
  it('does not carry the follow override into private noindex or indexable pages', () => {
    const base = { title: 'Test', description: 'Testbeskrivning', canonical: 'https://updro.se/test' }
    setSEOMeta({ ...base, noindex: true, follow: true })
    setSEOMeta({ ...base, noindex: true })
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, nofollow')
    setSEOMeta(base)
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toMatch(/^index, follow/)
  })
})
