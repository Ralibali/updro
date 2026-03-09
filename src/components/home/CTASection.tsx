import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, Calendar, CreditCard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const items = [
  { icon: Gift, text: 'Fem gratis leads direkt vid registrering' },
  { icon: Calendar, text: 'Sju dagars gratis premium' },
  { icon: CreditCard, text: 'Inget kreditkort krävs' },
]

const CTASection = () => {
  return (
    <section className="py-20">
      <motion.div
        className="container text-center max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
          Byrå? Prova gratis i sju dagar.
        </h2>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-foreground/80">
              <item.icon className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        <Link to="/registrera/byra">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-6 text-base font-semibold shadow-blue transition-all active:scale-[0.98]">
            Registrera din byrå gratis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        
      </motion.div>
    </section>
  )
}

export default CTASection
