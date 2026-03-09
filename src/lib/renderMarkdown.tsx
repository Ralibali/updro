import React from 'react'

/**
 * Converts a simple markdown string (bold, lists, line breaks) to React elements.
 * Supports: **bold**, - unordered lists, 1. ordered lists, \n\n paragraphs
 */
export function renderMarkdown(text: string): React.ReactNode[] {
  const paragraphs = text.split('\n\n')

  return paragraphs.map((block, i) => {
    const trimmed = block.trim()
    if (!trimmed) return null

    // Check if the block is a list
    const lines = trimmed.split('\n')
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
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  if (parts.length === 1) return text

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    }
    return part
  })
}
