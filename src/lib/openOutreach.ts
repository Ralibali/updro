export interface OpenOutreachLead {
  email: string | null
  first_name: string | null
  last_name: string | null
  company: string
  title: string | null
  website: string
  linkedin_url: string | null
  reason: string | null
  lead_id: string | null
  qualified_at: string | null
}

export interface ApprovedOutreachLead extends OpenOutreachLead {
  outreach_subject: string
  outreach_body: string
}

const clean = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max)
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function websiteUrl(raw: unknown) {
  const value = clean(raw, 1000)
  if (!value) return ''
  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : ''
  } catch { return '' }
}

export function domainFromWebsite(raw: string) {
  try { return new URL(websiteUrl(raw)).hostname.toLowerCase().replace(/^www\./, '') }
  catch { return '' }
}

function csvRows(input: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    if (char === '"') {
      if (quoted && input[index + 1] === '"') { field += '"'; index += 1 }
      else quoted = !quoted
    } else if (char === ',' && !quoted) { row.push(field); field = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index += 1
      row.push(field); field = ''
      if (row.some(cell => cell.trim())) rows.push(row)
      row = []
    } else field += char
  }
  row.push(field)
  if (row.some(cell => cell.trim())) rows.push(row)
  return rows
}

function normalize(raw: Record<string, unknown>): OpenOutreachLead | null {
  const website = websiteUrl(raw.website ?? raw.website_url)
  const company = clean(raw.company ?? raw.company_name, 200)
  if (!website || !company) return null
  const emailValue = clean(raw.email ?? raw.contact_email, 320).toLowerCase()
  return {
    email: emailValue && EMAIL.test(emailValue) ? emailValue : null,
    first_name: clean(raw.first_name ?? raw.contact_first_name, 100) || null,
    last_name: clean(raw.last_name ?? raw.contact_last_name, 100) || null,
    company,
    title: clean(raw.title ?? raw.contact_title, 160) || null,
    website,
    linkedin_url: websiteUrl(raw.linkedin_url) || null,
    reason: clean(raw.reason ?? raw.fit_reason, 2000) || null,
    lead_id: clean(raw.lead_id ?? raw.provider_lead_id, 200) || null,
    qualified_at: clean(raw.qualified_at, 40) || null,
  }
}

export function parseOpenOutreach(input: string): OpenOutreachLead[] {
  const trimmed = input.trim()
  if (!trimmed) return []
  const candidates: Record<string, unknown>[] = []
  if (trimmed.startsWith('{')) {
    for (const line of trimmed.split(/\r?\n/).filter(Boolean)) {
      try { candidates.push(JSON.parse(line) as Record<string, unknown>) }
      catch { /* malformed JSONL rows are ignored */ }
    }
  } else if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) candidates.push(...parsed.filter(value => value && typeof value === 'object'))
    } catch { return [] }
  } else {
    const rows = csvRows(trimmed)
    const headers = (rows.shift() ?? []).map(header => header.trim().toLowerCase())
    for (const row of rows) candidates.push(Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])))
  }
  const deduped = new Map<string, OpenOutreachLead>()
  for (const candidate of candidates) {
    const lead = normalize(candidate)
    if (!lead) continue
    const key = lead.lead_id || lead.email || domainFromWebsite(lead.website)
    if (key && !deduped.has(key)) deduped.set(key, lead)
  }
  return [...deduped.values()]
}

const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function exportApprovedOutreachCsv(leads: ApprovedOutreachLead[]) {
  const headers = ['email', 'first_name', 'last_name', 'company', 'title', 'website', 'linkedin_url', 'reason', 'lead_id', 'qualified_at', 'subject', 'body']
  const rows = leads.filter(lead => Boolean(lead.email)).map(lead => [
    lead.email, lead.first_name, lead.last_name, lead.company, lead.title, lead.website,
    lead.linkedin_url, lead.reason, lead.lead_id, lead.qualified_at,
    lead.outreach_subject, lead.outreach_body,
  ])
  return [headers.map(csvCell).join(','), ...rows.map(row => row.map(csvCell).join(','))].join('\r\n')
}
