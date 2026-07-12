import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const PrivacyPolicyPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Integritetspolicy | Updro',
      description: 'Updros integritetspolicy enligt GDPR och svensk dataskyddslag. Aurora Media AB förklarar vilka personuppgifter vi behandlar och varför.',
      canonical: 'https://updro.se/integritetspolicy',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Integritetspolicy</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12 · Version 3.0</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Personuppgiftsansvarig</h2>
              <p><strong>Aurora Media AB</strong>, org.nr <strong>559272-0220</strong>, är personuppgiftsansvarig för behandling av personuppgifter inom tjänsten Updro (updro.se).</p>
              <p className="mt-1">Postadress: Aurora Media AB, c/o Kivra 559272-0220, 106 31 Stockholm.<br />
              Kontakt för dataskyddsfrågor: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
              <p className="mt-1 text-xs text-muted-foreground">Aurora Media AB har utsett en intern kontaktpunkt för dataskyddsfrågor. Vi har bedömt att formell dataskyddsombuds­skyldighet enligt art. 37 GDPR inte gäller för verksamheten i nuläget.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Vilka uppgifter vi behandlar</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Kontakt- och kontouppgifter:</strong> namn, e-post, telefon, företag, org.nr, roll och stad.</li>
                <li><strong>Uppdragsinformation:</strong> projektbeskrivning, budget, tidsplan, bransch, önskade tjänster, bilagor och övrig information i formulär och meddelanden.</li>
                <li><strong>Byråprofil:</strong> företagsuppgifter, presentation, portfolio, kategorier, webbplats, logotyp och referenser.</li>
                <li><strong>Kommunikation:</strong> meddelanden, offerter, omdömen och supportärenden.</li>
                <li><strong>Betal- och transaktionsuppgifter:</strong> plan, abonnemangsstatus, fakturor och kvitton. Kortuppgifter hanteras av Stripe och lagras aldrig hos oss.</li>
                <li><strong>Teknisk information:</strong> IP-adress, webbläsare, enhet, tekniska loggar, säkerhetshändelser (t.ex. rate limit) och cookieval.</li>
                <li><strong>Analys- och marknadsföringsdata:</strong> sidvisningar, klick, konverteringar och kampanjdata — endast efter samtycke.</li>
              </ul>
              <p className="mt-2">Vi behandlar inte känsliga personuppgifter (art. 9 GDPR) medvetet och ber dig att inte skicka sådana i uppdrag eller chatt.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Ändamål och rättslig grund</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Tillhandahålla tjänsten</strong> (konto, matchning, offert, meddelanden): <em>fullgörande av avtal</em>, art. 6.1 b.</li>
                <li><strong>Kundservice, felsökning, säkerhet och missbruksskydd:</strong> <em>berättigat intresse</em>, art. 6.1 f.</li>
                <li><strong>Betalning och bokföring:</strong> <em>avtal</em> samt <em>rättslig förpliktelse</em> enligt bokföringslagen (1999:1078), art. 6.1 b och c.</li>
                <li><strong>Analys och marknadsföringscookies:</strong> <em>samtycke</em>, art. 6.1 a jämfört med 9 kap. LEK (2022:482).</li>
                <li><strong>Utskick av servicemeddelanden</strong> till registrerade användare: berättigat intresse. Nyhetsbrev endast med samtycke.</li>
                <li><strong>Efterlevnad av rättsliga skyldigheter</strong> (t.ex. penningtvätt, DSA, myndighetsförelägganden): rättslig förpliktelse, art. 6.1 c.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Cookies och spårning</h2>
              <p>Vi använder nödvändiga cookies för att tjänsten ska fungera samt, efter aktivt samtycke, cookies för statistik (Google Analytics) och marknadsföringsmätning (Google Ads). Google-taggen laddas <strong>inte</strong> innan du samtyckt. Se vår <a href="/cookies" className="text-primary hover:underline">cookiepolicy</a> för fullständig lista och möjlighet att ändra ditt val.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Mottagare och personuppgiftsbiträden</h2>
              <p>Vi delar personuppgifter endast när det krävs för tjänsten, drift, säkerhet, betalning eller lag.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Andra användare:</strong> relevanta uppgifter delas mellan beställare och byrå i ett gemensamt uppdrag för att möjliggöra offert och leverans.</li>
                <li><strong>Underbiträden vi använder idag:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li><em>Supabase / Lovable Cloud</em> — hosting, databas, autentisering, edge functions och lagring (EU).</li>
                    <li><em>Stripe Payments Europe Ltd</em> — betalning, abonnemang, faktura och kortdata (EU/US, SCC).</li>
                    <li><em>Resend</em> — transaktions- och verifieringsmail (EU/US, SCC).</li>
                    <li><em>Google Ireland Ltd</em> — Google Analytics, Google Ads och Google Search Console (efter samtycke; SCC).</li>
                    <li><em>Lovable AI Gateway / Google Gemini</em> — AI-genererat redaktionellt innehåll och adminverktyg. Inga användarpersonuppgifter används som träningsdata.</li>
                    <li><em>Firecrawl</em> — endast intern administrativ företagsresearch mot publika webbkällor. Ingen kontakt eller e-postinsamling sker.</li>
                  </ul>
                </li>
                <li><strong>Myndigheter, domstolar och rättighetsinnehavare</strong> när vi enligt lag eller giltig begäran är skyldiga att lämna ut uppgifter.</li>
              </ul>
              <p className="mt-2">Alla biträden är bundna av personuppgiftsbiträdesavtal (art. 28 GDPR). Vi säljer aldrig personuppgifter.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Överföring utanför EU/EES</h2>
              <p>Vi strävar efter att behandla uppgifter inom EU/EES. När leverantörer (t.ex. Stripe, Google, Resend) medför överföring till tredje land skyddas överföringen med EU-kommissionens standardavtalsklausuler (SCC 2021/914) och vid behov kompletterande skyddsåtgärder såsom kryptering och åtkomstbegränsning. Kopia på skyddsåtgärder kan begäras via <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Lagringstid</h2>
              <p>Vi sparar personuppgifter så länge det är nödvändigt för ändamålet och därefter enligt lag.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Kontouppgifter:</strong> så länge kontot är aktivt. Vid avslut raderas eller anonymiseras uppgifter inom rimlig tid, med undantag för uppgifter som måste sparas enligt lag.</li>
                <li><strong>Uppdrag, offerter och meddelanden:</strong> så länge det behövs för att tillhandahålla tjänsten, hantera historik och eventuella tvister — som utgångspunkt inom preskriptionstiden enligt preskriptionslagen (1981:130), normalt tio år.</li>
                <li><strong>Fakturor och bokföringsmaterial:</strong> sju år efter räkenskapsårets utgång enligt bokföringslagen (1999:1078).</li>
                <li><strong>Säkerhets- och åtkomstloggar:</strong> så länge det behövs för säkerhetsändamål, som utgångspunkt högst tolv månader.</li>
                <li><strong>Cookieval:</strong> upp till tolv månader eller tills du ändrar det.</li>
                <li><strong>Analys- och marknadsföringsdata:</strong> enligt inställningarna hos aktuell leverantör, och endast om du samtyckt.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Dina rättigheter</h2>
              <p>Enligt GDPR har du rätt att:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>begära <strong>tillgång</strong> (registerutdrag) till dina uppgifter,</li>
                <li>begära <strong>rättelse</strong> av felaktiga uppgifter,</li>
                <li>begära <strong>radering</strong> ("rätten att bli glömd") i de fall lagen tillåter,</li>
                <li>begära <strong>begränsning</strong> av behandling,</li>
                <li>invända mot behandling som stödjer sig på berättigat intresse,</li>
                <li>begära <strong>dataportabilitet</strong> när behandlingen grundas på avtal eller samtycke,</li>
                <li>när som helst <strong>återkalla samtycke</strong> för framtida behandling.</li>
              </ul>
              <p className="mt-2">Kontakta <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>. Vi besvarar begäran utan onödigt dröjsmål och senast inom en månad.</p>
              <p className="mt-1">Om du är missnöjd med hur vi behandlar dina personuppgifter har du rätt att lämna klagomål till <strong>Integritetsskyddsmyndigheten (IMY)</strong>: <a href="https://www.imy.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.imy.se</a>.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Automatiserat beslutsfattande och profilering</h2>
              <p>Updro fattar inga rättsligt bindande beslut om dig enbart genom automatiserad behandling. Matchning mellan uppdrag och byråer är teknisk hjälp och innebär ingen automatisk profilering enligt art. 22 GDPR.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">10. Säkerhet och incidenter</h2>
              <p>Vi tillämpar tekniska och organisatoriska säkerhetsåtgärder: kryptering i transport (TLS), åtkomstkontroll, rollbaserade databasregler (RLS), loggning, rate limiting och separation av admin- och användarrättigheter. Vid personuppgiftsincident som sannolikt medför risk för dig anmäler vi till IMY inom 72 timmar och informerar dig när lagen kräver det.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">11. Barn</h2>
              <p>Tjänsten riktar sig inte till barn under 16 år och vi behandlar inte medvetet uppgifter om sådana.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">12. Ändringar</h2>
              <p>Vi kan uppdatera policyn när tjänsten, leverantörer eller lag förändras. Väsentliga ändringar meddelas via tjänsten eller e-post. Aktuell version finns alltid på denna sida.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default PrivacyPolicyPage
