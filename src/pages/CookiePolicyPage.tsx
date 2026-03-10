import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const CookiePolicyPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Cookiepolicy | Updro',
      description: 'Läs om hur Updro använder cookies och liknande tekniker på updro.se.',
      canonical: 'https://updro.se/cookies',
    })
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Cookiepolicy</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Vad är cookies?</h2>
              <p>Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. De används för att webbplatsen ska fungera korrekt, för att förbättra användarupplevelsen och för att samla in statistik.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Vilka cookies använder vi?</h2>

              <h3 className="font-semibold text-foreground mt-3 mb-1">2.1 Nödvändiga cookies</h3>
              <p>Dessa cookies krävs för att tjänsten ska fungera. De hanterar t.ex. inloggning och sessionshantering. Kräver inte samtycke.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Autentiseringscookies:</strong> håller dig inloggad</li>
                <li><strong>CSRF-tokens:</strong> skyddar mot attacker</li>
                <li><strong>Cookie-samtycke:</strong> sparar dina val</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">2.2 Analyscookies</h3>
              <p>Hjälper oss förstå hur besökare använder webbplatsen. Kräver samtycke.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Sidvisningar:</strong> anonymiserad besöksstatistik</li>
                <li><strong>Sessionsdata:</strong> enhetsinformation, referrer</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">2.3 Marknadsföringscookies</h3>
              <p>Används för att visa relevanta annonser. Kräver samtycke.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Lagringstid</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sessionscookies:</strong> raderas när du stänger webbläsaren</li>
                <li><strong>Beständiga cookies:</strong> sparas i upp till 12 månader</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Hantera cookies</h2>
              <p>Du kan hantera och ta bort cookies via:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Vår cookie-banner som visas vid ditt första besök</li>
                <li>Din webbläsares inställningar</li>
              </ul>
              <p className="mt-2">Observera att blockering av nödvändiga cookies kan påverka tjänstens funktionalitet.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Rättslig grund</h2>
              <p>Nödvändiga cookies sätts med stöd av berättigat intresse (Art. 6.1f GDPR). Analys- och marknadsföringscookies sätts med ditt samtycke (Art. 6.1a GDPR) i enlighet med lagen om elektronisk kommunikation (LEK).</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Kontakt</h2>
              <p>Har du frågor om vår användning av cookies? Kontakta oss på <a href="mailto:gdpr@updro.se" className="text-primary hover:underline">gdpr@updro.se</a>.</p>
              <p className="mt-2">Se även vår <a href="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</a> för mer information om hur vi hanterar personuppgifter.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default CookiePolicyPage
