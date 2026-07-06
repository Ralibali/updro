/**
 * Single source of truth for pricing shown on:
 *  - LandingPage.tsx (kalkylatorn)
 *  - /priser/:slug prisguide-sidorna
 *
 * Ändra aldrig priser på båda ställena – ändra bara här.
 */

export type LevelKey = 'enkel' | 'standard' | 'avancerad'

export type PriceCell = { range: string; time: string; matches: number }

export const PRICE_MATRIX: Record<string, Record<LevelKey, PriceCell>> = {
  hemsida: {
    enkel: { range: '25 000 – 45 000 kr', time: '2–3 veckor', matches: 24 },
    standard: { range: '45 000 – 90 000 kr', time: '4–6 veckor', matches: 31 },
    avancerad: { range: '90 000 – 180 000 kr', time: '8–12 veckor', matches: 18 },
  },
  ehandel: {
    enkel: { range: '50 000 – 90 000 kr', time: '4–6 veckor', matches: 17 },
    standard: { range: '90 000 – 180 000 kr', time: '6–10 veckor', matches: 22 },
    avancerad: { range: '180 000 – 400 000 kr', time: '10–16 veckor', matches: 12 },
  },
  seo: {
    enkel: { range: '8 000 – 15 000 kr/mån', time: 'löpande', matches: 28 },
    standard: { range: '15 000 – 30 000 kr/mån', time: 'löpande', matches: 21 },
    avancerad: { range: '30 000 – 60 000 kr/mån', time: 'löpande', matches: 11 },
  },
  ads: {
    enkel: { range: '6 000 – 12 000 kr/mån', time: 'löpande', matches: 19 },
    standard: { range: '12 000 – 25 000 kr/mån', time: 'löpande', matches: 15 },
    avancerad: { range: '25 000 – 50 000 kr/mån', time: 'löpande', matches: 9 },
  },
  app: {
    enkel: { range: '100 000 – 200 000 kr', time: '8–12 veckor', matches: 11 },
    standard: { range: '200 000 – 450 000 kr', time: '12–20 veckor', matches: 14 },
    avancerad: { range: '450 000 – 900 000 kr', time: '20–32 veckor', matches: 7 },
  },
  design: {
    enkel: { range: '20 000 – 40 000 kr', time: '2–3 veckor', matches: 26 },
    standard: { range: '40 000 – 80 000 kr', time: '3–5 veckor', matches: 20 },
    avancerad: { range: '80 000 – 160 000 kr', time: '5–8 veckor', matches: 12 },
  },
}

/** Kalkylatorns pill-val på landningssidan. `id` matchar nycklar i PRICE_MATRIX. */
export const PROJECT_TYPES = [
  { id: 'hemsida', label: 'Ny hemsida', query: 'Ny hemsida', guideSlug: 'hemsida' },
  { id: 'ehandel', label: 'E-handel', query: 'E-handel', guideSlug: 'e-handel' },
  { id: 'seo', label: 'SEO', query: 'SEO', guideSlug: 'seo' },
  { id: 'ads', label: 'Google Ads', query: 'Google Ads', guideSlug: 'google-ads' },
  { id: 'app', label: 'Apputveckling', query: 'Apputveckling', guideSlug: 'apputveckling' },
  { id: 'design', label: 'Design & varumärke', query: 'Design & varumärke', guideSlug: 'design' },
] as const

export type LevelCopy = { level: LevelKey; label: string; includes: string }

export interface PriceGuide {
  slug: string
  matrixKey: keyof typeof PRICE_MATRIX
  title: string
  metaDescription: string
  h1: string
  serviceLabel: string
  quickAnswer: string
  intro: string
  levels: LevelCopy[]
  drivers: string[]
  warnings: string[]
  faq: { q: string; a: string }[]
  categorySlug: string
  categoryLabel: string
  wizardCategoryQuery: string
  relatedArticleSlugs: [string, string]
}

