import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta, setBreadcrumb, setJsonLd } from '@/lib/seoHelpers'

const SEOLandingPage = ({
  title,
  metaDescription,
  canonical,
  h1,
  serviceType,
  wizardDescription,
  intro,
  considerations,
  priceText,
}: {
  title: string
  metaDescription: string
  canonical: string
  h1: string
  serviceType: string
  wizardDescription: string
  intro: string
  considerations: string[]
  priceText: string
}) => {
  useEffect(() => {
    setSEOMeta({ title, description: metaDescription, canonical })
    setBreadcrumb([
      { name: 'Hem', url: 'https://updro.se/' },
      { name: h1, url: canonical },
    ])
    setJsonLd(`service-${serviceType}`, {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: serviceType,
      serviceType,
      provider: { '@id': 'https://updro.se/#organization' },
      areaServed: { '@type': 'Country', name: 'Sweden' },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'SEK',
        description: 'Gratis för beställare att skicka in och jämföra offerter.',
      },
    })
  }, [title, metaDescription, canonical, h1, serviceType])

  const publishUrl = `/publicera?beskrivning=${encodeURIComponent(wizardDescription)}`

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="container max-w-4xl py-16 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Gratis offertjämförelse</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">{h1}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{intro}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={publishUrl}>
              <Button size="lg" className="rounded-xl px-8 py-6 text-base">
                Beskriv ditt projekt gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/#hur-det-fungerar">
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-6 text-base">Så fungerar Updro</Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Max tre', 'byråer kan lämna offert'],
              ['Granskad', 'brief före publicering'],
              ['0 kr', 'för beställaren'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border bg-card p-5">
                <p className="font-display text-2xl font-bold">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <section className="mt-16">
            <h2 className="font-display text-3xl font-bold">Vad bör du jämföra?</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {considerations.map(item => (
                <div key={item} className="flex gap-3 rounded-xl border bg-card p-5">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-foreground/85">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-2xl border bg-muted/30 p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold">Vad kostar {serviceType.toLowerCase()}?</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">{priceText}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Pris är bara en del av beslutet. Kontrollera också omfattning, ansvar, leveranstid, support, rättigheter till material och hur resultatet ska följas upp.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-display text-3xl font-bold">Så används Updro</h2>
            <ol className="mt-6 space-y-4">
              {[
                'Beskriv behov, budget och önskad start utan att skapa konto.',
                'Updro granskar briefen innan den öppnas för relevanta byråer.',
                'Högst tre byråer kan lämna offert. Du jämför och väljer själv om du vill gå vidare.',
              ].map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{index + 1}</span>
                  <p className="pt-1 text-foreground/85">{item}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-14 rounded-3xl bg-foreground p-8 text-background md:p-10">
            <h2 className="font-display text-3xl font-bold">Få ett bättre beslutsunderlag</h2>
            <p className="mt-3 max-w-2xl text-background/75">Beskriv projektet en gång och låt högst tre relevanta byråer visa hur de skulle lösa det.</p>
            <Link to={publishUrl} className="mt-7 inline-block">
              <Button size="lg" variant="secondary" className="rounded-xl px-8">
                Starta förfrågan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export const HittaWebbbyraPage = () => (
  <SEOLandingPage
    title="Hitta webbyrå – jämför upp till tre offerter | Updro"
    metaDescription="Hitta webbyrå för hemsida, webbapp eller redesign. Beskriv projektet gratis och jämför upp till tre relevanta offerter."
    canonical="https://updro.se/hitta-webbyra"
    h1="Hitta rätt webbyrå utan massutskick"
    serviceType="Webbutveckling"
    wizardDescription="Vi behöver hjälp av en webbyrå med "
    intro="En bra webbyrå ska förstå både teknik, målgrupp och affärsmål. Med Updro beskriver du projektet en gång, briefen granskas och högst tre matchande byråer kan lämna offert."
    considerations={[
      'Vad som faktiskt ingår: strategi, design, utveckling, innehåll, SEO, test och lansering.',
      'Teknikval och vem som ansvarar för drift, säkerhet, uppdateringar och support efter lansering.',
      'Relevant erfarenhet, portfolio och hur byrån planerar projektledning och löpande avstämningar.',
      'Äganderätt till kod, design, domän, analyskonton och annat material när projektet avslutas.',
    ]}
    priceText="En enklare företagssajt kan kosta från tiotusentals kronor, medan e-handel, integrationer, portaler och specialbyggda funktioner ofta kräver en betydligt större budget. En tydlig brief gör offerterna mer jämförbara."
  />
)

export const HittaSeoByraPage = () => (
  <SEOLandingPage
    title="Hitta SEO-byrå – jämför upp till tre offerter | Updro"
    metaDescription="Jämför SEO-byråer inom teknisk SEO, innehåll och lokal synlighet. Beskriv behovet gratis och få upp till tre relevanta offerter."
    canonical="https://updro.se/hitta-seo-byra"
    h1="Hitta en SEO-byrå med rätt metod"
    serviceType="SEO och sökmotoroptimering"
    wizardDescription="Vi behöver hjälp av en SEO-byrå med "
    intro="SEO är ett långsiktigt arbete där metod, transparens och uppföljning är minst lika viktigt som pris. Updro hjälper dig jämföra högst tre relevanta upplägg i stället för att skicka förfrågan till ett stort antal byråer."
    considerations={[
      'Vilka affärsmål och sökintentioner arbetet ska bidra till, inte bara lösa rankingpositioner.',
      'Hur teknisk SEO, innehåll, internlänkning och eventuell länkanskaffning ska prioriteras.',
      'Vilka mätetal som rapporteras och hur byrån skiljer verklig affärseffekt från ren trafikökning.',
      'Undvik löften om garanterad förstaplats, otydliga metoder och långa avtal utan mätbara milstolpar.',
    ]}
    priceText="Löpande SEO kan variera från mindre lokala insatser till omfattande nationella program. Kostnaden påverkas av webbplatsens skick, konkurrensen, innehållsbehovet och hur mycket tekniskt arbete som krävs."
  />
)

export const HittaDigitalByraPage = () => (
  <SEOLandingPage
    title="Hitta digital byrå – jämför upp till tre offerter | Updro"
    metaDescription="Hitta digital byrå för webb, annonsering, innehåll eller strategi. Beskriv projektet gratis och jämför upp till tre relevanta offerter."
    canonical="https://updro.se/hitta-digital-byra"
    h1="Hitta en digital byrå som passar uppdraget"
    serviceType="Digital marknadsföring"
    wizardDescription="Vi behöver hjälp av en digital byrå med "
    intro="Digitala byråer kan vara fullservicepartners eller specialister inom exempelvis annonsering, innehåll, design, SEO och konvertering. Updro begränsar varje uppdrag till högst tre offerter för att göra jämförelsen tydligare."
    considerations={[
      'Om ni behöver en bred partner eller en specialist inom en tydlig kanal eller leverans.',
      'Vilka mål, budgetar, målgrupper och befintliga konton eller system byrån ska arbeta med.',
      'Hur ansvar, rapportering, annonsbudget, materialproduktion och löpande optimering fördelas.',
      'Vilka delar ni äger efter samarbetet: annonskonton, data, målgrupper, innehåll och kreativa filer.',
    ]}
    priceText="Priset beror på om uppdraget är ett avgränsat projekt eller ett löpande samarbete, hur mycket produktion som ingår och om mediebudget tillkommer. Be alltid byrån separera arvode, produktion och externa kostnader."
  />
)
