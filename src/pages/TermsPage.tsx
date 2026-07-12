import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const TermsPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Allmänna villkor | Updro',
      description: 'Updros allmänna villkor för beställare och byråer. Prisinformation, ångerrätt, ansvarsbegränsning och tvistlösning enligt svensk lag.',
      canonical: 'https://updro.se/villkor',
    })
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Allmänna villkor</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12 · Version 3.0</p>

          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Om tjänsten och leverantören</h2>
              <p>Tjänsten Updro (updro.se) tillhandahålls av <strong>Aurora Media AB</strong>, org.nr <strong>559272-0220</strong>, c/o Kivra 559272-0220, 106 31 Stockholm. E-post: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
              <p className="mt-2">Updro är en förmedlingsplattform (en informationssamhällets tjänst enligt e-handelslagen 2002:562 och DSA, förordning EU 2022/2065) som kopplar samman beställare av digitala tjänster med byråer och konsulter ("Leverantörer"). Updro är inte part i det avtal som ingås mellan beställare och leverantör. Ansvar för leverans, kvalitet och betalning ligger hos respektive part.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Registrering och konto</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Du måste vara minst 18 år och behörig att ingå avtal.</li>
                <li>Juridiska personer registreras av behörig företrädare.</li>
                <li>Uppgifter i kontot ska vara korrekta och hållas uppdaterade.</li>
                <li>Du ansvarar för all aktivitet som sker via ditt konto och för att skydda dina inloggningsuppgifter.</li>
                <li>Endast ett konto per person/organisation är tillåtet.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Beställare</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Det är kostnadsfritt att publicera uppdrag och ta emot offerter.</li>
                <li>Du ska lämna korrekt och tillräcklig information om uppdraget.</li>
                <li>Du väljer själv leverantör och ansvarar för att utvärdera denne.</li>
                <li>Avtal om leverans ingås direkt mellan dig och leverantören.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Leverantörer – priser och betalning</h2>
              <h3 className="font-semibold text-foreground mt-3 mb-1">4.1 Provperiod</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nya leverantörer kan erbjudas en kostnadsfri provperiod om sju dagar med begränsat antal lead-krediter.</li>
                <li>Provperioden avslutas automatiskt efter sju dagar eller när samtliga krediter förbrukats. Inget betalkort krävs.</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">4.2 Priser (prisinformationslagen 2004:347)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Pay as you go:</strong> 119 kr per lead (öppningserbjudande, exkl. moms).</li>
                <li><strong>Standard:</strong> 699 kr/månad, tio leads inkluderade (exkl. moms).</li>
                <li><strong>Premium:</strong> 1 490 kr/månad, obegränsat antal leads (exkl. moms).</li>
                <li>Alla priser anges i SEK. Moms (25%) tillkommer om inget annat framgår. Totalpris inkl. moms visas alltid före köp.</li>
              </ul>

              <h3 className="font-semibold text-foreground mt-3 mb-1">4.3 Betalning och fakturering</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Betalning sker via Stripe. Du ansvarar för giltiga betalningsuppgifter.</li>
                <li>Abonnemang faktureras månadsvis i förskott. Enskilda leads faktureras vid köp.</li>
                <li>Kvitton och fakturor finns tillgängliga i ditt konto under Fakturering och skickas per e-post.</li>
                <li>Vid utebliven betalning kan tjänsten stängas av tills betalning skett.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Ångerrätt för konsumenter</h2>
              <p>För konsumenter gäller <strong>lag (2005:59) om distansavtal och avtal utanför affärslokaler</strong>. Du har rätt att frånträda avtalet inom 14 dagar från att avtalet ingicks utan att ange något skäl.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Ångerrätten gäller för prenumerationer (Standard/Premium).</li>
                <li>Ångerrätten gäller <strong>inte</strong> enskilda lead-köp (Pay as you go) som redan levererats/använts, eftersom tjänsten fullgjorts med ditt uttryckliga samtycke och du bekräftat att ångerrätten upphör (2 kap. 11 § 1 st. 1 p. distansavtalslagen; jfr art. 16 a Konsumenträttsdirektivet 2011/83/EU).</li>
                <li>För att utöva ångerrätten, kontakta <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a> inom 14 dagar. Du kan använda <a href="https://publikationer.konsumentverket.se/kontrakt-och-mallar/angerblankett" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Konsumentverkets ångerblankett</a>.</li>
                <li>Återbetalning sker inom 14 dagar från mottaget ångermeddelande till samma betalningsmetod du använde.</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Näringsidkare (företag som handlar för verksamhet) omfattas inte av ångerrätten enligt distansavtalslagen.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Uppsägning av abonnemang</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Du kan säga upp ditt abonnemang när som helst under Fakturering i ditt konto.</li>
                <li>Uppsägningen träder i kraft vid utgången av innevarande betalperiod.</li>
                <li>Inga bindningstider gäller.</li>
                <li>Outnyttjade lead-krediter återbetalas inte vid uppsägning.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Uppföranderegler och otillåtet innehåll (DSA)</h2>
              <p>Följande är inte tillåtet på Updro:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Falska uppgifter, manipulering av omdömen eller identitetskapning.</li>
                <li>Försök att kringgå plattformens betalnings- eller matchningssystem.</li>
                <li>Spam, trakasserier, hot, hets eller diskriminerande innehåll.</li>
                <li>Innehåll som gör intrång i tredje parts rättigheter (upphovsrätt, varumärke, personuppgifter).</li>
                <li>Automatiserad åtkomst (scraping, bots) utan skriftligt tillstånd.</li>
                <li>Innehåll som är olagligt enligt svensk eller EU-rätt.</li>
              </ul>
              <p className="mt-2">Överträdelser kan leda till varning, borttagning av innehåll, tillfällig avstängning eller uppsägning av konto. Anmälan om olagligt innehåll enligt art. 16 DSA görs till <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a> med rubrik "DSA – anmälan". Beslut motiveras och kan överklagas till Aurora Media AB genom svar på beslutet inom sex månader.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Upphovsrätt och användargenererat innehåll</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Du behåller alla rättigheter till innehåll du laddar upp.</li>
                <li>Du ger Updro en icke-exklusiv, avgiftsfri, världsomfattande licens att lagra, visa och tillgängliggöra innehållet i den utsträckning som krävs för att driva och marknadsföra tjänsten.</li>
                <li>Du ansvarar för att du har rätt att publicera innehållet och att det inte gör intrång i tredje parts rättigheter.</li>
                <li>Updro får ta bort innehåll som strider mot dessa villkor eller lag.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Personuppgifter</h2>
              <p>Aurora Media AB behandlar personuppgifter enligt vår <a href="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</a>. Genom att använda tjänsten godkänner du att uppgifter behandlas i enlighet med policyn.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">10. Ansvarsbegränsning</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Updro ansvarar inte för avtal, leveranser eller tvister mellan beställare och leverantörer.</li>
                <li>Updro garanterar inte kvaliteten på leverantörers arbete eller beställares betalningsförmåga.</li>
                <li>Updros samlade skadeståndsansvar gentemot dig är, i den mån det är tillåtet enligt lag, begränsat till det belopp du betalat till Updro under de senaste tolv månaderna.</li>
                <li>Updro ansvarar inte för indirekt skada, utebliven vinst eller förlust av data.</li>
                <li>Ansvarsbegränsningarna gäller inte vid uppsåt, grov vårdslöshet eller där de enligt tvingande konsumentskyddslag inte får åberopas.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">11. Force majeure</h2>
              <p>Ingen part ansvarar för dröjsmål eller utebliven prestation som beror på omständighet utanför partens kontroll, till exempel krig, myndighetsbeslut, arbetskonflikt, avbrott hos underleverantör, naturkatastrof eller cyberattack.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">12. Ändringar av villkoren</h2>
              <p>Vi kan ändra villkoren när tjänsten, leverantörer eller lag förändras. Väsentliga ändringar meddelas minst 30 dagar i förväg via e-post eller notis i tjänsten. Om du inte accepterar ändringen kan du säga upp tjänsten före ikraftträdandet. Fortsatt användning innebär att du accepterar de uppdaterade villkoren.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">13. Tvistlösning och tillämplig lag</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Svensk lag tillämpas på dessa villkor, dock utan tillämpning av lagvalsregler som skulle leda till annan lag.</li>
                <li>Tvister ska i första hand lösas genom förhandling.</li>
                <li>Konsumenter kan kostnadsfritt vända sig till <strong>Allmänna reklamationsnämnden (ARN)</strong>: <a href="https://www.arn.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.arn.se</a>, box 174, 101 23 Stockholm. Vi åtar oss att medverka i ARN:s förfarande.</li>
                <li>EU:s onlineplattform för tvistlösning: <a href="https://ec.europa.eu/odr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">ec.europa.eu/odr</a>.</li>
                <li>Klagomål om personuppgifter kan lämnas till <strong>Integritetsskyddsmyndigheten (IMY)</strong>: <a href="https://www.imy.se" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.imy.se</a>.</li>
                <li>Om tvisten inte kan lösas på annat sätt avgörs den av svensk allmän domstol med Stockholms tingsrätt som första instans, om inte tvingande lag anger annat.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">14. Kontakt</h2>
              <p>Aurora Media AB<br />
              c/o Kivra 559272-0220, 106 31 Stockholm<br />
              Organisationsnummer: 559272-0220<br />
              E-post: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a></p>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default TermsPage
