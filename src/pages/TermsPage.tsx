import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'
import { MAX_OFFERS_PER_PROJECT, STRIPE_PRODUCTS, TRIAL_DAYS, TRIAL_LEADS } from '@/lib/constants'

const sek = (value: number) => new Intl.NumberFormat('sv-SE').format(value)

const TermsPage = () => {
  useEffect(() => {
    setSEOMeta({ title: 'Allmänna villkor | Updro', description: 'Allmänna villkor för beställare och byråer som använder Updro.', canonical: 'https://updro.se/villkor' })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="font-display text-3xl font-bold mb-2">Allmänna villkor</h1>
          <p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12</p>
          <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-2">1. Avtalspart</h2>
              <p><strong>Aurora Media AB</strong>, org.nr. <strong>559272-0220</strong>, VAT-nr <strong>SE559272022001</strong>, Gustafstorpsvägen 42, 585 74 Ljungsbro, Sverige, driver Updro. Kontakt: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p>
              <p className="mt-2">Villkoren gäller när du använder updro.se eller ett Updro-konto. Genom registrering eller användning accepterar du dem.</p>
            </div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">2. Tjänstens roll</h2><p>Updro är en digital marknadsplats som hjälper beställare att beskriva digitala behov och komma i kontakt med byråer eller konsulter (“Leverantörer”). Updro administrerar och modererar plattformen men utför normalt inte det publicerade uppdraget.</p><p className="mt-2">Projektavtal om omfattning, pris, leverans, sekretess, immateriella rättigheter och betalning ingås direkt mellan beställaren och vald Leverantör. Updro är inte part i projektavtalet om inget annat uttryckligen avtalats skriftligen.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">3. Behörighet och konto</h2><ul className="list-disc pl-5 space-y-1"><li>Du måste vara minst 18 år och behörig att ingå avtal.</li><li>En företagsföreträdare ansvarar för nödvändig behörighet.</li><li>Betalda Leverantörstjänster erbjuds för användning i näringsverksamhet och priser anges exklusive moms.</li><li>En beställare ska upplysa Leverantören om den agerar som konsument. Leverantören ansvarar för tvingande konsumenträtt i projektavtalet.</li><li>Kontouppgifter ska vara korrekta och aktuella. Du ansvarar för inloggningsuppgifter och aktivitet under kontot.</li><li>Updro får kräva verifiering. Verifiering är inte en garanti för kvalitet, betalningsförmåga eller framtida agerande.</li></ul></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">4. Beställarens ansvar</h2><ul className="list-disc pl-5 space-y-1"><li>Det är kostnadsfritt att publicera en förfrågan och ta emot offerter, om inget annat tydligt anges i förväg.</li><li>Förfrågan ska avse ett verkligt, lagligt och tillräckligt beskrivet behov med rimligt korrekta kontaktuppgifter, budget och tidsram.</li><li>Beställaren ansvarar för att granska Leverantör, offert, referenser och projektavtal.</li><li>Känsliga personuppgifter, företagshemligheter eller material som beställaren saknar rätt att dela får inte publiceras.</li><li>Beställaren är inte skyldig att välja en Leverantör men ska agera seriöst och respektera offertmaterial och immateriella rättigheter.</li></ul></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">5. Leverantörens ansvar</h2><ul className="list-disc pl-5 space-y-1"><li>Profil, kompetens, portfolio, företagsuppgifter och offerter ska vara korrekta och inte vilseledande.</li><li>Leverantören väljer själv vilka uppdrag som låses upp och ska läsa brief, budget och tidsram före köp.</li><li>Offerter ska tydligt ange omfattning, pris, moms, tidsplan, antaganden och villkor.</li><li>Leverantören ansvarar för skatter, registreringar, tillstånd, försäkringar och lagkrav.</li><li>Kontaktuppgifter från Updro får endast användas för det aktuella uppdraget och inte säljas eller användas för otillåten massmarknadsföring.</li></ul></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">6. Matchning och rangordning</h2><p>Updro försöker matcha varje förfrågan med relevanta Leverantörer. Högst <strong>{MAX_OFFERS_PER_PROJECT}</strong> Leverantörer kan normalt lämna offert på samma uppdrag.</p><p className="mt-2">Matchning och visningsordning kan påverkas av kategori, tjänst, ort, budget, tidsram, profilens fullständighet, verifieringsstatus, aktivitet, tillgänglighet och kvalitets- eller säkerhetssignaler. Betalning ger inte i sig rätt till viss placering, leadvolym eller affär.</p><p className="mt-2">Updro garanterar inte godkännande, matchning, svar, offert eller ingånget projektavtal.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">7. Provperiod och priser</h2><p>Nya Leverantörer kan erbjudas <strong>{TRIAL_DAYS} dagars</strong> provperiod med <strong>{TRIAL_LEADS} lead-krediter</strong>.</p><ul className="list-disc pl-5 mt-2 space-y-1"><li><strong>Enskilt lead:</strong> {sek(STRIPE_PRODUCTS.lead.price)} kr per upplåsning.</li><li><strong>Månadskort:</strong> {sek(STRIPE_PRODUCTS.monthly.price)} kr per månad.</li><li><strong>Årskort:</strong> {sek(STRIPE_PRODUCTS.yearly.price)} kr per år.</li></ul><p className="mt-2">Samtliga priser är exklusive moms. Pris och omfattning som visas i checkout gäller för köpet.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">8. Betalning, förnyelse och uppsägning</h2><ul className="list-disc pl-5 space-y-1"><li>Stripe hanterar betalningar. Leverantören ansvarar för giltig betalningsmetod och fakturainformation.</li><li>Enskilda leads debiteras vid köp. Månads- och årsabonnemang förnyas automatiskt tills de sägs upp.</li><li>Uppsägning görs via faktureringssidan och gäller från nästa förnyelsedatum. Tillgången fortsätter normalt till slutet av betald period.</li><li>Påbörjad betalperiod och korrekt levererad upplåsning återbetalas normalt inte, om inte lag eller uttryckligt erbjudande säger annat.</li><li>Vid utebliven betalning får Updro pausa abonnemang, krediter eller kontofunktioner.</li></ul></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">9. Kreditgranskning av lead</h2><p>Leverantören kan begära granskning om ett upplåst lead exempelvis har ogiltiga kontaktuppgifter, är uppenbart falskt, en tydlig dubblett eller väsentligen avviker från briefen.</p><ul className="list-disc pl-5 mt-2 space-y-1"><li>Begäran ska lämnas skyndsamt med saklig förklaring.</li><li>Granskning innebär inte automatisk återbetalning.</li><li>Godkänd granskning ger normalt en lead-kredit, inte kontant ersättning.</li><li>Att beställaren ändrar sig, inte väljer Leverantören eller inte svarar efter korrekt kontakt gör inte i sig leadet ogiltigt.</li><li>Samma upplåsning kan endast krediteras en gång.</li></ul></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">10. Innehåll och rättigheter</h2><ul className="list-disc pl-5 space-y-1"><li>Du behåller rättigheterna till eget material men ger Updro en begränsad rätt att lagra, bearbeta och visa det för tjänstens funktion.</li><li>Du ansvarar för att materialet är lagligt och inte gör intrång i tredje mans rättigheter.</li><li>Omdömen ska bygga på verklig erfarenhet och får inte köpas, fabriceras eller manipuleras.</li><li>Updro får märka, begränsa eller ta bort innehåll som strider mot lag, villkoren eller plattformens säkerhet.</li></ul></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">11. Förbjuden användning</h2><p>Falska eller olagliga uppgifter, spam, trakasserier, otillåten marknadsföring, manipulerade omdömen, bedrägeri, kringgående av betalning eller åtkomstkontroller, obehörig scraping, skadlig kod och försök till obehörig åtkomst är förbjudna.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">12. Moderering och anmälan</h2><p>Misstänkt olagligt eller regelstridigt innehåll kan anmälas via <Link to="/rapportera-innehall" className="text-primary hover:underline">Rapportera innehåll</Link>. Updro får rätta, begränsa, ta bort eller stänga av när det behövs för lag, säkerhet eller villkorsefterlevnad.</p><p className="mt-2">När det är möjligt lämnas skäl och möjlighet till omprövning. Brådskande risk, missbruk eller rättsligt hinder kan motivera omedelbar åtgärd eller begränsad information.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">13. Tillgänglighet och ansvar</h2><p>Updro garanterar inte oavbruten eller felfri drift och ansvarar inte för användarnas projektavtal, leveranser, betalningar eller indirekta skador såsom utebliven vinst.</p><p className="mt-2">I den utsträckning lag tillåter är Updros sammanlagda ansvar begränsat till beloppet den berörda användaren betalat till Updro under de senaste tolv månaderna. Begränsningen gäller inte vid uppsåt, grov vårdslöshet eller när tvingande lag säger annat.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">14. Personuppgifter och sekretess</h2><p>Personuppgifter behandlas enligt vår <Link to="/integritetspolicy" className="text-primary hover:underline">integritetspolicy</Link>. När kontaktuppgifter delats ansvarar parterna självständigt för sin fortsatta behandling. Tydligt konfidentiell information får inte användas utanför uppdraget utan rättslig grund eller tillstånd.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">15. Avslut och ändringar</h2><p>Updro får pausa eller avsluta konto vid väsentligt eller upprepat avtalsbrott, utebliven betalning, säkerhetsrisk, bedrägeri, olaglig användning eller myndighetskrav. Om rimligt får användaren möjlighet att rätta bristen.</p><p className="mt-2">Villkoren får ändras när tjänsten, kostnaderna, riskerna eller lagkraven förändras. Väsentliga ändringar för befintliga betalande användare meddelas normalt minst 30 dagar i förväg, utom när lag eller säkerhet kräver snabbare ändring.</p></div>

            <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">16. Lag och tvist</h2><p>Svensk lag gäller. Tvist mellan Updro och en näringsidkare avgörs av svensk allmän domstol efter att parterna först försökt lösa den genom dialog. Tvingande konsumentskydds- och forumregler påverkas inte.</p></div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export default TermsPage
