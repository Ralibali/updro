// Push notifications may only deep-link inside Updro. Anything else (absolute
// URLs, protocol-relative "//host", backslash tricks, javascript:) falls back
// to the start page, so a forged payload cannot send people to a phishing site.
export function safeRelativeLink(link: unknown, fallback = '/'): string {
  if (typeof link !== 'string') return fallback
  const value = link.trim()
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback
  return value.slice(0, 500)
}
