import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Clock3, WalletCards } from 'lucide-react'
import { PRICE_GUIDES, PRICE_MATRIX, PROJECT_TYPES, type LevelKey } from '@/lib/priceGuideData'
import { LEVEL_LABELS } from '@/lib/categoryPriceMap'
import { trackClick } from '@/hooks/usePageTracking'

const LEVELS: LevelKey[] = ['enkel', 'standard', 'avancerad']

interface PriceCalculatorSectionProps {
  /** Förvald projekttyp, t.ex. från kampanjsidans kategori. */
  defaultTypeId?: string
}

/**
 * Interaktiv prisindikator driven av samma data som /priser/:slug-sidorna.
 * Ger beställaren ett realistiskt spann innan publicering – något som
 * både höjer briefkvaliteten och sänker tröskeln att skicka in.
 */
const PriceCalculatorSection = ({ defaultTypeId }: PriceCalculatorSectionProps) => {
  const reduce = useReducedMotion()
  const initialType = PROJECT_TYPES.find(type => type.id === defaultTypeId) ?? PROJECT_TYPES[0]
  const [typeId, setTypeId] = useState(initialType.id)
  const [level, setLevel] = useState<LevelKey>('standard')

  const projectType = PROJECT_TYPES.find(type => type.id === typeId) ?? PROJECT_TYPES[0]
  const cell = PRICE_MATRIX[projectType.id]?.[level]
  const guide = useMemo(
    () => PRICE_GUIDES.find(g => g.slug === projectType.guideSlug),
    [projectType],
  )
  const levelCopy = guide?.levels.find(l => l.level === level)

  const briefSeed = `Jag behöver hjälp med ${projectType.query.toLowerCase()} (${LEVEL_LABELS[level].toLowerCase()} nivå). `
  const publishUrl = `/publicera?beskrivning=${encodeURIComponent(briefSeed)}`

  return (
    <section className="py-16 md:py-20 bg-secondary border-b-2 border-foreground" aria-labelledby="priskalkylator-rubrik">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Prisindikator</p>
          <h2 id="priskalkylator-rubrik" className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground [text-wrap:balance]">
            Se vad det borde kosta – <span className="text-accent">innan du skickar.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Riktvärden från Updros prisguide, baserade på vad svenska byråer faktiskt tar.
            Exakt pris får du i offerterna.
          </p>
        </div>

        <div className="mt-10 max-w-3xl mx-auto border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))]">
          <div className="p-5 md:p-7 border-b-2 border-foreground">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Vad behöver du?</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Välj projekttyp">
              {PROJECT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={typeId === type.id}
                  onClick={() => setTypeId(type.id)}
                  className={`px-4 py-2 text-sm font-semibold border-2 border-foreground transition-colors ${
                    typeId === type.id
                      ? 'bg-foreground text-background'
                      : 'bg-background hover:bg-secondary'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <p className="mt-6 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Vilken nivå passar?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Välj omfattning">
              {LEVELS.map(levelKey => (
                <button
                  key={levelKey}
                  type="button"
                  aria-pressed={level === levelKey}
                  onClick={() => setLevel(levelKey)}
                  className={`px-4 py-3 text-left border-2 border-foreground transition-colors ${
                    level === levelKey
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-background hover:bg-secondary'
                  }`}
                >
                  <span className="block font-display font-bold text-sm uppercase tracking-wide">{LEVEL_LABELS[levelKey]}</span>
                </button>
              ))}
            </div>
            {levelCopy && (
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{levelCopy.label} brukar innebära:</span> {levelCopy.includes}
              </p>
            )}
          </div>

          <motion.div
            key={`${typeId}-${level}`}
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 md:p-7 bg-background"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ungefärligt pris</p>
                  <p className="mt-1 font-display text-2xl md:text-3xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {cell?.range ?? '–'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-5 w-5 text-accent shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Typisk tidsplan</p>
                  <p className="mt-1 font-display text-2xl md:text-3xl font-bold text-foreground">{cell?.time ?? '–'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <Link
                to={publishUrl}
                onClick={() => trackClick('price_calculator_cta', 'Få exakta offerter', { project_type: typeId, level })}
                className="inline-flex h-12 items-center justify-center gap-2 px-6 bg-accent text-accent-foreground font-display font-bold uppercase tracking-wide text-sm border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:bg-[hsl(14_75%_50%)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                Få exakta offerter – gratis <ArrowRight className="h-4 w-4" />
              </Link>
              {guide && (
                <Link to={`/priser/${guide.slug}`} className="text-sm font-semibold text-foreground underline underline-offset-4 hover:text-accent">
                  Läs hela prisguiden för {guide.serviceLabel}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default PriceCalculatorSection
