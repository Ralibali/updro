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
