import { describe, expect, it } from 'vitest'
import { getProjectBuyerContact } from '@/lib/buyerContact'

describe('getProjectBuyerContact', () => {
  it('prioriterar alltid registrerad profil', () => {
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
