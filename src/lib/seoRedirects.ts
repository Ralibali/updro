/**
 * Single source of truth for legacy URL aliases/redirects on updro.se.
 *
 * Consumed by:
 * - `src/App.tsx` – client-side `<Navigate replace>` routes (the only layer
 *   that actually executes redirects on the current host).
 * - `public/_redirects` – static hosting rules. NOTE: verified 2026-08-29
 *   that the current host does NOT execute `_redirects`; the file is kept in
 *   sync with this module as documentation/config for a future host that
 *   supports it (Netlify/Cloudflare Pages/edge worker).
 * - `src/lib/seoRedirects.test.ts` – regression tests asserting the map and
 *   `_redirects` stay aligned.
 *
 * Do NOT add valid SPA routes here – only legacy URLs that must move.
 */

export interface LegacyRedirect {
  /** Exact legacy path (no trailing slash, no params). */
  from: string
  /** Canonical target path. */
  to: string
  /** Why this alias exists (historical name/campaign). */
  reason: string
}

/** Exact-path legacy aliases. Order matters only for readability. */
export const LEGACY_REDIRECTS: readonly LegacyRedirect[] = [
  // Duplicate landing page: rendered the same component as /for-byraer.
  { from: '/landing/byra', to: '/for-byraer', reason: 'dubblett av /for-byraer (samma komponent)' },

  // Old content-namespace names.
  { from: '/guider', to: '/artiklar', reason: 'gammalt namn på artikelindex' },
  { from: '/kunskapsbank', to: '/artiklar', reason: 'gammalt namn på artikelindex' },

  // Partna/Swivrr comparison aliases.
  { from: '/updro-vs-partna', to: '/partna-alternativ', reason: 'gammal jämförelse-URL' },
  { from: '/jamfor-partna', to: '/partna-alternativ', reason: 'gammal jämförelse-URL' },
  { from: '/alternativ-till-partna', to: '/partna-alternativ', reason: 'gammal jämförelse-URL' },
  { from: '/updro-vs-swivrr', to: '/swivrr-alternativ', reason: 'gammal jämförelse-URL' },

  // Standalone calculator URLs that moved under /verktyg/.
  { from: '/hemsida-pris-kalkylator', to: '/verktyg/hemsida-pris-kalkylator', reason: 'kalkylator flyttad under /verktyg' },
  { from: '/vad-kostar-en-hemsida-kalkylator', to: '/verktyg/hemsida-pris-kalkylator', reason: 'kalkylator flyttad under /verktyg' },

  // Old local-SEO URLs -> existing city/service pages.
  { from: '/webbyra-stockholm', to: '/byraer/stockholm', reason: 'gammal lokal SEO-URL' },
  { from: '/webbyra-goteborg', to: '/byraer/goteborg', reason: 'gammal lokal SEO-URL' },
  { from: '/webbyra-malmo', to: '/byraer/malmo', reason: 'gammal lokal SEO-URL' },
  { from: '/seo-byra-stockholm', to: '/seo/stockholm', reason: 'gammal lokal SEO-URL' },
  { from: '/seo-byra-goteborg', to: '/seo/goteborg', reason: 'gammal lokal SEO-URL' },
  { from: '/seo-byra-malmo', to: '/seo/malmo', reason: 'gammal lokal SEO-URL' },
] as const

/**
 * Single-segment prefix aliases: `<from>/<slug>` -> `<to>/<slug>`.
 * Only one path segment is carried over; deeper paths are left untouched.
 * NOTE: `/stader` itself is a valid page (CitiesIndex) and must NOT redirect.
 */
export const LEGACY_PREFIX_REDIRECTS = [
  { from: '/guider', to: '/artiklar' },
  { from: '/kunskapsbank', to: '/artiklar' },
  { from: '/stader', to: '/byraer' },
] as const

const normalize = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

/**
 * Resolve a pathname to its canonical redirect target, or null when the path
 * is not a known legacy alias (i.e. it should be routed normally / 404).
 */
export const resolveLegacyRedirect = (pathname: string): string | null => {
  const path = normalize(pathname.split(/[?#]/)[0])

  const exact = LEGACY_REDIRECTS.find(redirect => redirect.from === path)
  if (exact) return exact.to

  for (const prefix of LEGACY_PREFIX_REDIRECTS) {
    if (path.startsWith(`${prefix.from}/`)) {
      const rest = path.slice(prefix.from.length + 1)
      if (!rest || rest.includes('/')) return null
      return `${prefix.to}/${rest}`
    }
  }

  return null
}
