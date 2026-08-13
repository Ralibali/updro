import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ExternalLink, Info, Percent } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'
import { STRIPE_PRODUCTS } from '@/lib/constants'
import {
  PARTNA_FACTS,
  PARTNA_FAQS,
  PARTNA_SOURCES,
  PARTNA_VERIFIED_DATE,
  estimatePartnaPaygWinnerCost,
} from '@/lib/partnaComparison'

const formatSek = (value: number) =>
  new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(value))

const comparisonRows = [
  ['Antal offerter', 'Högst tre byråer kan lämna offert på samma uppdrag.', `Partna anger upp till ${PARTNA_FACTS.maxOffers} offerter per förfrågan.`],
  ['Pay per lead', `${STRIPE_PRODUCTS.lead.price} kr per valt lead.`, `Partna anger normalt ${PARTNA_FACTS.payAsYouGo} kr per uppdragsförfrågan på Pay as you go.`],
  ['Basic', 'Ingen motsvarande begränsad månadsplan – välj pay per lead eller obegränsat månadskort.', `${PARTNA_FACTS.basicMonthly.toLocaleString('sv-SE')} kr/mån och ${PARTNA_FACTS.basicIncludedLeads} nycklar enligt Partnas publika prisinformation.`],
  ['Månadsplan', `${STRIPE_PRODUCTS.monthly.price.toLocaleString('sv-SE')} kr/mån för obegränsade upplåsningar under aktiv månad.`, `${PARTNA_FACTS.standardMonthly.toLocaleString('sv-SE')} kr/mån inklusive ${PARTNA_FACTS.standardIncludedLeads} uppdragsförfrågningar, därefter ordinarie pris.`],
  ['Avgift när affären vinns', 'Ingen procentuell slagavgift på projektvärdet i Updros publicerade prismodell.', `Partna anger ${Math.round(PARTNA_FACTS.successFeeRate * 100)} % slagavgift av offertens värde exkl. moms när leverantören blir vald.`],
  ['Brief och prisunderlag', 'AI-stöd för brief, prisspann före publicering och öppna prisguider.', 'Partna beskriver AI-matchning mellan uppdrag och leverantör. Updro skiljer ut sig med prisunderlag före publicering.'],
  ['Provstart', 'Fem lead-krediter under sju dagar utan kortuppgifter.', 'Kontrollera aktuellt introduktionserbjudande direkt hos Partna.'],
  ['Beställare', 'Gratis, granskad brief och låsta kontaktuppgifter.', 'Gratis offertförfrågan. Partna erbjuder BankID/SMS-verifiering och företagskontroller enligt sin publika information.'],
  ['Marknadsläge', 'Nylanserad tjänst där leadvolymen fortfarande byggs upp.', 'Etablerad aktör med större befintligt nätverk och publicerad historik.'],
]

