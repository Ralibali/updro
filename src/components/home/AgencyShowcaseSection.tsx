import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, MapPin } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { categoryLabel } from '@/lib/constants'

type ShowcaseAgency = {
  id: string
  slug: string
  company_name: string
  city: string | null
  categories: string[] | null
  logo_url: string | null
  avatar_url: string | null
}

/** Below this many verified agencies the section would undersell the marketplace. */
export const MIN_SHOWCASE_AGENCIES = 3
const MAX_SHOWCASE_AGENCIES = 8

const initials = (name: string) =>
  name.split(/\s+/).filter(word => /^[\p{L}\p{N}]/u.test(word)).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'U'

/** Real, verified agency profiles as social proof. Renders nothing until there are enough. */
export default function AgencyShowcaseSection() {
  const [agencies, setAgencies] = useState<ShowcaseAgency[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_agencies')
          .eq('is_verified', true)
          .order('completed_projects', { ascending: false })
          .order('id')
          .limit(24)
        if (error || !active) return
        setAgencies((data || [])
          .filter(agency => agency.slug && agency.company_name?.trim())
          .slice(0, MAX_SHOWCASE_AGENCIES)
          .map(agency => ({
            id: agency.id,
            slug: agency.slug,
            company_name: agency.company_name.trim(),
            city: agency.city?.trim() || null,
            categories: agency.categories,
            logo_url: agency.logo_url || null,
            avatar_url: agency.avatar_url || null,
          })))
      } catch {
        // Social proof is optional; the page works without it.
      }
    }
    void load()
    return () => { active = false }
  }, [])

  if (agencies.length < MIN_SHOWCASE_AGENCIES) return null

  return (
    <section className="agency-showcase container" aria-labelledby="agency-showcase-title">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Verifierade byråer på Updro</div>
          <h2 id="agency-showcase-title">Riktiga byråer. Granskade profiler.</h2>
        </div>
        <Link to="/byraer" className="text-link">
          Se alla byråer <ArrowRight />
        </Link>
      </div>
      <ul className="agency-showcase-grid">
        {agencies.map(agency => {
          const image = agency.logo_url || agency.avatar_url
          const category = agency.categories?.[0]
          return (
            <li key={agency.id}>
              <Link to={`/byra/${agency.slug}`} className="agency-showcase-card">
                <span className="agency-showcase-mark" aria-hidden="true">
                  {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : initials(agency.company_name)}
                </span>
                <span className="agency-showcase-body">
                  <span className="agency-showcase-name">
                    {agency.company_name}
                    <BadgeCheck aria-label="Verifierad byrå" />
                  </span>
                  <span className="agency-showcase-meta">
                    {category && <span>{categoryLabel(category)}</span>}
                    {agency.city && <span><MapPin aria-hidden="true" />{agency.city}</span>}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
