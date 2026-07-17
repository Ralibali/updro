import { motion, useReducedMotion } from 'framer-motion'
import { Check, Minus, X } from 'lucide-react'
import { Link } from 'react-router-dom'

type CellValue = 'yes' | 'no' | 'partial' | string

interface ComparisonRow {
  label: string
  updro: CellValue
  marketplaces: CellValue
  diy: CellValue
}

/**
 * Ärlig jämförelse: konkurrentkolumnen får plus där det stämmer
 * (de är också gratis för beställare) – det gör tabellen trovärdig.
 */
const ROWS: ComparisonRow[] = [
  {
    label: 'Antal byråer som kan kontakta dig',
    updro: 'Högst 3',
    marketplaces: 'Ofta 5–6',
    diy: 'Alla du själv hinner ringa',
  },
  {
    label: 'Briefen granskas innan den publiceras',
    updro: 'yes',
    marketplaces: 'no',
    diy: 'no',
  },
  {
    label: 'Prisspann innan du skickar förfrågan',
    updro: 'yes',
    marketplaces: 'no',
    diy: 'no',
  },
  {
    label: 'Kontaktuppgifter delas bara med byråer som aktivt valt ditt uppdrag',
    updro: 'yes',
    marketplaces: 'no',
    diy: 'partial',
  },
  {
    label: 'Specialiserad på digitala projekt (webb, e-handel, AI)',
    updro: 'yes',
    marketplaces: 'Alla branscher',
    diy: 'no',
  },
  {
    label: 'Kostnad för dig som beställare',
    updro: '0 kr',
    marketplaces: '0 kr',
    diy: 'Timmar av eget arbete',
  },
]

const Cell = ({ value, emphasize = false }: { value: CellValue; emphasize?: boolean }) => {
  const base = emphasize ? 'font-semibold text-foreground' : 'text-muted-foreground'
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full ${emphasize ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
        <span className="sr-only">Ja</span>
      </span>
    )
  }
  if (value === 'no') {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Nej</span>
      </span>
    )
  }
  if (value === 'partial') {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Minus className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Delvis</span>
      </span>
    )
  }
  return <span className={base}>{value}</span>
}

const ComparisonSection = () => {
  const reduce = useReducedMotion()

  return (
    <section className="py-16 md:py-20 bg-background border-b border-foreground/10" aria-labelledby="jamforelse-rubrik">
      <div className="container">
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Därför Updro</p>
          <h2 id="jamforelse-rubrik" className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground [text-wrap:balance]">
            Byggd för att du ska slippa <span className="text-accent">säljsamtalen.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Traditionella offerförmedlingar säljer din förfrågan till så många företag som möjligt.
            Updro gör tvärtom – kvalitet framför volym, på båda sidor av marknaden.
          </p>
        </motion.div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-10 max-w-4xl mx-auto overflow-x-auto"
        >
          <table className="w-full min-w-[640px] border-2 border-foreground bg-card text-sm">
            <caption className="sr-only">Jämförelse mellan Updro, vanliga offerförmedlingar och att leta byrå på egen hand</caption>
            <thead>
              <tr className="border-b-2 border-foreground">
                <th scope="col" className="p-4 text-left font-display font-bold text-foreground w-2/5">&nbsp;</th>
                <th scope="col" className="p-4 text-center font-display font-bold uppercase tracking-wide bg-accent text-accent-foreground border-x-2 border-foreground">
                  Updro
                </th>
                <th scope="col" className="p-4 text-center font-display font-semibold text-muted-foreground">Vanliga förmedlingar</th>
                <th scope="col" className="p-4 text-center font-display font-semibold text-muted-foreground">Leta själv</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => (
                <tr key={row.label} className={index % 2 === 0 ? 'bg-secondary/40' : 'bg-card'}>
                  <th scope="row" className="p-4 text-left font-medium text-foreground">{row.label}</th>
                  <td className="p-4 text-center border-x-2 border-foreground bg-accent/5">
                    <Cell value={row.updro} emphasize />
                  </td>
                  <td className="p-4 text-center"><Cell value={row.marketplaces} /></td>
                  <td className="p-4 text-center"><Cell value={row.diy} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Vill du gräva djupare? Läs vår ärliga genomgång:{' '}
          <Link to="/alternativ-till-partna" className="font-semibold text-foreground underline underline-offset-4 hover:text-accent">
            Updro som alternativ till Partna
          </Link>
        </p>
      </div>
    </section>
  )
}

export default ComparisonSection
