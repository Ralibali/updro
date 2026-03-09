import { motion } from 'framer-motion'
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_STYLES, NEW_CATEGORIES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

const CategoriesSection = () => {
  return (
    <section className="container py-20">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
        Vad behöver du hjälp med?
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.a
            key={cat}
            href={`/publicera?kategori=${encodeURIComponent(cat)}`}
            className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${CATEGORY_STYLES[cat]}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          >
            {NEW_CATEGORIES.has(cat) && (
              <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] px-1.5 py-0 border-0 hover:bg-orange-500">
                Nyhet!
              </Badge>
            )}
            <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
            <span className="font-display font-semibold text-sm text-center">{cat}</span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

export default CategoriesSection
