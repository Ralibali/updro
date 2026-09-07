import { describe, expect, it } from 'vitest'
import { calculateCurrentStep } from './ProjectStepper'

describe('buyer progress', () => {
  it('does not invent interest or approval from elapsed time', () => {
    expect(calculateCurrentStep({ status: 'active', created_at: '2020-01-01', view_count: 100 }, [])).toBe('published')
    expect(calculateCurrentStep({ status: 'pending', created_at: '2020-01-01' }, [])).toBe('created')
  })
  it('guides accepted offers to agreement and startup before asking for a review', () => {
    expect(calculateCurrentStep({ status: 'closed' }, [{ status: 'accepted' }])).toBe('agreement')
    expect(calculateCurrentStep({ status: 'completed' }, [{ status: 'accepted' }])).toBe('review')
  })
  it('keeps full projects in comparison while offers still await a decision', () => {
    expect(calculateCurrentStep({ status: 'closed' }, [{ status: 'pending' }])).toBe('choosing')
    expect(calculateCurrentStep({ status: 'closed' }, [{ status: 'declined' }])).toBe('closed')
  })
})
