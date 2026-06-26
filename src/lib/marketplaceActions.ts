import { supabase } from '@/integrations/supabase/client'

export type UnlockResult = {
  already_unlocked: boolean
  credits_left: number
}

export const unlockProject = async (projectId: string): Promise<UnlockResult> => {
  const { data, error } = await (supabase as any).rpc('unlock_project_for_supplier', {
    p_project_id: projectId,
  })

  if (error) throw error
  return data as UnlockResult
}

export type SubmitOfferInput = {
  projectId: string
  title: string
  description: string
  price: number
  deliveryWeeks: number | null
  paymentPlan: string
  attachmentUrl: string | null
}

export const submitProjectOffer = async (input: SubmitOfferInput): Promise<string> => {
  const { data, error } = await (supabase as any).rpc('submit_project_offer', {
    p_project_id: input.projectId,
    p_title: input.title,
    p_description: input.description,
    p_price: input.price,
    p_delivery_weeks: input.deliveryWeeks,
    p_payment_plan: input.paymentPlan,
    p_attachment_url: input.attachmentUrl,
  })

  if (error) throw error
  return data as string
}

export const OFFER_ATTACHMENT_BUCKET = 'offer-attachments'
export const OFFER_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024

export const OFFER_ATTACHMENT_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export const OFFER_ATTACHMENT_ALLOWED_EXTENSIONS = Object.keys(OFFER_ATTACHMENT_MIME_TYPES)

export const OFFER_ATTACHMENT_ACCEPT = OFFER_ATTACHMENT_ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')

export type AttachmentValidation =
  | { ok: true; extension: string; contentType: string }
  | { ok: false; error: string }

export const validateOfferAttachment = (file: File): AttachmentValidation => {
  if (file.size > OFFER_ATTACHMENT_MAX_BYTES) {
    return { ok: false, error: 'Filen är för stor. Max 10 MB tillåts.' }
  }
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const mapped = OFFER_ATTACHMENT_MIME_TYPES[extension]
  if (!mapped) {
    return { ok: false, error: 'Filtypen stöds inte. Använd PDF, DOC, DOCX, JPG eller PNG.' }
  }
  return { ok: true, extension, contentType: file.type || mapped }
}

const safeBaseName = (name: string) =>
  name
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'bilaga'

const randomToken = () => {
  const cryptoApi: Crypto | undefined =
    typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID().replace(/-/g, '').slice(0, 16)
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

export const buildOfferAttachmentPath = (
  supplierId: string,
  projectId: string,
  file: File,
  extension: string,
) => {
  const base = safeBaseName(file.name)
  return `${supplierId}/${projectId}/${Date.now()}-${randomToken()}-${base}.${extension}`
}

export const uploadOfferAttachment = async (
  supplierId: string,
  projectId: string,
  file: File,
): Promise<string> => {
  const validation = validateOfferAttachment(file)
  if (!validation.ok) throw new Error(validation.error)
  const ok = validation as Extract<AttachmentValidation, { ok: true }>

  const path = buildOfferAttachmentPath(supplierId, projectId, file, ok.extension)
  const { error } = await supabase.storage
    .from(OFFER_ATTACHMENT_BUCKET)
    .upload(path, file, { contentType: ok.contentType, upsert: false })
  if (error) throw error
  return path
}

export const getOfferAttachmentSignedUrl = async (
  path: string,
  expiresInSeconds = 60 * 10,
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(OFFER_ATTACHMENT_BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  if (!data?.signedUrl) throw new Error('Kunde inte skapa signerad länk.')
  return data.signedUrl
}
