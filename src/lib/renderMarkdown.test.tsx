import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderMarkdown } from './renderMarkdown'

describe('article source links', () => {
  it('renders the original article source as a clickable link', () => {
    const html = renderToStaticMarkup(<>{renderMarkdown('Läs [W3C WAI](https://www.w3.org/WAI/test-evaluate/easy-checks/) och **kontrollera** resultatet.')}</>)
    expect(html).toContain('href="https://www.w3.org/WAI/test-evaluate/easy-checks/"')
    expect(html).toContain('>W3C WAI</a>')
    expect(html).toContain('>kontrollera</strong>')
  })

  it('supports an internal next step', () => {
    expect(renderToStaticMarkup(<>{renderMarkdown('[Beskriv projektet](/publicera)')}</>)).toContain('href="/publicera"')
  })

  it('keeps unsafe destinations and markup as text', () => {
    for (const href of ['javascript:alert', '//example.com', '/\\example.com', 'https://name:password@example.com', 'data:text/html,hello']) {
      expect(renderToStaticMarkup(<>{renderMarkdown(`[Länk](${href})`)}</>)).not.toContain('<a ')
    }
    expect(renderToStaticMarkup(<>{renderMarkdown('<img src=x onerror=alert(1)>')}</>)).not.toContain('<img')
  })
})
