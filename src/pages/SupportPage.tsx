import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta } from '@/lib/seoHelpers'

const questions = [
  ['Jag kan inte logga in', 'Kontrollera e-postadressen och lösenordet. Om kontot inte är bekräftat kan du skicka bekräftelsemejlet igen på inloggningssidan. Kontrollera även skräpposten.', '/logga-in', 'Till inloggningen'],
  ['Jag har glömt lösenordet', 'Begär en återställningslänk och välj ett nytt lösenord. Använd samma e-postadress som när du skapade kontot.', '/aterstall-losenord', 'Återställ lösenord'],
  ['Vad händer med mitt uppdrag?', 'Updro granskar förfrågan innan byråer kan lämna offert. Du kan få högst tre offerter och väljer själv om du vill gå vidare. Har du skickat utan konto kan du skapa ett med samma e-postadress för att följa uppdraget.', '/registrera', 'Skapa beställarkonto'],
  ['Hur fungerar leads och betalning för byråer?', 'Du ser brief, budget och tidsram innan du låser upp ett lead. Frågor om betalning, abonnemang eller ett felaktigt lead? Mejla oss med uppdragets referens eller fakturanummer.', '/priser', 'Se priser och villkor'],
] as const

export default function SupportPage() {
  useEffect(() => {
    setSEOMeta({ title: 'Support | Updro', description: 'Få hjälp med konto, bekräftelsemejl, uppdrag, offerter och betalningar på Updro.', canonical: 'https://updro.se/support' })
  }, [])
  return (
    <div className="updro-content-page min-h-screen flex flex-col">
      <Navbar />
      <main className="container max-w-4xl flex-1 py-12 sm:py-16">
        <h1 className="font-display text-4xl font-bold">Support</h1>
        <p className="mt-4 text-lg text-muted-foreground">Behöver du hjälp med Updro? Här hittar du svar och rätt kontaktväg.</p>
        <section className="mt-8 rounded-2xl border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Kontakta oss</h2>
          <p className="mt-3 text-muted-foreground">Beskriv vad som hänt och ange e-postadressen till ditt konto. Gäller det ett uppdrag, ta med referensen. Skicka aldrig lösenord eller bekräftelselänkar.</p>
          <Button asChild className="mt-5"><a href="mailto:info@auroramedia.se?subject=Support%20Updro">Mejla info@auroramedia.se</a></Button>
          <p className="mt-4 text-sm text-muted-foreground">Updro drivs av Aurora Media AB, org.nr 559272-0220.</p>
        </section>
        <section className="mt-10 space-y-6" aria-label="Vanliga frågor">
          {questions.map(([title, text, href, label]) => (
            <article key={title} className="border-b pb-6">
              <h2 className="font-display text-xl font-semibold">{title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
              <Link to={href} className="mt-3 inline-block text-primary underline underline-offset-4">{label}</Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
