import { describe, expect, it, vi } from 'vitest'
import { loadAdminOverview } from './adminOverview'

function clientWithCounts(counts: Array<number | null>, errorAt = -1) {
  let index = 0
  const from = vi.fn(() => {
    const current = index++
    const result = current < 9
      ? { count: counts[current], error: current === errorAt ? new Error('Connection failed') : null }
      : { data: [], error: null }
    const query = { select: vi.fn(), eq: vi.fn(), is: vi.fn(), order: vi.fn(), limit: vi.fn(), then: vi.fn() }
    for (const method of ['select', 'eq', 'is', 'order', 'limit'] as const) query[method].mockReturnValue(query)
    query.then.mockImplementation((resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve))
    return query
  })
  return { from } as unknown as Parameters<typeof loadAdminOverview>[0]
}

describe('admin overview', () => {
  it('preserves genuine zero counts and exposes separate work queues', async () => {
    const data = await loadAdminOverview(clientWithCounts([9, 7, 0, 0, 0, 0, 2, 4, 1]))
    expect(data).toMatchObject({ projects: 0, offers: 0, totalLeads: 0, pendingProjects: 2, unverifiedSuppliers: 4, orphanLeads: 1 })
  })
  it('does not turn a failed database request into zero activity', async () => {
    await expect(loadAdminOverview(clientWithCounts(Array(9).fill(0), 4))).rejects.toThrow('Connection failed')
  })
  it('treats an absent count as unknown', async () => {
    await expect(loadAdminOverview(clientWithCounts([9, 7, null, 0, 0, 0, 0, 4, 1]))).rejects.toThrow('Statistik saknas')
  })
})
