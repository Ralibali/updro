import React from 'react'

/**
 * Converts a simple markdown string to React elements.
 * Supports: **bold**, HTTPS/internal links, lists, tables and paragraphs.
 */
export function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split('\n\n')

  return paragraphs.map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    const lines = trimmed.split('\n')

    // Check if the block is a table (lines contain |)
    const isTable = lines.length >= 2 && lines.every(l => l.trim().startsWith('|') && l.trim().endsWith('|'))
    if (isTable) {
      const rows = lines
        .map(l => l.trim().slice(1, -1).split('|').map(c => c.trim()))

      // Filter out separator rows more robustly
      const dataRows = rows.filter(row => !row.every(cell => /^:?-{3,}:?$/.test(cell)))

      if (dataRows.length === 0) return null

      const headerRow = dataRows[0]
      const bodyRows = dataRows.slice(1)

      return (
        <div key={i} className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                {headerRow.map((cell, j) => (
                  <th key={j} className="text-left p-2.5 font-semibold text-foreground">{inlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, j) => (
                <tr key={j} className="border-b border-border/50">
                  {row.map((cell, k) => (
                    <td key={k} className="p-2.5">{inlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Check if the block is a list
    const isUnorderedList = lines.every(l => /^-\s/.test(l.trim()))
    const isOrderedList = lines.every(l => /^\d+\.\s/.test(l.trim()))

    if (isUnorderedList) {
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 mb-4">
          {lines.map((line, j) => (
            <li key={j} className="leading-relaxed">{inlineMarkdown(line.replace(/^-\s/, '').trim())}</li>
          ))}
        </ul>
      )
    }

    if (isOrderedList) {
      return (
        <ol key={i} className="list-decimal list-inside space-y-1.5 mb-4">
          {lines.map((line, j) => (
            <li key={j} className="leading-relaxed">{inlineMarkdown(line.replace(/^\d+\.\s/, '').trim())}</li>
          ))}
        </ol>
      )
    }

    return <p key={i} className="mb-4 leading-relaxed">{inlineMarkdown(trimmed)}</p>
  })
}

/** Convert **bold** markers to <strong> elements */
function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
  if (parts.length === 1) return text

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      const [, label, href] = link
      try {
        const url = new URL(href, 'https://updro.se')
        const supported = href.startsWith('https://') || /^\/(?!\/)/.test(href)
        if (supported && url.protocol === 'https:' && !url.username && !url.password && !/[\\\s]/.test(href)) {
          return <a key={i} href={href} className="text-primary underline underline-offset-2" rel={url.origin === 'https://updro.se' ? undefined : 'noopener noreferrer'}>{label}</a>
        }
      } catch { /* Keep unsupported destinations as literal text. */ }
    }
    return part
  })
}
