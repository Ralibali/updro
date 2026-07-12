import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta } from '@/lib/seoHelpers'

const CookiePolicyPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Cookiepolicy | Updro',
      description: 'Cookies och spårning på Updro — vilka cookies vi använder, rättslig grund enligt LEK och GDPR, samt hur du hanterar samtycke.',
      canonical: 'https://updro.se/cookies',
    })
  }, [])

  const openCookieSettings = () => {
    window.dispatchEvent(new Event('updro:open-cookie-settings'))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Cookiepolicy</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12 · Version 3.0</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Vad är cookies?</h2>
              <p>Cookies är små textfiler som lagras i din webbläsare. Liknande tekniker (localStorage, pixlar, SDK:er) kan användas för att läsa eller lagra information på din enhet. Vissa är nödvändiga för att tjänsten ska fungera, andra kräver ditt samtycke.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Vem ansvarar?</h2>
              <p><strong>Aurora Media AB</strong>, org.nr <strong>559272-0220</strong>, c/o Kivra 559272-0220, 106 31 Stockholm, ansvarar för cookies på updro.se.</p>
              <p className="mt-1">Kontakt: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a></p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Rättslig grund</h2>
              <p>Cookies regleras i Sverige av <strong>9 kap. lagen (2022:482) om elektronisk kommunikation (LEK)</strong> och <strong>EU:s ePrivacy-direktiv 2002/58/EG</strong>, samt av GDPR när personuppgifter behandlas. Nödvändiga cookies får användas utan samtycke. För alla övriga krävs aktivt, informerat och frivilligt samtycke som kan återkallas.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Cookies vi använder</h2>

              <h3 className="font-semibold text-foreground mt-3 mb-1">4.1 Nödvändiga</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cookie-samtycke</strong> — sparar ditt val. Lagras upp till tolv månader.</li>
                <li><strong>Autentisering / session</strong> (Supabase / Lovable Cloud) — inloggning och kontofunktioner.</li>
                <li><strong>Säkerhet</strong> — skydd mot missbruk, CSRF och rate limiting.</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">4.2 Statistik (kräver samtycke)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Google Analytics 4</strong> — för att förstå hur webbplatsen används. Google-taggen laddas inte innan du samtyckt.</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">4.3 Marknadsföring (kräver samtycke)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Google Ads</strong> — konverteringsmätning och remarketing.</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">4.4 Tekniskt nödvändiga tredjepartstjänster</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Stripe</strong> — kan sätta cookies vid betalning för säkerhet och bedrägeriskydd.</li>
                <li><strong>Google Search Console</strong> — endast serverbaserad verifiering, inga cookies på användaren.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Samtycke</h2>
              <p>Du kan neka icke-nödvändiga cookies eller acceptera statistik och marknadsföring i cookie-bannern. Ett nej påverkar inte tjänstens grundläggande funktioner. Du kan när som helst ändra eller återkalla ditt val.</p>
              <Button type="button" size="sm" className="rounded-xl mt-3" onClick={openCookieSettings}>
                Ändra cookieinställningar
              </Button>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Lagringstid</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Sessionscookies:</strong> raderas när webbläsaren stängs.</li>
                <li><strong>Cookieval:</strong> upp till tolv månader eller tills du ändrar det.</li>
                <li><strong>Google Analytics / Google Ads:</strong> styrs av Googles inställningar, och lagras endast om du samtyckt.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Överföring till tredje land</h2>
              <p>Om du samtycker till statistik eller marknadsföring kan uppgifter överföras till Google i USA. Överföringen sker med stöd av EU-kommissionens standardavtalsklausuler och Data Privacy Framework.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Dina rättigheter</h2>
              <p>Du har enligt GDPR rätt till tillgång, rättelse, radering, begränsning, invändning och portabilitet, samt rätt att återkalla samtycke. Du har också rätt att klaga hos <strong>Integritetsskyddsmyndigheten (IMY)</strong>: <a href="https://www.imy.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.imy.se</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Kontakt</h2>
              <p>Har du frågor om cookies eller personuppgifter? Kontakta oss på <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
              <p className="mt-2">Se även vår <a href="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</a> och våra <a href="/villkor" className="text-primary hover:underline">allmänna villkor</a>.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default CookiePolicyPage
