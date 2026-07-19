import { describe, it, expect } from 'vitest'
import { urlBase64ToUint8Array } from '../pushUtils'

describe('urlBase64ToUint8Array', () => {
  it('decodes a simple base64url string', () => {
    // 'AQID' är bytes [1, 2, 3] i base64
    expect([...urlBase64ToUint8Array('AQID')]).toEqual([1, 2, 3])
  })
  it('handles url-safe characters (- och _)', () => {
    // base64url utan padding: '--8' motsvarar base64 '++8=' → bytes [251, 239]
    expect([...urlBase64ToUint8Array('--8')]).toEqual([251, 239])
  })
  it('pads when the input length is not a multiple of 4', () => {
    // 'QQ' ska tolkas som 'QQ==' → byte [65]
    expect([...urlBase64ToUint8Array('QQ')]).toEqual([65])
  })
  it('decodes a realistic VAPID-length key', () => {
    // 65 byte uncompressed EC-punkt, base64url utan padding
    const bytes = Array.from({ length: 65 }, (_, i) => i % 256)
    const b64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    expect([...urlBase64ToUint8Array(b64)]).toEqual(bytes)
  })
})
