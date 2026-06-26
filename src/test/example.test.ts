import { describe, expect, it } from 'vitest'
import { getProjectBuyerContact } from '@/lib/buyerContact'
import {
  buildOfferAttachmentPath,
  OFFER_ATTACHMENT_MAX_BYTES,
  validateOfferAttachment,
} from '@/lib/marketplaceActions'

const mockFile = (name: string, size: number, type = '') => ({ name, size, type } as File)

describe('getProjectBuyerContact', () => {
  it('prioriterar registrerad profil', () => {
    const contact = getProjectBuyerContact({
      profiles: { full_name: 'Registrerad kund' },
      guest_leads: { full_name: 'Gästkund' },
    })
    expect(contact?.full_name).toBe('Registrerad kund')
  })

  it('använder gästlead när profil saknas', () => {
    const contact = getProjectBuyerContact({
      profiles: null,
      guest_leads: { full_name: 'Gästkund' },
    })
    expect(contact?.full_name).toBe('Gästkund')
  })
})

describe('offertbilagor', () => {
  it('godkänner en PDF inom storleksgränsen', () => {
    expect(validateOfferAttachment(mockFile('offert.pdf', 250_000, 'application/pdf'))).toEqual({
      ok: true,
      extension: 'pdf',
      contentType: 'application/pdf',
    })
  })

  it('stoppar en för stor fil', () => {
    expect(validateOfferAttachment(mockFile('stor.pdf', OFFER_ATTACHMENT_MAX_BYTES + 1))).toEqual({
      ok: false,
      error: 'Filen är för stor. Max 10 MB tillåts.',
    })
  })

  it('stoppar en otillåten filtyp', () => {
    expect(validateOfferAttachment(mockFile('program.exe', 100))).toEqual({
      ok: false,
      error: 'Filtypen stöds inte. Använd PDF, DOC, DOCX, JPG eller PNG.',
    })
  })

  it('bygger en privat sökväg under rätt leverantör och uppdrag', () => {
    const path = buildOfferAttachmentPath(
      'supplier-123',
      'project-456',
      mockFile('Min offert 2026!.PDF', 100),
      'pdf',
    )

    expect(path).toMatch(/^supplier-123\/project-456\//)
    expect(path).toMatch(/-Min-offert-2026\.pdf$/)
    expect(path).not.toContain(' ')
  })
})
