import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Bot,
  Code2,
  Globe,
  Megaphone,
  Palette,
  Search,
  ShoppingCart,
  Smartphone,
} from 'lucide-react'

const categories = [
  { icon: Globe, label: 'Webbutveckling', desc: 'Ny webbplats, landningssida eller modernisering', slug: 'webbutveckling' },
  { icon: ShoppingCart, label: 'E-handel', desc: 'Webbutik, konvertering, betalning och integrationer', slug: 'ehandel' },
  { icon: Search, label: 'SEO', desc: 'Bättre synlighet och fler relevanta besökare', slug: 'seo' },
  { icon: Megaphone, label: 'Digital marknadsföring', desc: 'Annonsering, strategi och löpande tillväxt', slug: 'digital-marknadsforing' },
  { icon: Smartphone, label: 'App-utveckling', desc: 'Mobilappar och digitala tjänster för iOS och Android', slug: 'app-utveckling' },
  { icon: Palette, label: 'Grafisk design/UX', desc: 'Varumärke, gränssnitt och bättre användarupplevelse', slug: 'grafisk-design' },
  { icon: Bot, label: 'AI-utveckling', desc: 'AI-assistenter, automationer och smartare arbetsflöden', slug: 'ai-utveckling' },
  { icon: Code2, label: 'Mjukvaruutveckling', desc: 'Interna system, integrationer och skräddarsydda lösningar', slug: 'mjukvaruutveckling' },
]

const CategoriesSection = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vad behöver du hjälp med?</p>
          <h2 className="font-display text-3xl text-foreground md:text-5xl">
            Hitta kompetensen som tar projektet vidare
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Välj området som ligger närmast ditt behov. Du kan beskriva detaljerna och kombinera flera behov i nästa steg.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/publicera?kategori=${encodeURIComponent(category.label)}`}
                className="group flex h-full min-h-[190px] flex-col rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground transition-transform duration-200 group-hover:scale-105">
                    <category.icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <span className="mt-6 font-display text-xl leading-tight text-foreground">{category.label}</span>
                <span className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.desc}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
