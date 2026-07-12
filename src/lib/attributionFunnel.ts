export type StoredTouch = {
  source?: string | null
  medium?: string | null
  campaign?: string | null
  term?: string | null
  content?: string | null
  landing_path?: string | null
  referrer?: string | null
  timestamp?: string | null
} | null

export type AttributionRow = {
  project_id: string
  first_touch: StoredTouch
  latest_touch: StoredTouch
  projects?: { category: string | null } | null
}

export type AttributionBucket = { label: string; count: number }

const UNKNOWN = 'Okänd/organisk'

const bucketize = (values: Array<string | null | undefined>): AttributionBucket[] => {
  const counts = new Map<string, number>()
  for (const raw of values) {
    const label = raw && raw.trim().length ? raw.trim() : UNKNOWN
    counts.set(label, (counts.get(label) || 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'sv'))
}

const fieldOf = (touch: StoredTouch, key: keyof NonNullable<StoredTouch>): string | null => {
  if (!touch) return null
  const value = touch[key]
  return typeof value === 'string' ? value : null
}

export const groupAttributionRows = (rows: AttributionRow[], totalProjects: number) => {
  const known = rows.length
  const unknownProjects = Math.max(0, totalProjects - known)
  // Represent projects without attribution rows as unknown entries so the
  // buckets always account for the full project population.
  const fillers: Array<null> = Array(unknownProjects).fill(null)

  return {
    sources: bucketize([...rows.map(row => fieldOf(row.first_touch, 'source')), ...fillers]),
    mediums: bucketize([...rows.map(row => fieldOf(row.first_touch, 'medium')), ...fillers]),
    campaigns: bucketize([...rows.map(row => fieldOf(row.first_touch, 'campaign')), ...fillers]),
    landings: bucketize([...rows.map(row => fieldOf(row.first_touch, 'landing_path')), ...fillers]),
    categories: bucketize([...rows.map(row => row.projects?.category ?? null), ...fillers]),
    unknownProjects,
  }
}
