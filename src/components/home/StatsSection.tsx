import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { supabase } from '@/integrations/supabase/client'
import { isValidStats, resolveStats, type MarketplaceStats } from '@/lib/marketplaceStats'

const CountUp = ({ target, suffix, label }: { target: number; suffix: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const duration = 1400
    const start = performance.now()
    let frame: number
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduce, target])

  return (
    <div ref={ref}>
      <p className="font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground">
        {value.toLocaleString('sv-SE')}{suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

/**
 * Visar live-räknare från plattformen när marketplace-stats är deployerad
 * och volymen passerat tröskeln – annars plattformens löften, som alltid
 * är sanna. Misslyckad hämtning syns aldrig för besökaren.
 */
const StatsSection = () => {
  const reduce = useReducedMotion()
  const [liveStats, setLiveStats] = useState<MarketplaceStats | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.functions
      .invoke('marketplace-stats')
      .then(({ data }) => {
        if (!cancelled && isValidStats(data)) setLiveStats(data)
      })
      .catch(() => {
        /* Funktionen är inte deployerad ännu – fallback visas. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { stats, isLive } = resolveStats(liveStats)

  return (
    <section className="py-14 md:py-16 bg-background" aria-label="Nyckeltal">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={reduce ? undefined : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <CountUp target={stat.target} suffix={stat.suffix} label={stat.label} />
            </motion.div>
          ))}
        </div>
        {isLive && (
          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live-siffror från plattformen
          </p>
        )}
      </div>
    </section>
  )
}

export default StatsSection
