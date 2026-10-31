// Renders the e-mail for one or several in-app notifications. Free of Deno
// APIs so the frontend test suite can exercise it.
import { safeRelativeLink } from './push-link.ts'

export type NotificationEmailItem = {
  type: string
  title: string
  message?: string | null
  link?: string | null
}

export const EMAILED_NOTIFICATION_TYPES = [
  'new_offer', 'offer_accepted', 'offer_declined', 'project_closed',
  'agreement_update', 'new_message', 'offer_reminder',
] as const

const BRAND = '#1851C3'
const TEXT = '#122B40'
const MUTED = '#5B6B7A'
const SWEDISH_WORDS = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva']
const MAX_ITEMS = 10

const ACTION_LABELS: Record<string, string> = {
  new_offer: 'Se offerten',
  offer_accepted: 'Öppna din offert',
  offer_declined: 'Se dina offerter',
  project_closed: 'Öppna uppdraget',
  agreement_update: 'Granska avtalet',
  new_message: 'Läs och svara',
  offer_reminder: 'Jämför offerterna',
}

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
}[character] || character))

const oneLine = (value: string | null | undefined) => (value || '').replace(/\s+/g, ' ').trim()

export const swedishCount = (n: number) => (Number.isInteger(n) && n >= 0 && n < 12 ? SWEDISH_WORDS[n] : String(n))

export function notificationUrl(link: string | null | undefined, siteUrl = 'https://updro.se') {
  return `${siteUrl}${safeRelativeLink(link, '/logga-in')}`
}

export function composeNotificationEmail(input: {
  recipientName?: string | null
  items: NotificationEmailItem[]
  siteUrl?: string
}) {
  const siteUrl = input.siteUrl || 'https://updro.se'
  const items = input.items.slice(0, MAX_ITEMS).map(item => ({
    type: item.type,
    title: oneLine(item.title).slice(0, 150) || 'Ny händelse på Updro',
    message: oneLine(item.message).slice(0, 400),
    url: notificationUrl(item.link, siteUrl),
    action: ACTION_LABELS[item.type] || 'Öppna Updro',
  }))
  if (!items.length) throw new Error('composeNotificationEmail needs at least one item')

  const firstName = oneLine(input.recipientName).split(' ')[0]
  const greeting = firstName ? `Hej ${firstName}!` : 'Hej!'
  const single = items.length === 1
  const count = input.items.length
  const subject = single ? items[0].title : `Du har ${swedishCount(count)} nya händelser på Updro`
  const intro = single ? '' : `Här är det senaste som hänt i dina uppdrag på Updro.`
  const footer = 'Du får det här mejlet eftersom du har ett pågående uppdrag eller en offert på Updro. Du hittar alla händelser under klockan när du är inloggad.'
  const more = count > items.length ? `…och ${swedishCount(count - items.length)} till. Logga in för att se allt.` : ''

  const text = [
    greeting,
    '',
    ...(intro ? [intro, ''] : []),
    ...items.flatMap(item => [item.title, ...(item.message ? [item.message] : []), `${item.action}: ${item.url}`, '']),
    ...(more ? [more, ''] : []),
    'Vänliga hälsningar',
    'Updro',
    '',
    footer,
  ].join('\n')

  const button = (label: string, url: string) =>
    `<a href="${escapeHtml(url)}" style="background:${BRAND};color:#ffffff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(label)}</a>`
  const blocks = items.map(item => single
    ? `<h1 style="color:${TEXT};font-size:22px;line-height:1.3;margin:0 0 12px">${escapeHtml(item.title)}</h1>
       ${item.message ? `<p style="margin:0 0 20px">${escapeHtml(item.message)}</p>` : ''}
       <p style="margin:24px 0">${button(item.action, item.url)}</p>
       <p style="color:${MUTED};font-size:13px">Om knappen inte fungerar, klistra in länken i webbläsaren:<br>${escapeHtml(item.url)}</p>`
    : `<div style="border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:0 0 12px">
         <p style="font-weight:600;margin:0 0 6px">${escapeHtml(item.title)}</p>
         ${item.message ? `<p style="margin:0 0 12px;color:${MUTED}">${escapeHtml(item.message)}</p>` : ''}
         <a href="${escapeHtml(item.url)}" style="color:${BRAND};font-weight:600">${escapeHtml(item.action)} →</a>
       </div>`).join('')

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:${TEXT};line-height:1.5">
    <p style="font-size:18px;font-weight:700;margin:0 0 24px"><span style="color:${TEXT}">upd</span><span style="color:${BRAND}">ro</span></p>
    <p>${escapeHtml(greeting)}</p>
    ${intro ? `<p>${escapeHtml(intro)}</p>` : ''}
    ${blocks}
    ${more ? `<p style="color:${MUTED}">${escapeHtml(more)}</p>` : ''}
    <p style="margin-top:28px">Vänliga hälsningar<br>Updro</p>
    <p style="color:${MUTED};font-size:12px;margin-top:32px">${escapeHtml(footer)}</p>
  </div>`

  return { subject: subject.slice(0, 150), text, html }
}
