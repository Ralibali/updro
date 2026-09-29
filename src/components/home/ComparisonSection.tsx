import { Link } from 'react-router-dom'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { PARTNA_FACTS } from '@/lib/partnaComparison'

type CellValue = 'yes' | 'varies' | string

interface ComparisonRow {
  label: string
  hint?: string
  updro: CellValue
  others: CellValue
}

/**
 * Ärlig jämförelse: konkurrentkolumnen får samma värde där det stämmer
 * (de är också gratis för beställare) – det gör tabellen trovärdig.
 * Siffror om andra tjänster hämtas från partnaComparison.ts, som har källor.
 */
const ROWS: ComparisonRow[] = [
  {
    label: 'Byråer som kan lämna offert',
    hint: 'Färre offerter att läsa, fler som faktiskt lagt tid på din.',
    updro: 'Högst 3',
    others: `Upp till ${PARTNA_FACTS.maxOffers}`,
  },
  {
    label: 'Provision på ditt projekt',
    hint: 'En procentavgift för byrån riskerar att bakas in i ditt pris.',
    updro: '0 %',
    others: `Upp till ${Math.round(PARTNA_FACTS.successFeeRate * 100)} %`,
  },
  {
    label: 'Briefen granskas manuellt innan byråer ser den',
    updro: 'yes',
    others: 'varies',
  },
  {
    label: 'Prisindikator innan du skickar förfrågan',
    updro: 'yes',
    others: 'varies',
  },
  {
    label: 'Inget konto krävs för att skicka',
    updro: 'yes',
    others: 'varies',
  },
  {
    label: 'Kostnad för dig som beställare',
    updro: '0 kr',
    others: '0 kr',
  },
]

const Cell = ({ value, emphasize = false }: { value: CellValue; emphasize?: boolean }) => {
  if (value === 'yes') {
    return (
      <span className={`compare-yes ${emphasize ? 'is-updro' : ''}`}>
        <Check aria-hidden="true" />
        <span className="sr-only">Ja</span>
      </span>
    )
  }
  if (value === 'varies') {
    return (
      <span className="compare-varies">
        <Minus aria-hidden="true" /> Varierar
      </span>
    )
  }
  return <span className={emphasize ? 'compare-strong' : 'compare-muted'}>{value}</span>
}

const ComparisonSection = () => (
  <section className="compare-section" aria-labelledby="jamforelse-rubrik">
    <div className="container compare-layout">
      <div className="compare-intro">
        <div className="eyebrow">Därför Updro</div>
        <h2 id="jamforelse-rubrik">
          Färre offerter.
          <br />
          <em>Bättre offerter.</em>
        </h2>
        <p>
          Många offerttjänster skickar din förfrågan till så många som möjligt. Updro gör tvärtom:
          högst tre byråer, ingen provision på ditt projekt och en brief som granskas innan någon
          ser den.
        </p>
        <Link className="button" to="/publicera">
          Beskriv ditt projekt <ArrowRight />
        </Link>
        <Link to="/partna-alternativ" className="text-link compare-more">
          Läs hela jämförelsen med Partna <ArrowRight />
        </Link>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <caption className="sr-only">Jämförelse mellan Updro och andra offerttjänster för digitala byråer</caption>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Egenskap</span></th>
              <th scope="col" className="is-updro">Updro</th>
              <th scope="col">Andra offerttjänster</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.label}>
                <th scope="row">
                  {row.label}
                  {row.hint && <small>{row.hint}</small>}
                </th>
                <td className="is-updro"><Cell value={row.updro} emphasize /></td>
                <td><Cell value={row.others} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="compare-note">
          Uppgifter om andra tjänster bygger på Partnas publika information. Villkor kan ändras – se källorna i{' '}
          <Link to="/partna-alternativ">jämförelsen</Link>.
        </p>
      </div>
    </div>
  </section>
)

export default ComparisonSection
