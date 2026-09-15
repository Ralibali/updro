import { describe, expect, it } from 'vitest'
import { domainFromWebsite, exportApprovedOutreachCsv, parseOpenOutreach } from '@/lib/openOutreach'

describe('OpenOutreach interchange', () => {
  it('parses quoted CSV, normalizes domains and deduplicates leads', () => {
    const input = 'email,first_name,last_name,company,title,website,linkedin_url,reason,lead_id,qualified_at\n"alex@example.com","Alex","A","Acme, AB","VD","acme.se","","Passar, tydligt","lead-1","2026-09-15"\n"alex@example.com","Alex","A","Acme AB","VD","https://acme.se","","Dubblett","lead-1","2026-09-15"'
    const leads = parseOpenOutreach(input)
    expect(leads).toHaveLength(1)
    expect(leads[0]).toMatchObject({ company: 'Acme, AB', email: 'alex@example.com', reason: 'Passar, tydligt' })
    expect(domainFromWebsite(leads[0].website)).toBe('acme.se')
  })

  it('accepts JSONL but rejects rows without a company website', () => {
    const leads = parseOpenOutreach('{"company":"Acme","website":"https://acme.test","reason":"Fit"}\n{"company":"No site"}')
    expect(leads).toHaveLength(1)
    expect(leads[0].email).toBeNull()
  })

  it('exports only addressable approved rows with safe CSV quoting', () => {
    const csv = exportApprovedOutreachCsv([{
      email: 'alex@example.com', first_name: 'Alex', last_name: null, company: 'Acme', title: 'VD',
      website: 'https://acme.test/', linkedin_url: null, reason: 'Bra "fit"', lead_id: '1', qualified_at: null,
      outreach_subject: 'Kort ämne', outreach_body: 'Hej, Alex',
    }, {
      email: null, first_name: null, last_name: null, company: 'No mail', title: null,
      website: 'https://nomail.test/', linkedin_url: null, reason: null, lead_id: '2', qualified_at: null,
      outreach_subject: 'Ämne', outreach_body: 'Text',
    }])
    expect(csv).toContain('"Bra ""fit"""')
    expect(csv).toContain('"Hej, Alex"')
    expect(csv).not.toContain('No mail')
  })
})
