import type { Profile, SupplierProfile } from '@/types'

export type MatchableProject = {
  category?: string | null
  title?: string | null
  description?: string | null
  city?: string | null
  start_time?: string | null
  lead_score?: number | null
}

const normalize = (value: string | null | undefined) =>
  (value || '')
    .toLocaleLowerCase('sv-SE')
    .normalize('NFKD')
    .replace(/[^a-z0-9åäö]+/g, ' ')
    .trim()

export const scoreProjectMatch = (
  project: MatchableProject,
  supplier: SupplierProfile | null,
  profile?: Profile | null,
) => {
  let score = 0
  const reasons: string[] = []
  const category = normalize(project.category)
  const supplierCategories = (supplier?.categories || []).map(normalize)

  if (category && supplierCategories.includes(category)) {
    score += 60
    reasons.push('Matchar er huvudkategori')
  }

  const projectText = normalize(`${project.title || ''} ${project.description || ''}`)
  const matchingServices = (supplier?.services || [])
    .map(normalize)
    .filter(service => service.length >= 3 && projectText.includes(service))

  if (matchingServices.length > 0) {
    score += Math.min(20, matchingServices.length * 7)
    reasons.push('Matchar era tjänster')
  }

  if (profile?.city && project.city && normalize(profile.city) === normalize(project.city)) {
    score += 10
    reasons.push('Samma ort')
  }

  const qualityBonus = Math.min(10, Math.round((project.lead_score || 0) / 10))
  if (qualityBonus > 0) score += qualityBonus

  if (project.start_time === 'asap' || project.start_time === 'within_month') {
    score += 5
    reasons.push('Nära start')
  }

  return {
    score: Math.min(100, score),
    reasons,
  }
}

export const matchLabel = (score: number) => {
  if (score >= 75) return 'Mycket stark matchning'
  if (score >= 55) return 'Stark matchning'
  if (score >= 30) return 'Möjlig matchning'
  return 'Övrigt uppdrag'
}
