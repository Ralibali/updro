/** Use the signed hook's verification token, never its redirect target. */
export function signupConfirmationLink(rawUrl: string, supabaseUrl: string): string {
  const source = new URL(rawUrl)
  if (source.origin !== new URL(supabaseUrl).origin || source.pathname !== '/auth/v1/verify') {
    throw new Error('Unexpected signup verification URL')
  }
  const type = source.searchParams.get('type')
  const tokenHash = source.searchParams.get('token')
  if ((type !== 'signup' && type !== 'email') || !tokenHash) {
    throw new Error('Missing signup verification token')
  }
  // Fragments are not sent to the web server or as referrers.
  const target = new URL('https://updro.se/bekrafta-epost')
  target.hash = new URLSearchParams({ token_hash: tokenHash, type: 'email' }).toString()
  return target.toString()
}
