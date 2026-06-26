import { afterEach, describe, expect, it, vi } from 'vitest'

const rpcMock = vi.fn()
const uploadMock = vi.fn()
const createSignedUrlMock = vi.fn()
const fromStorageMock = vi.fn(() => ({ upload: uploadMock, createSignedUrl: createSignedUrlMock }))

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpcMock(...args),
    storage: { from: (...args: unknown[]) => fromStorageMock(...args) },
  },
}))

import {
  buildOfferAttachmentPath,
  getOfferAttachmentSignedUrl,
  OFFER_ATTACHMENT_MAX_BYTES,
  submitProjectOffer,
  unlockProject,
  uploadOfferAttachment,
  validateOfferAttachment,
} from '@/lib/marketplaceActions'

const makeFile = (name: string, size: number, type: string): File => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

afterEach(() => {
  rpcMock.mockReset()
  uploadMock.mockReset()
  createSignedUrlMock.mockReset()
  fromStorageMock.mockClear()
})

describe('unlockProject', () => {
  it('anropar atomiska RPC:n och returnerar resultatet från servern', async () => {
    rpcMock.mockResolvedValueOnce({ data: { already_unlocked: false, credits_left: 4 }, error: null })

    const result = await unlockProject('project-1')

    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(rpcMock).toHaveBeenCalledWith('unlock_project_for_supplier', { p_project_id: 'project-1' })
    expect(result).toEqual({ already_unlocked: false, credits_left: 4 })
  })

  it('hanterar redan upplåst kontakt utan att kasta', async () => {
    rpcMock.mockResolvedValueOnce({ data: { already_unlocked: true, credits_left: 4 }, error: null })

    const result = await unlockProject('project-1')

    expect(result.already_unlocked).toBe(true)
    expect(result.credits_left).toBe(4)
  })

  it('vid två parallella anrop debiteras endast en kredit eftersom servern är auktoritativ', async () => {
    rpcMock
      .mockResolvedValueOnce({ data: { already_unlocked: false, credits_left: 3 }, error: null })
      .mockResolvedValueOnce({ data: { already_unlocked: true, credits_left: 3 }, error: null })

    const [first, second] = await Promise.all([unlockProject('p'), unlockProject('p')])

    expect(first.already_unlocked).toBe(false)
    expect(second.already_unlocked).toBe(true)
    expect(first.credits_left).toBe(second.credits_left)
  })

  it('kastar serverns felmeddelande vidare', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Du har inga lead-krediter kvar.') })

    await expect(unlockProject('p')).rejects.toThrow('Du har inga lead-krediter kvar.')
  })
})

describe('submitProjectOffer', () => {
  it('anropar atomiska RPC:n och uppdaterar inte offer_count från klienten', async () => {
    rpcMock.mockResolvedValueOnce({ data: 'offer-uuid', error: null })

    const id = await submitProjectOffer({
      projectId: 'project-1',
      title: 'Titel',
      description: 'Beskrivning',
      price: 1000,
      deliveryWeeks: 4,
      paymentPlan: 'fixed',
      attachmentUrl: null,
    })

    expect(id).toBe('offer-uuid')
    expect(rpcMock).toHaveBeenCalledTimes(1)
    expect(rpcMock).toHaveBeenCalledWith('submit_project_offer', {
      p_project_id: 'project-1',
      p_title: 'Titel',
      p_description: 'Beskrivning',
      p_price: 1000,
      p_delivery_weeks: 4,
      p_payment_plan: 'fixed',
      p_attachment_url: null,
    })
  })

  it('översätter inte dubblettoffert lokalt – servern är auktoritativ', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Du har redan skickat en offert på detta uppdrag.') })

    await expect(
      submitProjectOffer({
        projectId: 'p', title: 't', description: 'd', price: 1, deliveryWeeks: null, paymentPlan: 'fixed', attachmentUrl: null,
      }),
    ).rejects.toThrow('redan skickat en offert')
  })

  it('vidarebefordrar serverns fel när uppdraget är fullt eller stängt', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Uppdraget tar inte emot fler offerter.') })

    await expect(
      submitProjectOffer({
        projectId: 'p', title: 't', description: 'd', price: 1, deliveryWeeks: null, paymentPlan: 'fixed', attachmentUrl: null,
      }),
    ).rejects.toThrow('tar inte emot fler offerter')
  })
})

describe('validateOfferAttachment', () => {
  it('accepterar tillåtna filtyper under maxstorlek', () => {
    const file = makeFile('offert.pdf', 1024, 'application/pdf')
    const result = validateOfferAttachment(file)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.extension).toBe('pdf')
      expect(result.contentType).toBe('application/pdf')
    }
  })

  it('stoppar otillåtna filtyper med svenskt felmeddelande', () => {
    const file = makeFile('malware.exe', 1024, 'application/octet-stream')
    const result = validateOfferAttachment(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/Filtypen stöds inte/)
  })

  it('stoppar för stora filer med svenskt felmeddelande', () => {
    const file = makeFile('stor.pdf', OFFER_ATTACHMENT_MAX_BYTES + 1, 'application/pdf')
    const result = validateOfferAttachment(file)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/för stor/i)
  })
})

describe('uploadOfferAttachment', () => {
  it('laddar upp till leverantörens egen mapp och returnerar storage-path (inte publik URL)', async () => {
    uploadMock.mockResolvedValueOnce({ data: { path: 'ignored' }, error: null })
    const file = makeFile('Min Offert.pdf', 2048, 'application/pdf')

    const path = await uploadOfferAttachment('supplier-1', 'project-1', file)

    expect(fromStorageMock).toHaveBeenCalledWith('offer-attachments')
    expect(uploadMock).toHaveBeenCalledTimes(1)
    expect(path.startsWith('supplier-1/project-1/')).toBe(true)
    expect(path.endsWith('.pdf')).toBe(true)
    expect(path).not.toMatch(/^https?:\/\//)
  })

  it('blockerar otillåten filtyp innan upload', async () => {
    const file = makeFile('skadlig.exe', 100, 'application/octet-stream')

    await expect(uploadOfferAttachment('supplier-1', 'project-1', file)).rejects.toThrow(/Filtypen stöds inte/)
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('blockerar för stora filer innan upload', async () => {
    const file = makeFile('stor.pdf', OFFER_ATTACHMENT_MAX_BYTES + 1, 'application/pdf')

    await expect(uploadOfferAttachment('supplier-1', 'project-1', file)).rejects.toThrow(/för stor/i)
    expect(uploadMock).not.toHaveBeenCalled()
  })
})

describe('buildOfferAttachmentPath', () => {
  it('innehåller alltid leverantörens id som första mapp', () => {
    const file = makeFile('rapport.pdf', 10, 'application/pdf')
    const path = buildOfferAttachmentPath('supplier-1', 'project-1', file, 'pdf')
    expect(path.split('/')[0]).toBe('supplier-1')
    expect(path.split('/')[1]).toBe('project-1')
  })
})

describe('getOfferAttachmentSignedUrl', () => {
  it('skapar en tidsbegränsad signerad URL', async () => {
    createSignedUrlMock.mockResolvedValueOnce({ data: { signedUrl: 'https://signed/x' }, error: null })

    const url = await getOfferAttachmentSignedUrl('supplier/project/file.pdf', 60)

    expect(createSignedUrlMock).toHaveBeenCalledWith('supplier/project/file.pdf', 60)
    expect(url).toBe('https://signed/x')
  })
})
