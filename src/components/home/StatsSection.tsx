import { motion } from 'framer-motion'

const stats = [
  { value: '300+', label: 'Registrerade byråer' },
  { value: '1 800+', label: 'Genomförda projekt' },
  { value: '4,8 ★', label: 'Genomsnittligt betyg' },
  { value: '299 kr', label: 'Lägsta lead-pris' },
]

const StatsSection = () => {
  return (
    <section className="bg-foreground py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="font-display text-3xl md:text-4xl font-extrabold text-primary-foreground">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-primary-foreground/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
