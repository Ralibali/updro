import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: 'Fick tre relevanta offerter inom ett dygn. Valde en byrå i Göteborg som levererade perfekt.',
    name: 'Erik S.',
    title: 'E-handelsföretag',
  },
  {
    quote: 'Som liten byrå får vi nu förfrågningar vi aldrig hade hittat själva.',
    name: 'Sara L.',
    title: 'Digital byrå Stockholm',
  },
  {
    quote: 'Sparade minst två veckor av research. Updro matchade oss med rätt partners direkt.',
    name: 'Marcus K.',
    title: 'Startup Malmö',
  },
]

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[#F8FAFF] dark:bg-muted/20">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Vad våra användare säger
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-brand-orange text-brand-orange" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 italic flex-1 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
