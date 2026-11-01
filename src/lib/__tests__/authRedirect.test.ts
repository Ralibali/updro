import { describe, expect, it } from 'vitest'
import { loginPathFor, postLoginPath, safeInternalPath } from '../authRedirect'

describe('login redirect', () => {
  it('keeps the page from a notification e-mail through login', () => {
    const login = loginPathFor('/dashboard/buyer/chatt?project=p1&user=a1')
    expect(login).toBe('/logga-in?next=%2Fdashboard%2Fbuyer%2Fchatt%3Fproject%3Dp1%26user%3Da1')
    const next = new URLSearchParams(login.split('?')[1]).get('next')
    expect(postLoginPath('buyer', next)).toBe('/dashboard/buyer/chatt?project=p1&user=a1')
  })

  it('sends each role to its own area and falls back to its start page', () => {
    expect(postLoginPath('supplier', '/dashboard/supplier/uppdrag/p1')).toBe('/dashboard/supplier/uppdrag/p1')
    expect(postLoginPath('supplier', '/dashboard/buyer/uppdrag/p1')).toBe('/dashboard/supplier')
    expect(postLoginPath('buyer', '/dashboard/buyerish')).toBe('/dashboard/buyer')
    expect(postLoginPath('buyer', null)).toBe('/dashboard/buyer')
    expect(postLoginPath('admin', '/dashboard/buyer/uppdrag/p1')).toBe('/dashboard/buyer/uppdrag/p1')
    expect(postLoginPath('admin', null)).toBe('/admin')
  })

  it('never leaves the site or loops back to login', () => {
    for (const unsafe of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/dashboard/buy\ner', '/logga-in?next=/x']) {
      expect(safeInternalPath(unsafe)).toBeNull()
      expect(postLoginPath('buyer', unsafe)).toBe('/dashboard/buyer')
    }
    expect(loginPathFor('/')).toBe('/logga-in')
  })
})