const PartnaAlternativPage = () => {
  const [projectValue, setProjectValue] = useState(100000)

  const costExample = useMemo(() => {
    const updro = STRIPE_PRODUCTS.lead.price
    const partna = estimatePartnaPaygWinnerCost(projectValue)
    return {
      updro,
      partna,
      difference: Math.max(0, partna - updro),
      successFee: projectValue * PARTNA_FACTS.successFeeRate,
    }
  }, [projectValue])

  useEffect(() => {
    const canonical = 'https://updro.se/partna-alternativ'
    setSEOMeta({
      title: 'Partna pris 2026 & alternativ – Updro vs Partna',
      description: `Jämför Partna och Updro: ${PARTNA_FACTS.payAsYouGo} kr per Partna-förfrågan, ${Math.round(PARTNA_FACTS.successFeeRate * 100)} % slagavgift vid vunnen affär, upp till ${PARTNA_FACTS.maxOffers} offerter – mot Updros ${STRIPE_PRODUCTS.lead.price} kr per valt lead och max tre byråer.`,
      canonical,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'Partna pris och alternativ', url: canonical },
    ])
    setJsonLd('partna-alternativ-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: PARTNA_FAQS.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Partna pris & alternativ 2026</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Partna pris och alternativ – Updro vs Partna
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Båda tjänsterna hjälper företag att hitta digitala leverantörer, men prismodellen skiljer sig tydligt. Partna anger i sin publika information {PARTNA_FACTS.payAsYouGo} kr per uppdragsförfrågan på Pay as you go och {Math.round(PARTNA_FACTS.successFeeRate * 100)} % slagavgift av offertvärdet när leverantören vinner. Updro kostar {STRIPE_PRODUCTS.lead.price} kr per valt lead eller {STRIPE_PRODUCTS.monthly.price.toLocaleString('sv-SE')} kr/mån och begränsar konkurrensen till högst tre byråer.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">Källor kontrollerade {PARTNA_VERIFIED_DATE}. Priser och villkor kan ändras.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/registrera/byra"><Button size="lg" className="rounded-xl px-7">Testa 5 leads gratis <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/publicera"><Button size="lg" variant="outline" className="rounded-xl px-7">Jag söker en byrå</Button></Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-3xl mb-8">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Partna pris jämfört med Updro</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Jämförelsen bygger på respektive tjänsts publika information. Den viktiga siffran för en byrå är inte bara kostnad per lead, utan total kostnad per vunnen affär.</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr><th className="p-4 font-semibold">Område</th><th className="p-4 font-semibold">Updro</th><th className="p-4 font-semibold">Partna</th></tr>
                </thead>
                <tbody>
                  {comparisonRows.map(row => (
                    <tr key={row[0]} className="border-t align-top">
                      <td className="p-4 font-medium text-foreground">{row[0]}</td>
                      <td className="p-4 text-muted-foreground">{row[1]}</td>
                      <td className="p-4 text-muted-foreground">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Räkna själv</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Vad kan ett vunnet uppdrag kosta i plattformsavgift?</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Exemplet jämför ett Updro-lead med Partnas publicerade Pay as you go-pris och slagavgift. Det är inte en prognos för hur många leads som krävs för att vinna en kund.
              </p>

              <label htmlFor="project-value" className="mt-8 block text-sm font-semibold text-foreground">Offertvärde exkl. moms</label>
              <input
                id="project-value"
                type="range"
                min={25000}
                max={500000}
                step={5000}
                value={projectValue}
                onChange={event => setProjectValue(Number(event.target.value))}
                className="mt-4 w-full accent-primary"
              />
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>25 000 kr</span>
                <strong className="text-lg text-foreground">{formatSek(projectValue)} kr</strong>
                <span>500 000 kr</span>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <Percent className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.14em]">Exempel vid vunnen affär</span>
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b pb-4"><dt className="text-muted-foreground">Updro, ett valt lead</dt><dd className="font-semibold">{formatSek(costExample.updro)} kr</dd></div>
                <div className="flex items-center justify-between gap-4 border-b pb-4"><dt className="text-muted-foreground">Partna Pay as you go</dt><dd className="font-semibold">{formatSek(PARTNA_FACTS.payAsYouGo)} kr</dd></div>
                <div className="flex items-center justify-between gap-4 border-b pb-4"><dt className="text-muted-foreground">Partna slagavgift, {Math.round(PARTNA_FACTS.successFeeRate * 100)} %</dt><dd className="font-semibold">{formatSek(costExample.successFee)} kr</dd></div>
                <div className="flex items-center justify-between gap-4 pt-1"><dt className="font-semibold">Partna totalt i exemplet</dt><dd className="font-display text-2xl font-bold">{formatSek(costExample.partna)} kr</dd></div>
              </dl>
              <div className="mt-6 rounded-2xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Skillnad i detta enskilda exempel</p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground">{formatSek(costExample.difference)} kr</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Exklusive moms. Updro-jämförelsen utgår från ett enda upplåst lead. Faktisk kundanskaffningskostnad beror på antal köpta leads, svarsfrekvens och vinstgrad.</p>
            </div>
          </div>
        </section>

        <section className="container pb-16">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ['Välj Updro för lägre konkurrens per uppdrag', 'Högst tre byråer kan lämna offert, vilket ger varje svar mer utrymme. Det garanterar dock inte att leadet blir kund.'],
              ['Mät total kostnad – inte bara leadpris', 'Räkna in abonnemang, styckepris, eventuell slagavgift och hur många leads som faktiskt krävs för en vunnen affär.'],
              ['Ta hänsyn till marknadsläget', 'Updro är nylanserat och volymen varierar. Partnas större nätverk kan ge en annan tillgänglighet i vissa kategorier.'],
              ['Testa parallellt och följ utfallet', 'Jämför relevant dialog, möten, offerter, vunna affärer och faktisk kundanskaffningskostnad över samma tidsperiod.'],
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border bg-card p-6">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex gap-3 rounded-2xl border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Updro ska vinna på verifierbara skillnader, inte på att prata ned en konkurrent. Därför länkar vi till Partnas egna pris- och produktsidor och anger när uppgifterna senast kontrollerades.</p>
          </div>
        </section>

        <section className="container pb-16">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold mb-6">Källor till Partna-priserna</h2>
            <div className="space-y-3">
              {PARTNA_SOURCES.map(source => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 font-medium hover:border-primary transition-colors">
                  <span>{source.label}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="container pb-16">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold mb-6">Vanliga frågor om Partna pris och alternativ</h2>
            <div className="space-y-3">
              {PARTNA_FAQS.map(item => (
                <details key={item.q} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer font-semibold">{item.q}</summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Jämför även: <Link to="/swivrr-alternativ" className="text-primary hover:underline font-medium">Updro eller Swivrr</Link>.
            </p>
          </div>
        </section>

        <section className="container pb-20">
          <div className="rounded-3xl bg-foreground p-8 text-background md:p-12">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Mät Updro med riktiga leads – innan du betalar</h2>
            <p className="mt-3 max-w-2xl text-background/75">Nya byråer får fem kostnadsfria lead-krediter under sju dagar utan kortuppgifter. Jämför faktisk kvalitet, svar och möten med dina andra kanaler.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/registrera/byra"><Button size="lg" variant="secondary" className="rounded-xl px-7">Testa 5 leads gratis</Button></Link>
              <Link to="/priser"><Button size="lg" variant="outline" className="rounded-xl border-background text-background hover:bg-background hover:text-foreground">Se alla Updro-priser</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default PartnaAlternativPage
