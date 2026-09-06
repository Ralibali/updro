import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAgencyDirectory } from './useAgencyDirectory'

const { responses, rpc } = vi.hoisted(() => ({ responses: vi.fn(), rpc: vi.fn() }))
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc } }))

beforeEach(() => {
  vi.clearAllMocks()
  const query = { order: vi.fn(), range: vi.fn(), contains: vi.fn(), then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(responses()).then(resolve, reject) }
  query.order.mockReturnValue(query)
  query.range.mockReturnValue(query)
  query.contains.mockReturnValue(query)
  rpc.mockReturnValue(query)
})

describe('agency directory recovery', () => {
  it('finds city matches beyond the first page and excludes incomplete profiles', async () => {
    responses.mockReturnValueOnce({ data: Array.from({ length: 100 }, (_, id) => ({ id: String(id), slug: `byra-${id}`, city: 'Stockholm' })), error: null })
      .mockReturnValueOnce({ data: [{ id: '101', slug: 'uppsala-byra', city: ' Uppsala ' }, { id: '102', slug: null, city: 'Uppsala' }], error: null })
    const { result } = renderHook(() => useAgencyDirectory({ city: 'Uppsala' }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.agencies.map(agency => agency.slug)).toEqual(['uppsala-byra'])
    expect(rpc).toHaveBeenCalledWith('get_public_agencies')
  })

  it('distinguishes a failed response from an empty directory and allows retry', async () => {
    responses.mockReturnValueOnce({ data: null, error: new Error('network') }).mockReturnValueOnce({ data: [], error: null })
    const { result } = renderHook(() => useAgencyDirectory())
    await waitFor(() => expect(result.current.error).toBe(true))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(false)
    expect(result.current.agencies).toEqual([])
  })

  it('does not replace a newly selected category with an older response', async () => {
    let finishOld: (value: unknown) => void = () => {}
    responses.mockReturnValueOnce(new Promise(resolve => { finishOld = resolve })).mockReturnValueOnce({ data: [{ id: 'new', slug: 'new', profiles: null }], error: null })
    const { result, rerender } = renderHook(({ category }) => useAgencyDirectory({ category }), { initialProps: { category: 'SEO' } })
    await waitFor(() => expect(responses).toHaveBeenCalledTimes(1))
    rerender({ category: 'E-handel' })
    await waitFor(() => expect(result.current.agencies[0]?.id).toBe('new'))
    await act(async () => finishOld({ data: [{ id: 'old', slug: 'old' }], error: null }))
    expect(result.current.agencies[0]?.id).toBe('new')
  })
})
