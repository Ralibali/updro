import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta, setBreadcrumb, setJsonLd } from '@/lib/seoHelpers'

const CANONICAL = 'https://updro.se/hjalp-med-hemsida'

const DECISIONS = [
  'Vad hemsidan ska göra: sälja, boka möten, samla offertförfrågningar eller bara visa upp verksamheten.',
  'Om det är en ny sajt från grunden eller en uppdatering av något som redan finns och fungerar delvis.',
  'Ungefär hur många sidor och vilka funktioner du behöver: kontaktformulär, bokning, betalning, kundinloggning.',
  'Vem som skriver texter och tar fram bilder – du själv eller byrån. Det påverkar priset mest av allt.',
  'Vem som sköter hemsidan efter lansering: du, en anställd eller byrån mot en månadsavgift.',
  'En ungefärlig budgetram. Du behöver inte en exakt siffra, men ett spann gör offerterna jämförbara.',
]

const OPTIONS = [
  {
    title: 'Frilansare',
    price: 'Ofta 500–900 kr/timme',
    body: 'Passar mindre sajter och tydligt avgränsade uppdrag. Du får personlig kontakt och lägre pris, men blir beroende av en person för både utveckling, design och framtida ändringar. Fråga alltid vad som händer om personen är upptagen eller slutar.',
  },
  {
    title: 'Webbyrå',
    price: 'Ofta 1 000–1 800 kr/timme',
    body: 'Passar när projektet innehåller flera delar – strategi, design, utveckling, innehåll och SEO. Du får ett team, projektledning och kontinuitet, men betalar mer per timme. Rimligt när hemsidan är en viktig säljkanal.',
  },
  {
    title: 'Plattformsverktyg',
    price: 'Ofta 100–500 kr/månad',
    body: 'Squarespace, Wix, Wordpress.com och liknande. Billigast och snabbast igång om du bygger själv. Begränsningarna märks först när du vill ha egna funktioner, integrationer eller avancerad sökoptimering.',
  },
]

const FAQ = [
  {
    q: 'Jag vet inte vad jag ska beställa – hur börjar jag?',
    a: 'Börja med målet i stället för lösningen. Skriv ner vad du vill att en besökare ska göra på sajten och vad som är fel med dagens situation. Det räcker som utgångspunkt – byrån föreslår sedan omfattning och teknik. Du behöver inte kunna någon terminologi för att skicka in ett uppdrag på Updro.',
  },
  {
    q: 'Hur mycket ska ett litet företag räkna med att lägga på en hemsida?',
    a: 'En enkel företagssida på fem till tio sidor landar oftast mellan 15 000 och 50 000 kronor. Behöver du bokning, e-handel eller integrationer stiger det snabbt. Se prisguiden på /webbutveckling/pris för nivåer per projekttyp.',
  },
  {
    q: 'Måste jag ha budget klar innan jag begär offert?',
    a: 'Nej, men ett spann hjälper. Utan riktning får du offerter som inte går att jämföra, eftersom byråerna gissar olika på omfattning. Skriv hellre "vi tänker oss 30 000–60 000 kronor" än att lämna fältet tomt.',
  },
  {
    q: 'Vad kostar det att driva hemsidan efter lansering?',
    a: 'Räkna med domän och webbhotell på några hundra kronor per år till några hundra per månad, plus eventuellt förvaltningsavtal. Ett enklare förvaltningsavtal med uppdateringar, säkerhet och backup ligger vanligen på 500–3 000 kronor per månad.',
  },
  {
    q: 'Äger jag hemsidan när den är klar?',
    a: 'Det ska stå i avtalet. Be uttryckligen om att domän, hostingkonto, källkod, designfiler och analyskonton står i ditt företags namn. Det är den vanligaste orsaken till problem när ett samarbete tar slut.',
  },
  {
    q: 'Hur många byråer kontaktar mig om jag lägger upp uppdraget här?',
    a: 'Högst tre. Uppdraget granskas innan det öppnas och antalet byråer som kan lämna offert är begränsat, så du slipper massutskick och säljsamtal från tio olika håll.',
  },
]

const HjalpMedHemsidaPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Hjälp med hemsida – jämför offerter | Updro',
      description:
        'Behöver du hjälp med hemsida? Så bestämmer du omfattning, vad det kostar och hur du får offert på hemsida från upp till tre byråer.',
      canonical: CANONICAL,
    })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: 'Hjälp med hemsida', url: CANONICAL },
    ])
    setJsonLd('faq-hjalp-med-hemsida', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    })
  }, [])

  const publishUrl = `/publicera?beskrivning=${encodeURIComponent('Vi behöver hjälp med vår hemsida: ')}`

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="container max-w-4xl py-16 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">För dig som driver eget</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            Hjälp med hemsida – så vet du vad du ska beställa
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            De flesta småföretagare vet att hemsidan behöver bli bättre, men inte vad det ska innehålla eller kosta.
            Den här guiden går igenom vad du behöver bestämma innan du kontaktar någon, vad de olika alternativen
            kostar och skillnaden mellan frilansare, webbyrå och plattformsverktyg. Sedan kan du beskriva projektet
            en gång och få offert på hemsida från upp till tre relevanta byråer.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={publishUrl}>
              <Button size="lg" className="rounded-xl px-8 py-6 text-base">
                Beskriv ditt projekt gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/webbutveckling/pris">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base">
                Se vad en hemsida kostar
              </Button>
            </Link>
          </div>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Vad du behöver bestämma innan du kontaktar en byrå</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Du behöver ingen kravspecifikation. Men ju fler av punkterna nedan du har svarat på, desto mer lika
              varandra blir offerterna – och desto lättare blir det att se vem som faktiskt förstått uppdraget.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {DECISIONS.map(item => (
                <div key={item} className="flex gap-3 rounded-xl border bg-card p-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-foreground/85">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Vad kostar de olika alternativen?</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Prisbilden nedan är en grov riktlinje för svenska förhållanden. Den största kostnadsdrivaren är sällan
              tekniken, utan hur mycket design, innehåll och funktionalitet som ska tas fram från grunden.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-semibold">Typ av projekt</th>
                    <th className="p-4 font-semibold">Ungefärligt pris</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Enkel landningssida', '5 000 – 15 000 kr'],
                    ['Företagshemsida, fem till tio sidor', '15 000 – 50 000 kr'],
                    ['Hemsida med CMS och egen design', '30 000 – 100 000 kr'],
                    ['Webbutik / e-handel', '40 000 – 200 000 kr'],
                    ['Redesign av befintlig sajt', '15 000 – 80 000 kr'],
                    ['Löpande förvaltning', '500 – 3 000 kr/månad'],
                  ].map(([type, price]) => (
                    <tr key={type} className="border-t">
                      <td className="p-4 text-foreground/85">{type}</td>
                      <td className="p-4 font-medium">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              En mer detaljerad genomgång med vad som påverkar priset finns i{' '}
              <Link to="/webbutveckling/pris" className="font-medium text-primary underline underline-offset-4">
                prisguiden för webbutveckling
              </Link>
              .
            </p>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Frilansare, webbyrå eller plattformsverktyg?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {OPTIONS.map(option => (
                <div key={option.title} className="rounded-2xl border bg-card p-6">
                  <h3 className="font-display text-xl font-bold">{option.title}</h3>
                  <p className="mt-1 text-sm font-medium text-primary">{option.price}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{option.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              En enkel tumregel: bygger du din första sajt och har mer tid än pengar fungerar ett plattformsverktyg.
              Ska hemsidan dra in kunder och du saknar tid att sköta den själv är en frilansare eller{' '}
              <Link to="/hitta-webbyra" className="font-medium text-primary underline underline-offset-4">
                webbyrå
              </Link>{' '}
              nästan alltid billigare i längden.
            </p>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Så fungerar Updro</h2>
            <ol className="mt-6 space-y-4">
              {[
                'Beskriv vad du behöver hjälp med. Det tar några minuter och du behöver inte skapa konto.',
                'Updro granskar uppdraget innan det öppnas för byråer, så du slipper irrelevanta kontakter.',
                'Högst tre relevanta byråer kan lämna offert. Du jämför och väljer själv om du vill gå vidare.',
              ].map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-foreground/85">{item}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted-foreground">Tjänsten är kostnadsfri för dig som beställare.</p>
          </section>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Vanliga frågor</h2>
            <div className="mt-6 space-y-4">
              {FAQ.map(item => (
                <div key={item.q} className="rounded-2xl border bg-card p-6">
                  <h3 className="font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-16 rounded-3xl bg-foreground p-8 text-background md:p-10">
            <h2 className="font-display text-3xl font-bold">Redo att ta in offerter?</h2>
            <p className="mt-3 max-w-2xl text-background/75">
              Beskriv hemsidan du behöver – även om du är osäker på detaljerna – och låt högst tre byråer visa hur de
              skulle lösa det.
            </p>
            <Link to={publishUrl} className="mt-7 inline-block">
              <Button size="lg" variant="secondary" className="rounded-xl px-8">
                Starta förfrågan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <nav className="mt-12 flex flex-wrap gap-3 text-sm">
            {[
              { label: 'Webbutveckling', href: '/webbutveckling' },
              { label: 'Vad kostar en hemsida?', href: '/webbutveckling/pris' },
              { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
            ].map(link => (
              <Link key={link.href} to={link.href} className="rounded-full border px-4 py-2 hover:bg-muted">
                {link.label}
              </Link>
            ))}
          </nav>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default HjalpMedHemsidaPage
