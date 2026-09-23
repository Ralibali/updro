import { describe, expect, it } from 'vitest'
import { bearerToken, constantTimeEqual } from '../../../supabase/functions/_shared/auth.ts'
import { safeRelativeLink } from '../../../supabase/functions/_shared/push-link.ts'

describe('constantTimeEqual', () => {
  it('accepts only an exact match', () => {
    expect(constantTimeEqual('secret-value', 'secret-value')).toBe(true)
    expect(constantTimeEqual('secret-valuE', 'secret-value')).toBe(false)
    expect(constantTimeEqual('secret', 'secret-value')).toBe(false)
    expect(constantTimeEqual('secret-value-longer', 'secret-value')).toBe(false)
  })

  it('never matches when either side is empty', () => {
    expect(constantTimeEqual('', '')).toBe(false)
    expect(constantTimeEqual('anything', '')).toBe(false)
    expect(constantTimeEqual('', 'configured-secret')).toBe(false)
  })
})

describe('bearerToken', () => {
  it('strips the scheme and tolerates missing headers', () => {
    expect(bearerToken('Bearer abc.def')).toBe('abc.def')
    expect(bearerToken('bearer   abc')).toBe('abc')
    expect(bearerToken(null)).toBe('')
  })
})

describe('safeRelativeLink', () => {
  it('keeps links inside Updro', () => {
    expect(safeRelativeLink('/dashboard/supplier/uppdrag/123')).toBe('/dashboard/supplier/uppdrag/123')
    expect(safeRelativeLink('/priser?ref=push#top')).toBe('/priser?ref=push#top')
  })

  it('replaces external or malformed links with the start page', () => {
    for (const link of ['https://evil.example/login', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '', null, 42, '/ok\nSet-Cookie']) {
      expect(safeRelativeLink(link)).toBe('/')
    }
  })
})
