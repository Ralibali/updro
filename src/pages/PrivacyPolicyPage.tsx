import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const PrivacyPolicyPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Integritetspolicy | Updro',
      description: 'Läs hur Aurora Media AB behandlar personuppgifter i Updro enligt GDPR.',
      canonical: 'https://updro.se/integritetspolicy',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Integritetspolicy</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Personuppgiftsansvarig</h2>
              <p><strong>Aurora Media AB</strong>, org.nr. <strong>559272-0220</strong>, Gustafstorpsvägen 42, 585 74 Ljungsbro, är personuppgiftsansvarig för behandlingen som beskrivs här.</p>
              <p className="mt-1">Kontakt: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a></p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. När policyn gäller</h2>
              <p>Policyn gäller när du använder Updro, skapar konto, publicerar eller besvarar uppdrag, lämnar offert, kommunicerar med oss eller andra användare, genomför betalning eller besöker updro.se. Den gäller också för begränsad företagsresearch från offentliga källor.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Personuppgifter vi behandlar</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Konto och kontakt:</strong> namn, e-postadress, telefonnummer, företagsnamn, organisationsnummer, ort och användarroll.</li>
                <li><strong>Uppdrag och offerter:</strong> behov, budget, tidsplan, bransch, projektbeskrivning, bifogade underlag, offerter, val och rapporterat projektutfall.</li>
                <li><strong>Byråprofil:</strong> presentation, tjänster, kategorier, webbplats, portfolio, verifieringsuppgifter och företagskontakt.</li>
                <li><strong>Kommunikation:</strong> meddelanden, supportärenden, kreditgranskningsärenden och annan kontakt.</li>
                <li><strong>Betalning:</strong> betalstatus, abonnemang, köp, Stripe-referenser och fakturaunderlag. Fullständiga kortuppgifter lagras inte av Updro.</li>
                <li><strong>Teknik och säkerhet:</strong> IP-adress, enhet, webbläsare, sessionsuppgifter, loggar, felhändelser, säkerhetshändelser och cookieval.</li>
                <li><strong>Analys och attribution:</strong> sidvisningar, interaktioner, landningssida, hänvisande sida och kampanjparametrar. Icke-nödvändig analys och annonsmätning används endast efter relevant samtycke.</li>
                <li><strong>Företagsresearch:</strong> företagsnamn, domän, webbadress, offentlig beskrivning, bransch/ort när det framgår, publik kontaktsida, observerbara webbplatssignaler, fit score och intern kontaktstatus.</li>
              </ul>
              <p className="mt-2">Lämna inte känsliga personuppgifter, sekretessbelagd information eller mer information än vad som behövs.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Ändamål och rättslig grund</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Tillhandahålla marknadsplatsen:</strong> konton, uppdrag, matchning, upplåsningar, offerter, meddelanden och projektstatus. Grund: avtal eller åtgärder före avtal.</li>
                <li><strong>Betalning och administration:</strong> köp, abonnemang, kvitton, redovisning och bedrägeriförebyggande. Grund: avtal, rättslig förpliktelse och berättigat intresse.</li>
                <li><strong>Kundservice, kvalitet och säkerhet:</strong> support, felsökning, moderering, missbruksbekämpning, loggning och förbättring. Grund: berättigat intresse att driva en säker och fungerande marknadsplats.</li>
                <li><strong>Grundläggande produktanalys:</strong> förstå tratt och användning med dataminimerade förstapartsuppgifter. Grund: berättigat intresse.</li>
                <li><strong>Google Analytics och Google Ads:</strong> statistik och konverteringsmätning. Grund: samtycke för respektive kategori.</li>
                <li><strong>Relevant B2B-research och individuell företagskontakt:</strong> hitta och manuellt granska företag som kan vara relevanta för Updros tjänst. Grund: berättigat intresse efter intresseavvägning.</li>
                <li><strong>Rättsliga anspråk och skyldigheter:</strong> följa lag, svara myndigheter och fastställa, göra gällande eller försvara rättsliga anspråk.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Företagsprospektering från offentliga källor</h2>
              <p>Behöriga administratörer kan använda Firecrawl för att söka efter svenska företagswebbplatser. Systemet sparar i nuläget företags- och webbplatsdata samt en offentlig kontaktsidelänk. Det samlar inte automatiskt in personnamn eller e-postadresser.</p>
              <p className="mt-2">Källorna är offentliga företagswebbplatser och sökresultat. Signaler kan exempelvis vara att en kontaktsida hittats, att vald bransch eller ort nämns eller att ett äldre copyright-år visas. Signalerna är observationer, inte påståenden om att ett företag säkert behöver en tjänst.</p>
              <p className="mt-2">En deterministisk fit score prioriterar endast intern research. Den fattar inte beslut med rättslig eller liknande betydande effekt.</p>
              <p className="mt-2">Mer information finns i vår <Link to="/integritet/prospektering" className="text-primary hover:underline">integritetsinformation för prospektering</Link>.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Varifrån uppgifterna kommer</h2>
              <p>De flesta uppgifter lämnas av dig eller andra användare. Tekniska uppgifter uppstår när tjänsten används. Betalningsstatus kommer från Stripe. Företagsresearch kommer från offentliga företagswebbplatser och sökresultat. Uppgifter kan också lämnas av en behörig företrädare för din organisation.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Mottagare och leverantörer</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Beställare och byråer:</strong> uppgifter som behövs för matchning, offert, kontakt och genomförande.</li>
                <li><strong>Supabase:</strong> databas, autentisering, lagring och teknisk drift.</li>
                <li><strong>Stripe:</strong> betalningar, abonnemang, kvitton och bedrägeriförebyggande.</li>
                <li><strong>Firecrawl:</strong> endast för behörig administrativ research av offentliga företagswebbplatser.</li>
                <li><strong>Google:</strong> Analytics och Ads endast efter relevant samtycke.</li>
                <li><strong>E-postleverantör:</strong> transaktions-, säkerhets- och servicemeddelanden.</li>
                <li><strong>Lovable och hosting-/driftleverantörer:</strong> utveckling, publicering och teknisk drift.</li>
                <li><strong>Myndigheter och rådgivare:</strong> när lag kräver det eller för rättsliga anspråk.</li>
              </ul>
              <p className="mt-2">Vi säljer inte personuppgifter.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Överföringar utanför EU/EES</h2>
              <p>Vissa leverantörer kan behandla uppgifter utanför EU/EES. Då används ett giltigt överföringsstöd, exempelvis beslut om adekvat skyddsnivå eller EU-kommissionens standardavtalsklausuler, med kompletterande skydd där det behövs.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Lagringstider</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Konto, uppdrag, offerter och meddelanden:</strong> så länge tjänsten används och normalt högst 24 månader efter avslut, om inte längre lagring behövs för tvist, säkerhet eller lagkrav.</li>
                <li><strong>Betalnings- och bokföringsunderlag:</strong> så länge tillämplig bokförings- och skattelagstiftning kräver.</li>
                <li><strong>Säkerhets- och funktionsloggar:</strong> normalt högst 12 månader, längre vid pågående incident.</li>
                <li><strong>Prospekteringsdata:</strong> högst 12 månader efter senaste research eller kontakt, om uppgifterna inte tidigare raderas eller behövs för en pågående affärsdialog.</li>
                <li><strong>Kontakta-ej-markering:</strong> så länge det behövs för att respektera invändningen.</li>
                <li><strong>Cookieval:</strong> högst 12 månader eller tills du ändrar valet.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">10. Dina rättigheter</h2>
              <p>Du kan, beroende på omständigheterna, begära tillgång, rättelse, radering, begränsning och dataportabilitet samt invända mot behandling som grundas på berättigat intresse. Du kan återkalla samtycke för framtida behandling.</p>
              <p className="mt-2"><strong>Direktmarknadsföring:</strong> du kan när som helst invända. När vi får invändningen upphör behandlingen för direktmarknadsföring. Mejla <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
              <p className="mt-2">Vi kan behöva verifiera identitet och svarar normalt inom en månad. Du kan lämna klagomål till Integritetsskyddsmyndigheten, IMY.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">11. Automatiserade beslut</h2>
              <p>Updro fattar inte beslut enbart genom automatiserad behandling som har rättsliga eller liknande betydande konsekvenser. Matchnings-, kvalitets- och fit-signaler används som beslutsstöd och kan granskas av människor.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">12. Säkerhet och incidenter</h2>
              <p>Vi använder bland annat behörighetsstyrning, autentisering, krypterad överföring, databasregler, loggning, rate limits och säkerhetsgranskningar. Vid en personuppgiftsincident agerar vi enligt tillämpliga anmälnings- och informationskrav.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">13. Ändringar</h2>
              <p>Vi uppdaterar policyn när tjänsten, leverantörerna eller behandlingen förändras. Väsentliga ändringar meddelas på lämpligt sätt.</p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default PrivacyPolicyPage
