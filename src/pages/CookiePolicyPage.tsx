import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { setSEOMeta } from '@/lib/seoHelpers'

const CookiePolicyPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Cookiepolicy | Updro',
      description: 'Läs om Updros nödvändiga lagring, Google Analytics, Google Ads och hur du ändrar samtycke.',
      canonical: 'https://updro.se/cookies',
    })
  }, [])

  const openCookieSettings = () => window.dispatchEvent(new Event('updro:open-cookie-settings'))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-4xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Cookiepolicy</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Cookies och liknande teknik</h2>
              <p>Cookies är små textfiler i webbläsaren. Updro använder även lokal lagring (localStorage). Nödvändig lagring behövs för tjänstens funktioner. Statistik och marknadsföring används endast efter ditt aktiva val.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Ansvarig</h2>
              <p><strong>Aurora Media AB</strong>, org.nr. <strong>559272-0220</strong>, Gustafstorpsvägen 42, 585 74 Ljungsbro, ansvarar för användningen. Kontakt: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Dina val</h2>
              <p>Vid första besöket är statistik och marknadsföring avstängda. Du kan välja Statistik och Marknadsföring separat, acceptera båda eller neka båda. Nödvändig lagring kan inte stängas av i bannern eftersom den behövs för grundläggande funktioner.</p>
              <p className="mt-2">Det är lika enkelt att återkalla som att lämna samtycke. Ett ändrat val gäller för framtida behandling.</p>
              <Button type="button" size="sm" variant="outline" className="rounded-xl mt-3" onClick={openCookieSettings}>Ändra cookieinställningar</Button>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Kategorier</h2>
              <h3 className="font-semibold text-foreground mt-3 mb-1">Nödvändiga</h3>
              <p>Autentisering, session, säkerhet, formulärflöden, bedrägeriförebyggande och lagring av ditt val. De används inte för riktad annonsering.</p>
              <h3 className="font-semibold text-foreground mt-4 mb-1">Statistik</h3>
              <p>Om du väljer Statistik kan Google Analytics laddas för att mäta sidvisningar och användning. Google Analytics konfigureras inte innan statistikvalet är aktivt.</p>
              <h3 className="font-semibold text-foreground mt-4 mb-1">Marknadsföring</h3>
              <p>Om du väljer Marknadsföring kan Google Ads lagra eller läsa uppgifter för konverteringsmätning och annonsanalys. Annonslagring och annonsanpassning är nekade tills valet är aktivt.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Förteckning</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead><tr className="border-b"><th className="text-left p-2">Namn/teknik</th><th className="text-left p-2">Leverantör</th><th className="text-left p-2">Ändamål</th><th className="text-left p-2">Normal lagring</th></tr></thead>
                  <tbody>
                    <tr className="border-b align-top"><td className="p-2"><code>updro_cookie_consent</code></td><td className="p-2">Updro</td><td className="p-2">Nödvändig localStorage som sparar separata val, version och datum.</td><td className="p-2">Högst 12 månader eller tills valet ändras.</td></tr>
                    <tr className="border-b align-top"><td className="p-2">Supabase auth/session</td><td className="p-2">Supabase</td><td className="p-2">Nödvändig inloggning, session, tokenförnyelse och säkerhet.</td><td className="p-2">Under sessionen eller så länge inloggningen är giltig.</td></tr>
                    <tr className="border-b align-top"><td className="p-2">First/latest-touch attribution</td><td className="p-2">Updro</td><td className="p-2">Förstapartsinformation om kampanj och hänvisning i publiceringsflödet. Användning för annonsmätning följer marknadsföringsvalet.</td><td className="p-2">Normalt högst 90 dagar.</td></tr>
                    <tr className="border-b align-top"><td className="p-2"><code>_ga</code>, <code>_ga_*</code></td><td className="p-2">Google Analytics</td><td className="p-2">Statistik efter samtycke.</td><td className="p-2">Normalt upp till 24 månader, beroende på konfiguration.</td></tr>
                    <tr className="border-b align-top"><td className="p-2"><code>_gcl_*</code> och konverteringslagring</td><td className="p-2">Google Ads</td><td className="p-2">Konverteringsmätning och annonsanalys efter samtycke.</td><td className="p-2">Enligt konfiguration, normalt högst 90 dagar där lagringen används.</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2">Exakta namn kan ändras när en leverantör uppdaterar sin teknik. Förteckningen uppdateras när Updros faktiska användning förändras.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Consent Mode</h2>
              <p>Standardläget nekar <code>analytics_storage</code>, <code>ad_storage</code>, <code>ad_user_data</code> och <code>ad_personalization</code>. Google Analytics konfigureras bara med statistikval och Google Ads bara med marknadsföringsval. Återkallat samtycke uppdaterar signalerna till nekade för framtida behandling.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Tredje parter och överföringar</h2>
              <p>Google kan efter samtycke behandla IP-adress, enhetsinformation, sidvisningar, händelser och kampanjdata. Supabase och Stripe kan använda tekniskt nödvändig lagring för inloggning respektive betalning. Överföringar utanför EU/EES skyddas enligt integritetspolicyn.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Rättslig grund</h2>
              <p>Nödvändig lagring används för att tillhandahålla uttryckligen efterfrågade funktioner, säkerhet och ditt val. Statistik och marknadsföring används endast efter samtycke enligt tillämpliga regler om elektronisk kommunikation och dataskydd.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Kontakt</h2>
              <p>Frågor skickas till <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>. Läs även vår <a href="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</a>.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default CookiePolicyPage