const desc = (service: string) =>
  `Se vad ${service} faktiskt kostar 2026 – prisintervall för enkel, standard och avancerad nivå baserat på offerter från granskade svenska byråer. Jämför gratis.`

export const PRICE_GUIDES: PriceGuide[] = [
  {
    slug: 'hemsida',
    matrixKey: 'hemsida',
    title: 'Vad kostar en hemsida 2026? Priser från svenska byråer',
    metaDescription: desc('en hemsida'),
    h1: 'Vad kostar en hemsida 2026?',
    serviceLabel: 'hemsida',
    quickAnswer: 'En standardhemsida med unik design och CMS kostar normalt 45 000–90 000 kr hos en svensk byrå.',
    intro:
      'Priset på en hemsida varierar från 25 000 kr till över 180 000 kr beroende på omfattning. Här är vad svenska byråer faktiskt tar – och vad du får för pengarna.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Mallbaserad design, 5–8 sidor, kontaktformulär, grundläggande SEO' },
      { level: 'standard', label: 'Standard', includes: 'Unik design, 10–20 sidor, CMS, blogg, konverteringsoptimering' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Skräddarsydd plattform, integrationer, flerspråk, avancerad funktionalitet' },
    ],
    drivers: [
      'Unik design vs färdigt tema – ett skräddarsytt gränssnitt kostar 3–5 gånger mer än ett tema.',
      'Antal sidor och språkversioner – varje extra språk lägger normalt 20–40 % på priset.',
      'Val av CMS – WordPress, Sanity, Webflow eller headless påverkar både bygg- och driftkostnad.',
      'Integrationer mot CRM, bokningssystem eller betalning – varje integration är oftast 5 000–20 000 kr extra.',
      'Om copywriting ingår eller om du levererar texterna själv.',
    ],
    warnings: [
      'Offerten saknar CMS – då kan du inte uppdatera själv och blir helt beroende av byrån.',
      'Fastprisofferten specificerar inte antal revisionsrundor. Räkna med tilläggsfakturor.',
      'Inget driftavtal ingår. Vem uppdaterar plattformen, säkerhetsfixar och backup?',
    ],
    faq: [
      { q: 'Varför är prisskillnaden så stor mellan byråer?', a: 'Skillnaden beror mest på seniornivå på designer och utvecklare, hur mycket unikt arbete som ingår vs mall, och om strategi och copy räknas in i priset.' },
      { q: 'Är en billig hemsida från Fiverr ett alternativ?', a: 'För en ren visitkortssida kan det räcka. För något som ska driva affär – konverteringsoptimering, integrationer, SEO – blir slutresultatet nästan alltid dyrare eftersom du får bygga om.' },
      { q: 'Vad kostar drift och underhåll per år?', a: 'Räkna normalt med 3 000–15 000 kr per år för hosting, SSL, säkerhetsuppdateringar och mindre justeringar. Aktiva webbplatser med löpande innehållsarbete ligger högre.' },
      { q: 'Hur lång tid tar det att bygga en hemsida?', a: 'En enkel sajt tar 2–3 veckor, en standard 4–6 veckor och avancerade projekt 8–12 veckor från kickoff till lansering.' },
    ],
    categorySlug: 'webbutveckling',
    categoryLabel: 'Webbutvecklingsbyråer',
    wizardCategoryQuery: 'Ny hemsida',
    relatedArticleSlugs: ['vad-kostar-en-hemsida-2026', 'hur-valjer-man-webbyra'],
  },
  {
    slug: 'e-handel',
    matrixKey: 'ehandel',
    title: 'Vad kostar en e-handel 2026? Shopify, Woo & custom',
    metaDescription: desc('en e-handelsbutik'),
    h1: 'Vad kostar en e-handelsbutik 2026?',
    serviceLabel: 'e-handelsbutik',
    quickAnswer: 'En standard e-handelsbutik med anpassad design och integrationer kostar normalt 90 000–180 000 kr hos en svensk byrå.',
    intro:
      'En e-handelsbutik kostar från 50 000 kr för en enkel Shopify-setup till 400 000 kr+ för en skräddarsydd lösning. Plattformsvalet avgör mer än du tror.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Shopify/WooCommerce med tema, upp till 100 produkter, betalning & frakt' },
      { level: 'standard', label: 'Standard', includes: 'Anpassad design, produktimport, integrationer mot lager/ekonomi' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Headless/custom, ERP-integration, B2B-funktioner, flera marknader' },
    ],
    drivers: [
      'Plattformsval – Shopify har lägre startpris men procent på omsättning; WooCommerce är billigare löpande men kräver mer utveckling.',
      'Antal produkter och varianter – manuell inmatning vs feed-import gör stor skillnad.',
      'Integrationer mot affärssystem som Fortnox, Visma eller Business Central.',
      'Migrering från befintlig butik – URL-mappning och SEO-överföring är ofta underskattat.',
      'B2B-funktionalitet som prislistor per kund, offertflöde och inloggning.',
    ],
    warnings: [
      'Offerten prissätter inte migreringen av befintliga produkter och kunder.',
      'Ingen plan för lagerintegration – manuell hantering blir en tidsslukare direkt efter lansering.',
      'Byrån äger både domän och Shopify-konto. Kräv alltid egen ägarroll.',
    ],
    faq: [
      { q: 'Shopify eller WooCommerce – vad blir billigast?', a: 'Shopify har oftast lägre startkostnad men tar transaktionsavgift och plattformsavgift löpande. WooCommerce kostar mer att bygga men saknar plattformsavgift – lönsamt över tid vid högre omsättning.' },
      { q: 'Vilka löpande kostnader tillkommer?', a: 'Räkna med plattformsavgift (Shopify från 400 kr/mån), transaktionsavgifter, betalningslösning, appar och drift. För en aktiv butik landar det vanligen på 2 000–8 000 kr/mån utöver byråtimmar.' },
      { q: 'Vad kostar det att migrera en befintlig butik?', a: 'En migrering med produktdata, kunder, ordrar och 301-redirects ligger normalt på 25 000–80 000 kr beroende på volym och plattformsbyte.' },
      { q: 'Behöver jag en byrå eller klarar jag Shopify själv?', a: 'En ren temaset-up klarar många själva. Så snart det handlar om anpassad design, integrationer eller SEO-migrering lönar det sig att ta in en byrå.' },
    ],
    categorySlug: 'ehandel',
    categoryLabel: 'E-handelsbyråer',
    wizardCategoryQuery: 'E-handel',
    relatedArticleSlugs: ['shopify-vs-woocommerce', 'ehandel-statistik-sverige'],
  },
  {
    slug: 'seo',
    matrixKey: 'seo',
    title: 'Vad kostar SEO 2026? Månadspriser från svenska byråer',
    metaDescription: desc('SEO'),
    h1: 'Vad kostar SEO 2026?',
    serviceLabel: 'SEO-uppdrag',
    quickAnswer: 'Ett standard SEO-uppdrag med innehållsproduktion, länkarbete och löpande teknisk SEO kostar normalt 15 000–30 000 kr/mån.',
    intro:
      'SEO köps nästan alltid som månadsuppdrag. Svenska byråer tar mellan 8 000 och 60 000 kr i månaden – och skillnaden ligger i hur mycket faktiskt arbete du får.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Teknisk grundoptimering, 1–2 innehåll/mån, månadsrapport' },
      { level: 'standard', label: 'Standard', includes: 'Innehållsproduktion 4–6 st/mån, länkarbete, löpande teknisk SEO' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Dedikerat team, digital PR, internationell SEO, konverteringsoptimering' },
    ],
    drivers: [
      'Konkurrens i branschen – hårdare vertikaler kräver mer innehåll och länkarbete för att flytta positioner.',
      'Nuläge och teknisk skuld – en gammal sajt kräver månader av teknisk sanering innan innehåll ger effekt.',
      'Innehållsvolym – 2 artiklar/mån vs 8 artiklar/mån ger stor kostnadsskillnad.',
      'Om länkförvärv ingår eller köps separat – digital PR är den dyraste enskilda posten.',
      'Bindningstid – vissa byråer sänker månadsarvodet mot 12 månaders bindning.',
    ],
    warnings: [
      'Garanterade placeringar. Ingen seriös SEO-byrå kan lova en position i Google.',
      'Rapporten visar bara trafik och rankings – inte affärsvärde, leads eller intäkter.',
      'Byrån använder länknätverk (PBN) eller köper länkar i bulk – hög risk för Google-straff.',
    ],
    faq: [
      { q: 'Hur snabbt ser man resultat av SEO?', a: 'Räkna normalt med 4–6 månader innan rankings rör sig märkbart och 9–12 månader innan trafiken ger tydlig affärseffekt. Har sajten teknisk skuld kan det ta längre.' },
      { q: 'Är bindningstid på 12 månader rimligt?', a: 'Ja, det är standard eftersom SEO tar tid att ge effekt. Men kräv en tydlig uppsägningsklausul och månatliga leveransrapporter så att du kan bryta om arbetet inte utförs.' },
      { q: 'Vad är en röd flagga hos en SEO-byrå?', a: 'Garanterade placeringar, hemliga metoder som inte kan förklaras, köpta länkar i bulk och rapporter som bara visar rankings på oviktiga sökord är alla varningssignaler.' },
      { q: 'SEO eller Google Ads – vad ska jag välja?', a: 'Google Ads ger trafik direkt men slutar när du slutar betala. SEO tar tid men bygger långsiktigt värde. De flesta seriösa strategier kombinerar båda.' },
    ],
    categorySlug: 'seo',
    categoryLabel: 'SEO-byråer',
    wizardCategoryQuery: 'SEO',
    relatedArticleSlugs: ['seo-guide-foretag', 'seo-pris-guide'],
  },
  {
    slug: 'google-ads',
    matrixKey: 'ads',
    title: 'Vad kostar Google Ads-byrå 2026? Arvoden & budget',
    metaDescription: desc('en Google Ads-byrå'),
    h1: 'Vad kostar en Google Ads-byrå 2026?',
    serviceLabel: 'Google Ads-uppdrag',
    quickAnswer: 'Ett standard Google Ads-uppdrag med löpande optimering och shoppingkampanjer kostar normalt 12 000–25 000 kr/mån i arvode – utöver annonsbudgeten.',
    intro:
      'En Google Ads-byrå kostar 6 000–50 000 kr i månaden i arvode – utöver din annonsbudget. Så vet du om arvodet är rimligt i förhållande till din spend.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Kampanjuppsättning, sökkampanjer, månadsrapport' },
      { level: 'standard', label: 'Standard', includes: 'Löpande optimering, shopping/display, A/B-test av annonser' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Full funnel, YouTube, avancerad spårning, landningssidor' },
    ],
    drivers: [
      'Annonsbudgetens storlek – arvode ligger ofta på 10–20 % av spend, men med golv för mindre konton.',
      'Antal kampanjtyper – sök, shopping, display, YouTube och Performance Max kräver olika kompetenser.',
      'Om landningssidor och konverteringsoptimering ingår.',
      'Spårningsuppsättning – GA4, Enhanced Conversions och server-side tagging är fördyrande men lönsamt.',
      'Rapporteringsnivå – veckorapport, dashboard eller månadsmöte påverkar arvodet.',
    ],
    warnings: [
      'Byrån vill äga ditt annonskonto själv. Kräv alltid att du står som ägare med byrån som manager.',
      'Rapporten visar bara klick och impressions – inte kostnad per lead eller ROAS.',
      'Arvodet är bara procent av spend utan tak – incitamentet blir att öka budgeten, inte lönsamheten.',
    ],
    faq: [
      { q: 'Hur stor annonsbudget behöver jag minst?', a: 'Under 10 000 kr/mån i spend är det sällan meningsfullt att anlita en byrå – arvodet äter för mycket av budgeten. Många byråer sätter minimum på 15 000–20 000 kr/mån i spend.' },
      { q: 'Fast arvode eller procent av spend?', a: 'Fast arvode är mer förutsägbart och ger byrån incitament att jobba effektivt. Procent av spend är enklare för växande konton men bör alltid ha ett tak.' },
      { q: 'Äger jag mitt annonskonto om vi bryter?', a: 'Ja – kräv alltid att kontot står i ditt företags namn med byrån som manager. Utan ägarskap tappar du all historik och alla konverteringsdata om ni går skilda vägar.' },
      { q: 'Hur snabbt ger Google Ads resultat?', a: 'Trafik direkt vid start, men räkna med 4–8 veckor innan konto och kampanjer är optimerade och kostnad per konvertering stabiliseras.' },
    ],
    categorySlug: 'google-ads',
    categoryLabel: 'Google Ads-byråer',
    wizardCategoryQuery: 'Google Ads',
    relatedArticleSlugs: ['vad-kostar-google-ads', 'google-ads-vs-seo'],
  },
  {
    slug: 'apputveckling',
    matrixKey: 'app',
    title: 'Vad kostar det att bygga en app 2026? Verkliga priser',
    metaDescription: desc('apputveckling'),
    h1: 'Vad kostar det att utveckla en app 2026?',
    serviceLabel: 'app',
    quickAnswer: 'En standard-app för iOS och Android med backend, inloggning och notiser kostar normalt 200 000–450 000 kr att bygga.',
    intro:
      'Att bygga en app kostar från 100 000 kr för en enkel MVP till över 900 000 kr för en fullskalig produkt. Här är vad som driver priset – och hur du håller nere det.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'MVP med kärnfunktioner, en plattform eller React Native, standard-UI' },
      { level: 'standard', label: 'Standard', includes: 'iOS + Android, anpassad design, backend, inloggning, notiser' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Komplexa integrationer, realtid, betalflöden, skalbar arkitektur' },
    ],
    drivers: [
      'Native vs cross-platform – React Native/Flutter kostar 30–50 % mindre än native iOS + Android.',
      'Backend-komplexitet – enkel API vs realtid, offline-sync och skalbar molnarkitektur.',
      'Tredjepartsintegrationer – betalning, karta, autentisering, push, analytics.',
      'Design-nivå – templates vs egen designer med prototyper och användartester.',
      'Vidareutveckling efter lansering – appar är levande produkter som kräver löpande arbete.',
    ],
    warnings: [
      'Fastpris utan tydlig scope. Appar med öppen spec blir alltid dyrare än offerten.',
      'Inget App Store- och Play Store-arbete ingår – publiceringen är inte gratis i tid.',
      'Ingen plan för underhåll efter lansering. Appar kräver löpande OS-uppdateringar.',
    ],
    faq: [
      { q: 'Native eller React Native/Flutter – vad är billigast?', a: 'Cross-platform (React Native, Flutter) är billigast eftersom en kodbas täcker båda plattformarna. Native lönar sig när prestanda eller djup plattformsintegration är kritisk.' },
      { q: 'Vad kostar det att underhålla en app per år?', a: 'Räkna med 15–25 % av utvecklingskostnaden per år för OS-uppdateringar, buggfixar, mindre features och infrastruktur. En app för 300 000 kr kostar alltså 45 000–75 000 kr/år att underhålla.' },
      { q: 'Kan jag börja med en MVP?', a: 'Ja, det är nästan alltid rätt strategi. En MVP med kärnfunktionen kan byggas för 100 000–200 000 kr och validerar om användarna faktiskt vill ha appen innan du investerar mer.' },
      { q: 'Hur lång tid tar det att bygga en app?', a: 'En MVP tar 8–12 veckor, en standard-app 12–20 veckor och avancerade produkter 20–32 veckor från kickoff till lansering i store.' },
    ],
    categorySlug: 'apputveckling',
    categoryLabel: 'Apputvecklingsbyråer',
    wizardCategoryQuery: 'Apputveckling',
    relatedArticleSlugs: ['hur-lang-tid-tar-apputveckling', 'webbdesign-trender-2026'],
  },
  {
    slug: 'design',
    matrixKey: 'design',
    title: 'Vad kostar grafisk design & varumärke 2026?',
    metaDescription: desc('grafisk design och varumärkesarbete'),
    h1: 'Vad kostar design och varumärkesarbete 2026?',
    serviceLabel: 'design- och varumärkesuppdrag',
    quickAnswer: 'En standard visuell identitet med logotyp, färgsystem, typografi och applikationer kostar normalt 40 000–80 000 kr.',
    intro:
      'Grafisk design och varumärkesarbete kostar från 20 000 kr för en logotyp med grundprofil till 160 000 kr+ för en komplett varumärkesplattform.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Logotyp, färger, typografi, enkel grafisk manual' },
      { level: 'standard', label: 'Standard', includes: 'Full visuell identitet, mallar, bildmanér, applikationer' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Varumärkesstrategi, tone of voice, komplett brandbook, lanseringsmaterial' },
    ],
    drivers: [
      'Om strategiarbete (positionering, tone of voice) ingår eller om du levererar det själv.',
      'Antal applikationer – visitkort, presentationer, sociala medier, skyltar och förpackning.',
      'Antal koncept och revisionsrundor – 2 koncept med 2 rundor vs 4 koncept med 4 rundor.',
      'Rättigheter och filformat – full ägarrätt och alla källfiler är standard hos seriösa byråer.',
      'Kompetensnivå – junior designer, art director eller senior varumärkesstrateg.',
    ],
    warnings: [
      'Extremt lågt fastpris – ofta stockmaterial eller AI-genererat utan strategi bakom.',
      'Källfiler och rättigheter ingår inte. Du blir bunden till leverantören för alla ändringar.',
      'Endast en revisionsrunda ingår. Varje ändring blir tilläggsfakturering.',
    ],
    faq: [
      { q: 'Varför kostar en logotyp 30 000 kr när Fiverr tar 500 kr?', a: 'Skillnaden är strategin och processen bakom – analys, positionering, flera koncept, iterationer och en genomarbetad manual. En billig logotyp är en bild; en dyr är ett strategiskt verktyg.' },
      { q: 'Vad är skillnaden mellan grafisk profil och varumärkesplattform?', a: 'Grafisk profil är det visuella (logo, färger, typografi). Varumärkesplattform är hela strategin under: positionering, målgrupp, kärnvärden och tone of voice. Profilen är följden av plattformen.' },
      { q: 'Äger jag alla rättigheter till designen?', a: 'Kräv alltid full nyttjanderätt och alla källfiler (AI, PSD, Figma, fontlicenser) skriftligt i avtalet. Utan det är du bunden till byrån för framtida ändringar.' },
      { q: 'Hur många koncept och revisioner är standard?', a: 'Vanligt är 2–3 koncept följt av 2–3 revisionsrundor på det valda konceptet. Fler ronder är möjligt men läggs oftast till som tilläggsarvode.' },
    ],
    categorySlug: 'grafisk-design',
    categoryLabel: 'Design- och varumärkesbyråer',
    wizardCategoryQuery: 'Design & varumärke',
    relatedArticleSlugs: ['webbdesign-trender-2026', 'hur-valjer-man-webbyra'],
  },
]

export const findPriceGuide = (slug: string) => PRICE_GUIDES.find((g) => g.slug === slug)
