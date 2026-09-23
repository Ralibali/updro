import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'
import {
  FileSearch,
  Building2,
  ClipboardCheck,
  MessageSquare
} from 'lucide-react'
const checks = [
  {
    icon: FileSearch,
    title: 'Förfrågan granskas',
    body: 'Nya uppdrag granskas innan de blir tillgängliga för byråer. Underlaget behöver beskriva behovet tillräckligt tydligt för att en byrå ska kunna bedöma projektet.'
  },
  {
    icon: Building2,
    title: 'Status visas per byrå',
    body: 'Företagsuppgifter och verifieringsstatus finns i byråprofilen. F-skatt och kreditkontroll visas separat när respektive kontroll har registrerats.'
  },
  {
    icon: ClipboardCheck,
    title: 'Högst tre offerter',
    body: 'Antalet byråer som kan lämna offert är begränsat. Du kan jämföra deras förslag och ställa kompletterande frågor innan du fattar ett beslut.'
  },
  {
    icon: MessageSquare,
    title: 'Du gör slutbedömningen',
    body: 'En verifiering är inte en garanti för en viss leverans. Gå igenom arbetsprover, referenser, omfattning och avtalsvillkor med byrån som du överväger.'
  }
]
export default function MetodPage() {
  useEffect(() => {
    setSEOMeta({
      title: 'Vår metod – granskning och ett tydligare byråval | Updro',
      description:
        'Läs hur projektbriefar och byråuppgifter hanteras på Updro och vad du själv bör kontrollera innan du väljer en byrå.',
      canonical: 'https://updro.se/metod'
    })
  }, [])
  return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="updro-page-heading py-14 md:py-20">
          <div className="container">
            <p className="updro-eyebrow">Granskning & transparens</p>
            <h1 className="mt-4 text-4xl md:text-5xl max-w-3xl">
              Ett bättre underlag.
              <br />
              Ett tydligare ansvar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Updro hjälper dig att samla in och jämföra förslag. Här förklarar
              vi vad granskningen innebär och vad som är viktigt att kontrollera
              själv.
            </p>
          </div>
        </section>
        <section className="container updro-section">
          <div className="grid sm:grid-cols-2 gap-6">
            {checks.map((item) => (
              <article className="updro-decision-card" key={item.title}>
                <item.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-10 mt-12 pt-10 border-t">
            <div>
              <h2 className="text-2xl">Så finansieras tjänsten</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Beställare använder Updro kostnadsfritt. Byråer betalar för
                leads de väljer att låsa upp eller för ett månadskort. Updro tar
                ingen procent av projektvärdet.
              </p>
              <Link
                to="/priser"
                className="inline-block mt-4 text-primary underline underline-offset-4"
              >
                Se priser och villkor
              </Link>
            </div>
            <div>
              <h2 className="text-2xl">Om något inte stämmer</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Kontakta oss om en profil eller ett uppdrag innehåller felaktiga
                uppgifter. Beskriv vad som hänt och vilken byrå eller förfrågan
                det gäller.
              </p>
              <Link
                to="/rapportera-innehall"
                className="inline-block mt-4 text-primary underline underline-offset-4"
              >
                Rapportera innehåll
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
