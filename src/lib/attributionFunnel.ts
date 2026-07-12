export type AttributionRow = {
  first_source: string | null
  first_medium: string | null
  first_campaign: string | null
  first_landing_path: string | null
  project_id: string
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

export const groupAttributionRows = (rows: AttributionRow[], totalProjects: number) => {
  const known = rows.length
  const unknownProjects = Math.max(0, totalProjects - known)
  // Represent projects without attribution rows as unknown entries so the
  // buckets always account for the full project population.
  const fillers = Array<null>(unknownProjects).fill(null)

  return {
    sources: bucketize([...rows.map(row => row.first_source), ...fillers]),
    mediums: bucketize([...rows.map(row => row.first_medium), ...fillers]),
    campaigns: bucketize([...rows.map(row => row.first_campaign), ...fillers]),
    landings: bucketize([...rows.map(row => row.first_landing_path), ...fillers]),
    categories: bucketize([...rows.map(row => row.projects?.category ?? null), ...fillers]),
    unknownProjects,
  }
}
