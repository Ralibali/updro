import { motion } from 'framer-motion'
import { CATEGORY_STYLES, BUDGET_LABELS } from '@/lib/constants'
import { Link } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock data until Supabase is connected
const mockProjects = [
  { id: '1', title: 'Ny webbplats för advokatbyrå', category: 'Webbutveckling', budget_range: '50k_150k', city: 'Stockholm', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '2', title: 'E-handelslösning med Shopify', category: 'E-handel', budget_range: '10k_50k', city: 'Göteborg', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '3', title: 'Google Ads-kampanj för startup', category: 'Digital marknadsföring', budget_range: 'under_10k', city: 'Malmö', created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: '4', title: 'UX-redesign av mobilapp', category: 'Grafisk design/UX', budget_range: '10k_50k', city: 'Uppsala', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: '5', title: 'SEO-audit och optimering', category: 'SEO', budget_range: 'under_10k', city: 'Linköping', created_at: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: '6', title: 'iOS & Android-app för restaurang', category: 'App-utveckling', budget_range: 'over_150k', city: 'Stockholm', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
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
        {mockProjects.map((project, i) => (
          <motion.div
            key={project.id}
            className="bg-card rounded-2xl border p-5 hover:shadow-md transition-all duration-200 flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <span className={`inline-block self-start rounded-full px-3 py-1 text-xs font-semibold mb-3 ${CATEGORY_STYLES[project.category] || ''}`}>
              {project.category}
            </span>
            <h3 className="font-display font-semibold text-foreground mb-3 line-clamp-2">{project.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
              <span>{BUDGET_LABELS[project.budget_range]}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{project.city}</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />{timeAgo(project.created_at)}
              </span>
              <Link to="/registrera/byra">
                <Button size="sm" variant="ghost" className="text-brand-blue hover:text-brand-blue-hover text-xs">
                  Svara på uppdraget <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/byraer" className="text-brand-blue hover:text-brand-blue-hover font-medium text-sm inline-flex items-center gap-1">
          Se alla uppdrag <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

export default LatestProjectsSection
