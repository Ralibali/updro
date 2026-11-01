import { describe, expect, it } from 'vitest'
import { hasCronSecret } from '../../../supabase/functions/_shared/auth.ts'
import { composeNotificationEmail, notificationUrl, swedishCount } from '../../../supabase/functions/_shared/notification-email.ts'

describe('composeNotificationEmail', () => {
  it('renders one notification with its own call to action and deep link', () => {
    const email = composeNotificationEmail({
      recipientName: 'Anna Svensson',
      items: [{ type: 'new_offer', title: 'Du har fått en ny offert', message: 'En byrå har skickat en offert på "Ny webbplats".', link: '/dashboard/buyer/uppdrag/abc' }],
    })
    expect(email.subject).toBe('Du har fått en ny offert')
    expect(email.text).toContain('Hej Anna!')
    expect(email.text).toContain('Se offerten: https://updro.se/dashboard/buyer/uppdrag/abc')
    expect(email.html).toContain('href="https://updro.se/dashboard/buyer/uppdrag/abc"')
  })

  it('collects several events into one digest and writes small counts as words', () => {
    const email = composeNotificationEmail({
      items: [
        { type: 'new_offer', title: 'Du har fått en ny offert', link: '/dashboard/buyer/uppdrag/a' },
        { type: 'project_closed', title: 'Ditt uppdrag har fått max antal offerter', link: '/dashboard/buyer/uppdrag/a' },
      ],
    })
    expect(email.subject).toBe('Du har två nya händelser på Updro')
    expect(email.text).toContain('Hej!')
    expect(email.text).toContain('Ditt uppdrag har fått max antal offerter')
  })

  it('escapes user-controlled text and refuses links that leave Updro', () => {
    const email = composeNotificationEmail({
      recipientName: '<script>',
      items: [{ type: 'new_message', title: 'Nytt meddelande från <b>Acme</b>', message: '"><img src=x onerror=alert(1)>', link: 'https://evil.example/phish' }],
    })
    expect(email.html).not.toContain('<b>Acme</b>')
    expect(email.html).not.toContain('<img')
    expect(email.html).not.toContain('evil.example')
    expect(email.text).toContain('https://updro.se/logga-in')
  })

  it('caps very long digests and says how many are left out', () => {
    const items = Array.from({ length: 12 }, (_, index) => ({ type: 'new_message', title: `Meddelande ${index}`, link: '/dashboard/buyer/chatt' }))
    const email = composeNotificationEmail({ items })
    expect(email.subject).toBe('Du har 12 nya händelser på Updro')
    expect(email.text).toContain('…och två till.')
    expect(email.text).not.toContain('Meddelande 11')
  })
})

describe('notification helpers', () => {
  it('keeps relative links inside the site', () => {
    expect(notificationUrl('/dashboard/supplier/offerter')).toBe('https://updro.se/dashboard/supplier/offerter')
    expect(notificationUrl('//evil.example')).toBe('https://updro.se/logga-in')
    expect(notificationUrl(null)).toBe('https://updro.se/logga-in')
  })

  it('writes numbers under twelve in Swedish', () => {
    expect(swedishCount(3)).toBe('tre')
    expect(swedishCount(11)).toBe('elva')
    expect(swedishCount(12)).toBe('12')
  })
})

describe('hasCronSecret', () => {
  const headers = (values: Record<string, string>) => new Headers(values)

  it('accepts any configured secret in the cron header or as bearer token', () => {
    expect(hasCronSecret(headers({ 'x-cron-secret': 'two' }), ['one', 'two'])).toBe(true)
    expect(hasCronSecret(headers({ Authorization: 'Bearer one' }), ['one', undefined])).toBe(true)
  })

  it('never matches when nothing is configured or the value differs', () => {
    expect(hasCronSecret(headers({ 'x-cron-secret': '' }), [undefined, null, ''])).toBe(false)
    expect(hasCronSecret(headers({ 'x-cron-secret': 'guess' }), ['one'])).toBe(false)
    expect(hasCronSecret(headers({}), ['one'])).toBe(false)
  })
})
