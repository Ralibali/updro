import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface DirectoryAgency {
  id: string
  slug: string | null
  bio: string | null
  categories: string[] | null
  avg_rating: number | null
  review_count: number | null
  completed_projects: number | null
  is_verified: boolean | null
  has_fskatt: boolean | null
  credit_check_passed: boolean | null
  profiles: { full_name: string | null; company_name: string | null; city: string | null; avatar_url: string | null } | null
}

export function useAgencyDirectory({ city, category }: { city?: string; category?: string } = {}) {
  const [agencies, setAgencies] = useState<DirectoryAgency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    setAgencies([])
    const load = async () => {
      try {
        const result: DirectoryAgency[] = []
        const pageSize = 100
        // Fetch all pages before local city filtering so a city is not lost
        // because other cities happened to fill the first response.
        for (let from = 0; ; from += pageSize) {
          let query = supabase.rpc('get_public_agencies')
            .order('avg_rating', { ascending: false }).order('id')
            .range(from, from + pageSize - 1)
          if (category) query = query.contains('categories', [category])
          const { data, error: queryError } = await query
          if (!active) return
          if (queryError) throw queryError
          result.push(...(data || []).map(agency => ({ ...agency, has_fskatt: null, credit_check_passed: null,
            profiles: { full_name: null, company_name: agency.company_name, city: agency.city, avatar_url: agency.avatar_url }
          })))
          if (!data || data.length < pageSize) break
        }
        const cityName = city?.trim().toLocaleLowerCase('sv-SE')
        setAgencies(result.filter(agency => agency.slug && (!cityName || agency.profiles?.city?.trim().toLocaleLowerCase('sv-SE') === cityName)))
      } catch {
        if (active) setError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [city, category, attempt])

  return { agencies, loading, error, retry: () => setAttempt(value => value + 1) }
}
