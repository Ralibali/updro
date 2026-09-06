import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './renderMarkdown'

describe('renderMarkdown tables', () => {
  it('keeps headers and content while removing aligned separator cells', () => {
    render(<>{renderMarkdown('| Fråga | Underlag |\n| :--- | ---: |\n| **Resultat** | Verkliga uppdrag |')}</>)
    expect(screen.getByRole('columnheader', { name: 'Fråga' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Resultat' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Verkliga uppdrag' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(2)
  })
})
