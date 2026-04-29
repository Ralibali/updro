import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const PrivacyPolicyPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Integritetspolicy | Updro',
      description: 'Läs Updros integritetspolicy. Här beskriver vi hur vi hanterar dina personuppgifter i enlighet med GDPR.',
      canonical: 'https://updro.se/integritetspolicy',
    })
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Integritetspolicy</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Personuppgiftsansvarig</h2>
              <p>Aurora Media AB (org.nr. 559272-0220), nedan "Updro", "vi" eller "oss", är personuppgiftsansvarig för behandlingen av dina personuppgifter på updro.se.</p>
              <p className="mt-1">Kontakt: <a href="mailto:gdpr@updro.se" className="text-primary hover:underline">gdpr@updro.se</a></p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Vilka uppgifter vi samlar in</h2>
              <p>Vi samlar in följande personuppgifter:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Kontouppgifter:</strong> namn, e-postadress, telefonnummer, stad, företagsnamn</li>
                <li><strong>Profildata:</strong> logotyp, portfolio, bio, webbplats (för byråer)</li>
                <li><strong>Kommunikation:</strong> meddelanden mellan beställare och byråer</li>
                <li><strong>Betalningsuppgifter:</strong> hanteras av Stripe — vi lagrar aldrig kortuppgifter</li>
                <li><strong>Tekniska data:</strong> IP-adress, webbläsartyp, enhet (via cookies)</li>
                <li><strong>Användningsdata:</strong> sidvisningar, klick, sökningar</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Rättslig grund</h2>
              <p>Vi behandlar dina personuppgifter baserat på:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Avtal (Art. 6.1b GDPR):</strong> för att tillhandahålla tjänsten och hantera ditt konto</li>
                <li><strong>Berättigat intresse (Art. 6.1f):</strong> för att förbättra tjänsten, förhindra missbruk och skicka servicemeddelanden</li>
                <li><strong>Samtycke (Art. 6.1a):</strong> för marknadsföring och icke-nödvändiga cookies</li>
                <li><strong>Rättslig förpliktelse (Art. 6.1c):</strong> för bokföring och skatteändamål</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Hur vi använder uppgifterna</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Skapa och hantera ditt konto</li>
                <li>Matcha beställare med relevanta byråer</li>
                <li>Möjliggöra offerter, meddelanden och avtal</li>
                <li>Hantera betalningar och fakturering</li>
                <li>Skicka servicenotiser (nya offerter, meddelanden etc.)</li>
                <li>Förbättra och utveckla tjänsten</li>
                <li>Förhindra missbruk och bedrägerier</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Delning av uppgifter</h2>
              <p>Vi delar personuppgifter med:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Motparten i ett uppdrag:</strong> beställare ser byråns profil och offertuppgifter, byråer ser beställarens uppdragsinformation</li>
                <li><strong>Stripe:</strong> betalningshantering (PCI DSS-certifierad)</li>
                <li><strong>Hostingleverantörer:</strong> inom EU/EES (Supabase, Lovable)</li>
                <li><strong>Myndigheter:</strong> om vi är skyldiga enligt lag</li>
              </ul>
              <p className="mt-2">Vi säljer aldrig dina personuppgifter till tredje part.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Datalagring och radering</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Kontodata:</strong> bevaras så länge du har ett aktivt konto + 12 månader efter radering</li>
                <li><strong>Transaktionsdata:</strong> bevaras i 7 år (bokföringslagen)</li>
                <li><strong>Meddelanden:</strong> raderas 24 månader efter projektets avslut</li>
                <li><strong>Cookies:</strong> se avsnitt 8</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Dina rättigheter (GDPR)</h2>
              <p>Du har rätt att:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Tillgång:</strong> begära ut vilka uppgifter vi har om dig (registerutdrag)</li>
                <li><strong>Rättelse:</strong> korrigera felaktiga uppgifter</li>
                <li><strong>Radering:</strong> begära att vi raderar dina uppgifter ("rätten att bli glömd")</li>
                <li><strong>Dataportabilitet:</strong> få ut dina uppgifter i maskinläsbart format</li>
                <li><strong>Begränsning:</strong> begränsa hur vi behandlar dina uppgifter</li>
                <li><strong>Invändning:</strong> invända mot behandling baserad på berättigat intresse</li>
                <li><strong>Återkalla samtycke:</strong> när som helst för samtyckebaserad behandling</li>
              </ul>
              <p className="mt-2">Kontakta oss på <a href="mailto:gdpr@updro.se" className="text-primary hover:underline">gdpr@updro.se</a> för att utöva dina rättigheter. Vi svarar inom 30 dagar.</p>
              <p className="mt-1">Du har även rätt att lämna klagomål till <strong>Integritetsskyddsmyndigheten (IMY)</strong>: <a href="https://www.imy.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.imy.se</a></p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Cookies</h2>
              <p>Vi använder cookies för att:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Nödvändiga cookies:</strong> autentisering, sessionshantering (kräver ej samtycke)</li>
                <li><strong>Analyscookies:</strong> förbättra tjänsten (kräver samtycke)</li>
                <li><strong>Marknadsföringscookies:</strong> anpassad annonsering (kräver samtycke)</li>
              </ul>
              <p className="mt-2">Du kan hantera dina cookie-inställningar via cookie-bannern som visas vid ditt första besök, eller genom att kontakta oss.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Säkerhet</h2>
              <p>Vi skyddar dina uppgifter genom:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Krypterad dataöverföring (TLS/SSL)</li>
                <li>Krypterad lagring av lösenord (bcrypt)</li>
                <li>Row Level Security (RLS) i databasen</li>
                <li>Stripe PCI DSS Level 1 för betalningar</li>
                <li>Regelbundna säkerhetsgranskningar</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">10. Överföring till tredjeland</h2>
              <p>Vår primära databehandling sker inom EU/EES. Om uppgifter överförs utanför EU/EES säkerställer vi att lämpliga skyddsåtgärder finns, t.ex. EU:s standardavtalsklausuler (SCC) eller adequacy decision.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">11. Ändringar</h2>
              <p>Vi kan uppdatera denna policy vid behov. Väsentliga ändringar meddelas via e-post eller notis i tjänsten. Den senaste versionen finns alltid tillgänglig på denna sida.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default PrivacyPolicyPage
