import { describe, expect, it } from 'vitest'
import { sanitizePrefill } from './prefill'

describe('sanitizePrefill', () => {
  it('tar bort olöst {keyword}-token och städar meningen', () => {
    const r = sanitizePrefill('Jag söker hjälp med {keyword}.')
    expect(r.text).toBe('Jag söker hjälp')
    expect(r.hadPlaceholder).toBe(true)
  })

  it('returnerar tom text när parametern bara är en platshållare', () => {
    expect(sanitizePrefill('{keyword}').text).toBe('')
    expect(sanitizePrefill('{KeyWord:standard}').text).toBe('')
    expect(sanitizePrefill('{keyword}').hadPlaceholder).toBe(true)
  })

  it('lämnar egen förifylld text orörd (SEO-sidor avslutar med "med")', () => {
    const r = sanitizePrefill('Vi behöver hjälp av en webbyrå med ')
    expect(r.text).toBe('Vi behöver hjälp av en webbyrå med')
    expect(r.hadPlaceholder).toBe(false)
  })

  it('behåller skiljetecken i normal text', () => {
    expect(sanitizePrefill('Ny hemsida till vår restaurang.').text).toBe('Ny hemsida till vår restaurang.')
  })

  it('hanterar null, undefined och tom sträng', () => {
    expect(sanitizePrefill(null).text).toBe('')
    expect(sanitizePrefill(undefined).hadPlaceholder).toBe(false)
    expect(sanitizePrefill('').text).toBe('')
  })

  it('klipper för lång text hanteras av anroparen – men kraschar inte', () => {
    expect(sanitizePrefill('x'.repeat(6000)).text.length).toBe(6000)
  })
})
