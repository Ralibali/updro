// Saniterar förifylld beskrivningstext från URL-parametern ?beskrivning=
// Annonslänkar kan läcka olösta platshållare (t.ex. Google Ads {keyword} /
// ValueTrack-tokens) rakt in i formuläret – de ska aldrig synas för användaren.

export interface SanitizedPrefill {
  text: string
  /** True om texten innehöll en olöst platshållare (då litar vi inte på auto-titeln heller) */
  hadPlaceholder: boolean
}

const PLACEHOLDER_RE = /\{[^{}]*\}/

export const sanitizePrefill = (raw: string | null | undefined): SanitizedPrefill => {
  if (!raw) return { text: '', hadPlaceholder: false }

  const hadPlaceholder = PLACEHOLDER_RE.test(raw)
  let text = raw
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (hadPlaceholder) {
    // "Jag söker hjälp med {keyword}." -> "Jag söker hjälp" (inte "Jag söker hjälp med .")
    text = text.replace(/\bmed\s*[.,!?]*$/i, '').replace(/[.,!?]+$/, '').trim()
  }

  return { text, hadPlaceholder }
}
