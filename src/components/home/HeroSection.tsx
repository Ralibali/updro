import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const HeroSection = () => {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/publicera${query ? `?beskrivning=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFF] to-[#EEF2FF] dark:from-background dark:to-background">
      {/* Subtle diagonal pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)',
      }} />

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* H1 */}
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[#111827] dark:text-foreground leading-[1.08]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Hitta rätt digital byrå
            <br />
            – på minuter, inte veckor
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Beskriv ditt projekt. Få upp till 5 offerter från kvalitetssäkrade digitala byråer inom 24 timmar. Helt gratis, helt utan förpliktelser.
          </motion.p>

          {/* Search form */}
          <motion.form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Beskriv ditt projekt kort – t.ex. 'Ny e-handelssajt i Shopify'"
              className="flex-1 h-14 rounded-xl text-base px-5 border-border bg-white dark:bg-card shadow-sm"
            />
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                type="submit"
                size="lg"
                className="h-14 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl px-8 text-base font-semibold shadow-md whitespace-nowrap"
              >
                Få offerter gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.form>

          {/* Social proof badges */}
          <motion.div
            className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              '100% gratis',
              'Svar inom 24h',
              'Kvalitetssäkrade byråer',
            ].map((text) => (
              <span key={text} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-brand-mint" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
