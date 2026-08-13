import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Globe, ShoppingCart, Search, Megaphone, Smartphone, Palette, Mail, BarChart2 } from 'lucide-react'

const categories = [
  { icon: Globe, label: 'Webbutveckling', desc: 'Hemsidor, sajter, landningssidor', slug: 'webbutveckling', href: '/webbutveckling' },
  { icon: ShoppingCart, label: 'E-handel', desc: 'Shopify, WooCommerce och webbutiker', slug: 'ehandel', href: '/ehandel' },
  { icon: Search, label: 'SEO', desc: 'Teknisk SEO, innehåll och organisk synlighet', slug: 'seo', href: '/seo' },
  { icon: Megaphone, label: 'Digital marknadsföring', desc: 'Google Ads, Meta Ads och strategi', slug: 'digital-marknadsforing', href: '/digital-marknadsforing' },
  { icon: Smartphone, label: 'Apputveckling', desc: 'iOS, Android och cross-platform', slug: 'app-utveckling', href: '/app-utveckling' },
  { icon: Palette, label: 'Design & UX', desc: 'UI/UX, grafisk design och varumärke', slug: 'grafisk-design', href: '/grafisk-design' },
  { icon: Mail, label: 'E-postmarknadsföring', desc: 'Nyhetsbrev, automation och CRM', slug: 'e-postmarknadsforing', href: '/byraer/kategori/e-postmarknadsforing' },
  { icon: BarChart2, label: 'Analys & data', desc: 'Analytics, dashboards och mätning', slug: 'analys-data', href: '/byraer/kategori/analys-data' },
]

const CategoriesSection = () => {
  const reduce = useReducedMotion()

  return (
    <section className="py-16 md:py-20 border-b border-foreground/10" aria-labelledby="kategorier-rubrik">
      <div className="container">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 border border-foreground text-[11px] font-bold uppercase tracking-widest bg-secondary font-display mb-4">Digitala tjänster</span>
            <h2 id="kategorier-rubrik" className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1]">
              Börja i rätt kategori. <span className="text-accent">Finjustera i briefen.</span>
            </h2>
          </div>
          <p className="text-foreground/70 md:max-w-sm md:text-right leading-relaxed">
            Utforska pris, vanliga upplägg och byråer per tjänst – eller gå direkt till projektbriefen. Matchningen utgår från kategori och informationen i ditt uppdrag.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((category, index) => (
            <motion.div key={category.slug} initial={reduce ? undefined : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: index * 0.03 }}>
              <Link to={category.href} className="group flex h-full items-start gap-4 bg-card border border-foreground/15 p-5 hover:border-foreground hover:-translate-y-0.5 hover:shadow-sm transition-all">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-secondary border border-foreground/20 group-hover:border-foreground">
                  <category.icon className="w-5 h-5 text-foreground" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-base leading-tight">{category.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{category.desc}</p>
                  <span className="mt-3 inline-block text-xs font-semibold text-foreground underline underline-offset-4 opacity-70 group-hover:opacity-100">Utforska →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/byraer" className="text-sm font-semibold text-foreground underline underline-offset-4 hover:text-accent">Se alla byråer och kategorier</Link>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
