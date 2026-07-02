import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Globe, ShoppingCart, Search, Megaphone,
  Smartphone, Palette, Mail, BarChart2,
} from 'lucide-react'

const categories = [
  { icon: Globe, label: 'Webbutveckling', desc: 'Hemsidor, sajter, landningssidor', slug: 'webbutveckling' },
  { icon: ShoppingCart, label: 'E-handel', desc: 'Shopify, WooCommerce, Magento', slug: 'ehandel' },
  { icon: Search, label: 'SEO & sökmotoroptimering', desc: 'Organisk synlighet på Google', slug: 'seo' },
  { icon: Megaphone, label: 'Digital marknadsföring', desc: 'Meta Ads, Google Ads, sociala medier', slug: 'digital-marknadsforing' },
  { icon: Smartphone, label: 'Apputveckling', desc: 'iOS, Android, React Native', slug: 'app-utveckling' },
  { icon: Palette, label: 'Design & UX', desc: 'Grafisk profil, UI/UX, varumärke', slug: 'grafisk-design' },
  { icon: Mail, label: 'E-postmarknadsföring', desc: 'Nyhetsbrev, automation, CRM', slug: 'e-postmarknadsforing' },
  { icon: BarChart2, label: 'Analys & data', desc: 'Google Analytics, dashboards, BI', slug: 'analys-data' },
]

const CategoriesSection = () => {
  return (
    <section className="py-20 md:py-28 border-b border-foreground/10">
      <div className="container">
        <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 border border-foreground text-[11px] font-bold uppercase tracking-widest bg-secondary font-display mb-4">
              Alla kategorier
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
              Hitta rätt byrå för{' '}
              <span className="text-accent">ditt uppdrag</span>
            </h2>
          </div>
          <p className="text-foreground/70 md:max-w-xs md:text-right">
            Välj kategori – vi matchar dig automatiskt med byråer som redan levererat liknande projekt.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <Link
                to={`/publicera?kategori=${encodeURIComponent(cat.label)}`}
                className="group flex h-full flex-col gap-4 bg-secondary border-2 border-foreground p-6 hover:bg-foreground hover:text-background transition-colors duration-200"
              >
                <div className="w-11 h-11 flex items-center justify-center bg-background border-2 border-foreground">
                  <cat.icon className="w-5 h-5 text-foreground" strokeWidth={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base leading-tight">{cat.label}</h3>
                  <p className="text-xs opacity-70 leading-snug">{cat.desc}</p>
                </div>
                <span className="mt-auto text-[11px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">
                  0{i + 1} →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
