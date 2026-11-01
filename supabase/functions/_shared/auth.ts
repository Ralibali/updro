// Shared request-auth helpers for edge functions. Kept free of Deno APIs so the
// frontend test suite can exercise them too.

/** Compares two secrets without leaking the position of the first difference. */
export function constantTimeEqual(provided: string, expected: string): boolean {
  if (!provided || !expected) return false
  const encoder = new TextEncoder()
  const a = encoder.encode(provided)
  const b = encoder.encode(expected)
  let diff = a.length ^ b.length
  for (let i = 0; i < b.length; i++) diff |= (a[i] ?? 0) ^ b[i]
  return diff === 0
}

/** Returns the bearer token from an Authorization header, or an empty string. */
export function bearerToken(header: string | null): string {
  return (header || '').replace(/^Bearer\s+/i, '').trim()
}

/**
 * True when the request carries one of the configured cron secrets, either in
 * x-cron-secret or as a bearer token. Unset secrets never match.
 */
export function hasCronSecret(headers: Headers, secrets: Array<string | null | undefined>): boolean {
  const configured = secrets.filter((secret): secret is string => Boolean(secret))
  if (!configured.length) return false
  const header = headers.get('x-cron-secret') || ''
  const token = bearerToken(headers.get('Authorization'))
  return configured.some(secret => constantTimeEqual(header, secret) || constantTimeEqual(token, secret))
}
