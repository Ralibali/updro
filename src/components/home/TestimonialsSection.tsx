import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: 'Vi fick vår första kund via Updro redan dag tre. Äntligen en plattform där beställarna faktiskt svarar!',
    name: 'Fredrik L.',
    title: 'VD, Webbninja AB',
    rating: 5,
  },
  {
    quote: 'Kvaliteten på leads är fantastisk. Seriösa beställare med riktiga budgetar – inte tirejägare.',
    name: 'Anna S.',
    title: 'Grundare, Pixelcraft',
    rating: 5,
  },
  {
    quote: 'Vi sparar tio timmar i veckan på prospektering. Updro levererar färdiga leads direkt till dashboarden.',
    name: 'Marcus K.',
    title: 'COO, Digiflow',
    rating: 5,
  },
]

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Vad byråer säger om Updro
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Hundratals byråer använder redan Updro för att hitta kvalificerade uppdrag.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="bg-card rounded-2xl border p-6 shadow-sm flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 italic flex-1 leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-4 pt-4 border-t">
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
