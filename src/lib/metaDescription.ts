const LEAD_IN = 'Beskriv projektet gratis och jämför högst tre relevanta offerter.'
const MIN_LENGTH = 100
const MAX_LENGTH = 155

const plain = (text: string) => text
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/\*\*/g, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim()

/** Shared description for React and prerendered service pages. */
export const completeMetaDescription = (text?: string | null): string => {
  let value = plain(text || '')
  if (!value) return ''
  if (value.length < MIN_LENGTH && !value.includes(LEAD_IN)) {
    value = `${/[.!?…]$/.test(value) ? value : `${value}.`} ${LEAD_IN}`
  }
  if (value.length <= MAX_LENGTH) return value
  const cut = value.slice(0, MAX_LENGTH - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–-]+$/, '')}…`
}
