import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Mail, MapPin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta, setJsonLd } from '@/lib/seoHelpers'
export default function AboutPage() {
  useEffect(() => {
    setSEOMeta({
      title: 'Om Updro – digitala uppdrag och byråsamarbeten',
      description:
        'Updro drivs av Aurora Media AB och hjälper företag att jämföra upp till tre offerter från digitala byråer.',
      canonical: 'https://updro.se/om-oss'
    })
    setJsonLd('aboutpage-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      url: 'https://updro.se/om-oss',
      name: 'Om Updro',
      mainEntity: {
        '@type': 'Organization',
        '@id': 'https://updro.se/#organization',
        name: 'Updro',
        legalName: 'Aurora Media AB',
        url: 'https://updro.se',
        email: 'info@auroramedia.se',
        taxID: '559272-0220'
      }
    })
  }, [])
  return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="updro-page-heading py-14 md:py-20">
          <div className="container">
            <p className="updro-eyebrow">Om Updro</p>
            <h1 className="mt-4 max-w-3xl text-4xl md:text-5xl">
              Det ska vara enklare
              <br />
              att välja rätt byrå.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Vi samlar projektbeskrivning, offerter och dialog så att företag
              kan fatta ett mer genomtänkt beslut om sin digitala partner.
            </p>
          </div>
        </section>
        <section className="container updro-section grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20">
          <div>
            <h2 className="text-3xl">Ett gemensamt underlag från början.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              När olika byråer får olika information blir deras offerter svåra
              att jämföra. På Updro beskriver du behovet en gång. Förfrågan
              granskas och högst tre relevanta byråer kan sedan lämna offert.
            </p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Du väljer själv vilka förslag du vill diskutera och om du vill gå
              vidare. Tjänsten är gratis för beställare. Byråer betalar för
              tillgång till leads eller använder ett månadskort.
            </p>
            <Link
              to="/metod"
              className="mt-7 inline-flex items-center gap-2 font-medium text-primary"
            >
              Så fungerar vår metod <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <aside className="rounded-xl border bg-surface-alt p-7">
            <p className="updro-eyebrow">Företaget bakom Updro</p>
            <h2 className="mt-4 text-2xl">Aurora Media AB</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div className="flex gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <dt className="text-muted-foreground">Organisationsnummer</dt>
                  <dd className="mt-1 font-medium">559272-0220</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <dt className="text-muted-foreground">Säte</dt>
                  <dd className="mt-1 font-medium">Linköping, Sverige</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <dt className="text-muted-foreground">Kontakt</dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:info@auroramedia.se"
                      className="text-primary underline underline-offset-4"
                    >
                      info@auroramedia.se
                    </a>
                  </dd>
                </div>
              </div>
            </dl>
          </aside>
        </section>
        <section className="container pb-16 grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'För beställare',
              text: 'Beskriv ditt behov och jämför upp till tre förslag. Du bestämmer nästa steg.',
              href: '/publicera',
              label: 'Beskriv ett projekt'
            },
            {
              title: 'För byråer',
              text: 'Läs brief, budget och tidsram innan du väljer att låsa upp ett uppdrag.',
              href: '/for-byraer',
              label: 'Så fungerar det för byråer'
            },
            {
              title: 'Frågor och rättelser',
              text: 'Läs om hur vi arbetar med källor, guider och rättelser på webbplatsen.',
              href: '/redaktionell-policy',
              label: 'Vår redaktionella policy'
            }
          ].map((item) => (
            <article key={item.href} className="updro-decision-card">
              <h2 className="text-xl">{item.title}</h2>
              <p>{item.text}</p>
              <Link
                to={item.href}
                className="inline-block mt-5 text-sm font-medium text-primary"
              >
                {item.label}
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
