import { motion } from 'framer-motion'
import { CATEGORY_STYLES, BUDGET_LABELS, CATEGORY_COVER_IMAGES, MAX_OFFERS_PER_PROJECT } from '@/lib/constants'
import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SlotsLeftIndicator from '@/components/SlotsLeftIndicator'
import VerificationBadges from '@/components/VerificationBadges'

// Mock data until Supabase is connected
const mockProjects = [
  { id: '1', title: 'Ny webbplats för advokatbyrå', category: 'Webbutveckling', budget_range: '50k_150k', city: 'Stockholm', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), offer_count: 3, max_offers: 5, is_bankid_verified: true, is_phone_verified: true },
  { id: '2', title: 'E-handelslösning med Shopify', category: 'E-handel', budget_range: '10k_50k', city: 'Göteborg', created_at: new Date(Date.now() - 3600000 * 5).toISOString(), offer_count: 4, max_offers: 5, is_bankid_verified: false, is_phone_verified: true },
  { id: '3', title: 'Google Ads-kampanj för startup', category: 'Digital marknadsföring', budget_range: 'under_10k', city: 'Malmö', created_at: new Date(Date.now() - 3600000 * 8).toISOString(), offer_count: 1, max_offers: 5, is_bankid_verified: true, is_phone_verified: false },
  { id: '4', title: 'UX-redesign av mobilapp', category: 'Grafisk design/UX', budget_range: '10k_50k', city: 'Uppsala', created_at: new Date(Date.now() - 3600000 * 12).toISOString(), offer_count: 5, max_offers: 5, is_bankid_verified: false, is_phone_verified: false },
  { id: '5', title: 'SEO-audit och optimering', category: 'SEO', budget_range: 'under_10k', city: 'Linköping', created_at: new Date(Date.now() - 3600000 * 18).toISOString(), offer_count: 0, max_offers: 5, is_bankid_verified: true, is_phone_verified: true },
  { id: '6', title: 'AI-chatbot för kundservice', category: 'AI-utveckling', budget_range: 'over_150k', city: 'Stockholm', created_at: new Date(Date.now() - 3600000 * 24).toISOString(), offer_count: 2, max_offers: 5, is_bankid_verified: false, is_phone_verified: true },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just nu'
  if (hours < 24) return `${hours} timmar sedan`
  return `${Math.floor(hours / 24)} dagar sedan`
}

const LatestProjectsSection = () => {
  return (
    <section className="container py-20">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
        Senaste publicerade uppdrag
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockProjects.map((project, i) => {
          const slotsLeft = (project.max_offers || MAX_OFFERS_PER_PROJECT) - (project.offer_count || 0)
          const isClosed = slotsLeft <= 0
          const coverImage = CATEGORY_COVER_IMAGES[project.category]

          return (
            <motion.div
              key={project.id}
              className={`rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${isClosed ? 'opacity-60' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              {/* Dark cover image with gradient overlay */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={coverImage}
                  alt={project.category}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[project.category] || ''}`}>
                    {project.category}
                  </span>
                  <h3 className="font-display font-semibold text-white text-sm mt-1.5 line-clamp-2 drop-shadow-sm">{project.title}</h3>
                </div>
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col flex-1 bg-card">
                {/* Verification badges */}
                <VerificationBadges
                  isBankIdVerified={project.is_bankid_verified}
                  isPhoneVerified={project.is_phone_verified}
                />

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>{BUDGET_LABELS[project.budget_range]}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.city}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t mt-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{timeAgo(project.created_at)}
                    </span>
                    <SlotsLeftIndicator slotsLeft={slotsLeft} />
                  </div>
                  {!isClosed && (
                    <Link to="/registrera/byra">
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 text-xs">
                        Svara <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="text-center mt-10">
        <Link to="/byraer" className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1">
          Se alla uppdrag <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export default LatestProjectsSection
