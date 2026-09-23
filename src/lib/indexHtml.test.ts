import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// index.html is the template for every prerendered page, so anything in its
// head is repeated on hundreds of URLs.
const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')

describe('index.html template', () => {
  it('does not declare hreflang alternates (they would point every page at the start page)', () => {
    expect(html).not.toMatch(/hreflang=/i)
  })

  it('loads fonts from the app bundle, not from Google', () => {
    expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
  })

  it('keeps the document language', () => {
    expect(html).toMatch(/<html lang="sv"/)
  })
})
