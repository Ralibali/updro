import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Info } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta, setJsonLd, setBreadcrumb } from '@/lib/seoHelpers'

const comparisonRows = [
  ['Antal offerter', 'Högst tre byråer kan lämna offert på samma uppdrag.', 'Swivrr anger tre till fem offerter per projekt.'],
  ['Byråernas pris', '119 kr per valt lead eller 1 995 kr/mån obegränsat – publicerat och förutsägbart.', 'Swivrr tar en avgift av byrån som vinner uppdraget; nivån anges inte öppet på deras webbplats.'],
  ['Kostnad per uppdrag', 'Högst 357 kr i leadavgift (tre leads × 119 kr) – eller obegränsat med månadskort.', 'Avgiften tas först vid vunnet uppdrag och kan variera med projektets värde.'],
  ['AI-brief', 'Inbyggd AI hjälper beställaren formulera briefen.', 'Swivrr erbjuder en liknande AI-funktion.'],
  ['Prisuppskattning', 'Ja – förankrad i 15 öppna prisguider som alla kan läsa utan konto.', 'Ja – Swivrr visar ett prisspann i publiceringsflödet.'],
  ['Öppna prisguider', '15 kostnadsfria prisguider plus priskalkylator – utan krav på konto.', 'Prisdata finns inbäddat i guidetexter; ingen öppen prisguide eller kalkylator utanför flödet.'],
  ['Publika byråprofiler', 'Ja – med verifierade omdömen som även bygger byråns varumärke i sökmotorer.', 'Vi hittar inga publika byråprofiler med omdömen på Swivrrs publika webbplats.'],
  ['Digitala avtal', 'Inbyggda – parterna bekräftar omfattning, pris och leverans i plattformen.', 'Kontrollera aktuellt funktionsutbud direkt hos Swivrr.'],
  ['Beställare', 'Gratis, granskad brief och låsta kontaktuppgifter.', 'Gratis med verifierade leverantörer enligt Swivrr.'],
  ['Marknadsläge', 'Nylanserad tjänst där leadvolymen fortfarande byggs upp.', 'Ny aktör med ett växande innehållsbibliotek.'],
]

const faqs = [
  {
    q: 'Är Updro ett alternativ till Swivrr?',
    a: 'Ja. Båda tjänsterna matchar företag med byråer för digitala projekt, och båda har AI-stödd brief med prisuppskattning. Updro skiljer sig med högst tre offerter, ett publicerat byråpris, öppna prisguider och publika byråprofiler med verifierade omdömen.',
  },
  {
    q: 'Har inte Swivrr unik prisuppskattning?',
    a: 'Nej. Updro erbjuder samma förmåg: AI:n hjälper dig skriva briefen och visar ett prisspann före publicering – förankrat i våra 15 öppna prisguider. Du kan dessutom räkna på priset i vår kalkylator utan att skapa konto.',
  },
  {
    q: 'Vad skiljer affärsmodellerna åt för byråer?',
    a: 'Updro tar 119 kr per valt lead eller 1 995 kr/mån obegränsat – kostnaden är känd i förväg. Swivrr debiterar byrån som vinner uppdraget, men nivån anges inte öppet. Jämför alltid kostnad per vunnen affär, inte bara prislistan.',
  },
  {
    q: 'Vilken tjänst ska jag välja som beställare?',
    a: 'Båda är gratis att använda, så det kostar inget att testa. På Updro får du högst tre genomarbetade offerter och kan läsa byråernas verifierade omdömen på deras publika profiler innan du bestämmer dig.',
  },
  {
    q: 'Kan en byrå använda båda tjänsterna?',
    a: 'Ja. Det kan vara klokt att testa flera kanaler parallellt och mäta svarsfrekvens, möten, vunna affärer och faktisk kundanskaffningskostnad.',
  },
]

const SwivrrAlternativPage = () => {
  useEffect(() => {
    const canonical = 'https://updro.se/swivrr-alternativ'
    setSEOMeta({
      title: 'Alternativ till Swivrr – jämför Updro och Swivrr',
      description: 'Jämför Updro och Swivrr för digitala uppdrag: antal offerter, byråpriser, AI-brief, prisuppskattning, prisguider och byråprofiler.',
      canonical,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'Alternativ till Swivrr', url: canonical },
    ])
    setJsonLd('swivrr-alternativ-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(item => ({
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Alternativ till Swivrr</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Updro eller Swivrr – vad passar bäst?
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Både Updro och Swivrr hjälper företag att hitta digitala byråer – och båda satsar på AI-stödda briefar med prisuppskattning. Updro skiljer sig med högst tre byråer per uppdrag, ett publicerat och förutsägbart byråpris, öppna prisguider och publika byråprofiler med verifierade omdömen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/publicera"><Button size="lg" className="rounded-xl px-7">Beskriv ett projekt <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/registrera/byra"><Button size="lg" variant="outline" className="rounded-xl px-7">Testa Updro som byrå</Button></Link>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30 py-16">
          <div className="container">
            <div className="max-w-3xl mb-8">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Saklig jämförelse</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Uppgifterna om Swivrr bygger på deras publika webbplats kontrollerad i juli 2026. Kontrollera alltid aktuella priser och villkor innan köp.</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-muted/60 text-left">
                  <tr><th className="p-4 font-semibold">Område</th><th className="p-4 font-semibold">Updro</th><th className="p-4 font-semibold">Swivrr</th></tr>
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
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ['Färre konkurrenter per lead', 'Högst tre byråer kan lämna offert på samma uppdrag – Swivrr anger tre till fem. Varje offert får större utrymme hos beställaren.'],
              ['Publicerat pris, inga överraskningar', 'Byråer vet exakt vad ett lead kostar innan de låser upp det. Provisionsmodeller kan variera med projektets värde.'],
              ['Profiler som arbetar för byrån', 'Verifierade omdömen samlas på publika byråprofiler som rankar i sökmotorer – en tillgång även utanför plattformen.'],
              ['Ta hänsyn till marknadsläget', 'Båda tjänsterna är unga och uppdragsvolymen varierar. Testa parallellt och mät vad som faktiskt blir affärer.'],
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
            <p>Updro ska inte vinna genom att tala illa om Swivrr. Skillnaden ska bevisas med färre konkurrenter per lead, publicerat pris, öppna prisguider och byråprofiler som bygger byråernas varumärken – och med tiden med verkliga data om möten och vunna affärer.</p>
          </div>
        </section>

        <section className="container pb-16">
          <div className="max-w-3xl">
            <h2 className="font-display text-3xl font-bold mb-6">Vanliga frågor</h2>
            <div className="space-y-3">
              {faqs.map(item => (
                <details key={item.q} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer font-semibold">{item.q}</summary>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Jämför även: <Link to="/partna-alternativ" className="text-primary hover:underline font-medium">Updro eller Partna</Link> – så väljer du mellan de etablerade och nya aktörerna.
            </p>
          </div>
        </section>

        <section className="container pb-20">
          <div className="rounded-3xl bg-foreground p-8 text-background md:p-12">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Bedöm Updro med riktiga uppdrag</h2>
            <p className="mt-3 max-w-2xl text-background/75">Beställare använder tjänsten gratis. Byråer kan börja med fem kostnadsfria lead-krediter och utvärdera faktisk kvalitet innan de betalar.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/publicera"><Button size="lg" variant="secondary" className="rounded-xl px-7">Beskriv ditt projekt</Button></Link>
              <Link to="/registrera/byra"><Button size="lg" variant="outline" className="rounded-xl border-background text-background hover:bg-background hover:text-foreground">Skapa byråkonto</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default SwivrrAlternativPage
