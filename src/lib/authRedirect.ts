import type { UserRole } from '@/types'

/** Where each role lands after login when no (valid) target was given. */
export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  supplier: '/dashboard/supplier',
  buyer: '/dashboard/buyer',
}

const AREA_PREFIX: Record<UserRole, string[]> = {
  admin: ['/'],
  supplier: ['/dashboard/supplier'],
  buyer: ['/dashboard/buyer'],
}

/** Login URL that brings the reader back to `target` afterwards. */
export function loginPathFor(target: string) {
  const safe = safeInternalPath(target)
  return safe && safe !== '/' ? `/logga-in?next=${encodeURIComponent(safe)}` : '/logga-in'
}

/** Accepts only same-site paths: no protocol, no //host, no backslashes or control characters. */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null
  if ([...path].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null
  if (path.startsWith('/logga-in')) return null
  return path.slice(0, 500)
}

/**
 * Where to go after login: the requested page when it belongs to this role's
 * area (a buyer link opened while signed in as an agency falls back to the
 * agency's start page instead of a dead end), otherwise the role's start page.
 */
export function postLoginPath(role: UserRole | null | undefined, next: unknown): string {
  if (!role || !(role in ROLE_HOME)) return '/'
  const path = safeInternalPath(next)
  const pathname = path?.split(/[?#]/)[0] || ''
  const allowed = AREA_PREFIX[role].some(prefix => prefix === '/' || pathname === prefix || pathname.startsWith(`${prefix}/`))
  return path && allowed ? path : ROLE_HOME[role]
}
