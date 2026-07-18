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
  ai: {
    enkel: { range: '75 000 – 150 000 kr', time: '3–6 veckor', matches: 12 },
    standard: { range: '150 000 – 400 000 kr', time: '6–12 veckor', matches: 16 },
    avancerad: { range: '400 000 – 1 200 000 kr', time: '12–24 veckor', matches: 8 },
  },
  'it-konsult': {
    enkel: { range: '950 – 1 250 kr/tim', time: 'löpande', matches: 34 },
    standard: { range: '1 250 – 1 550 kr/tim', time: 'löpande', matches: 26 },
    avancerad: { range: '1 550 – 2 100 kr/tim', time: 'löpande', matches: 14 },
  },
  'sociala-medier': {
    enkel: { range: '8 000 – 15 000 kr/mån', time: 'löpande', matches: 22 },
    standard: { range: '15 000 – 35 000 kr/mån', time: 'löpande', matches: 18 },
    avancerad: { range: '35 000 – 75 000 kr/mån', time: 'löpande', matches: 9 },
  },
  mjukvara: {
    enkel: { range: '150 000 – 300 000 kr', time: '6–10 veckor', matches: 14 },
    standard: { range: '300 000 – 700 000 kr', time: '10–20 veckor', matches: 17 },
    avancerad: { range: '700 000 – 2 000 000 kr', time: '20–40 veckor', matches: 8 },
  },
  'video-foto': {
    enkel: { range: '8 000 – 20 000 kr', time: '1–2 veckor', matches: 24 },
    standard: { range: '20 000 – 60 000 kr', time: '2–4 veckor', matches: 19 },
    avancerad: { range: '60 000 – 200 000 kr', time: '4–10 veckor', matches: 11 },
  },
  varumarke: {
    enkel: { range: '25 000 – 50 000 kr', time: '3–5 veckor', matches: 18 },
    standard: { range: '50 000 – 120 000 kr', time: '6–10 veckor', matches: 21 },
    avancerad: { range: '120 000 – 350 000 kr', time: '10–20 veckor', matches: 10 },
  },
  ux: {
    enkel: { range: '30 000 – 60 000 kr', time: '3–5 veckor', matches: 16 },
    standard: { range: '60 000 – 140 000 kr', time: '6–10 veckor', matches: 19 },
    avancerad: { range: '140 000 – 400 000 kr', time: '10–20 veckor', matches: 9 },
  },
  'it-support': {
    enkel: { range: '400 – 700 kr/användare/mån', time: 'löpande', matches: 23 },
    standard: { range: '700 – 1 200 kr/användare/mån', time: 'löpande', matches: 19 },
    avancerad: { range: '1 200 – 2 000 kr/användare/mån', time: 'löpande', matches: 10 },
  },
  affarsutveckling: {
    enkel: { range: '25 000 – 60 000 kr', time: '2–4 veckor', matches: 15 },
    standard: { range: '60 000 – 150 000 kr', time: '4–10 veckor', matches: 12 },
    avancerad: { range: '150 000 – 500 000 kr', time: '3–12 månader', matches: 7 },
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
  { id: 'ai', label: 'AI-utveckling', query: 'AI-utveckling', guideSlug: 'ai-utveckling' },
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
  {
    slug: 'ai-utveckling',
    matrixKey: 'ai',
    title: 'Vad kostar AI-utveckling 2026? Priser från svenska byråer',
    metaDescription: desc('AI-utveckling'),
    h1: 'Vad kostar AI-utveckling 2026?',
    serviceLabel: 'AI-lösning',
    quickAnswer: 'En AI-lösning på standardnivå – till exempel en RAG-assistent integrerad i era system – kostar normalt 150 000–400 000 kr hos en svensk byrå.',
    intro:
      'Priset på AI-utveckling varierar från cirka 75 000 kr för en fokuserad proof of concept till över en miljon för skräddarsydda plattformar. Här är vad svenska byråer faktiskt tar – och vad som driver priset.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Proof of concept, AI-chattbot på befintligt material eller enkel automation via AI-API:er' },
      { level: 'standard', label: 'Standard', includes: 'RAG-assistent med egen data, integration mot era system, guardrails och utvärdering' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Skräddarsydd AI-plattform, finjusterade modeller, multipla integrationer, MLOps' },
    ],
    drivers: [
      'Egen data vs färdiga modeller – en lösning på era dokument kräver RAG-arkitektur och dataarbete, ofta 30–50 % av budgeten.',
      'Integrationer – varje system (CRM, affärssystem, SharePoint) som AI:n ska läsa eller skriva i lägger normalt 20 000–60 000 kr.',
      'Kvalitetssäkring – utvärderingsramverk, testdata och guardrails så att modellen svarar rätt och säkert.',
      'Driftskostnader – API-anrop, vektordatabas och övervakning tillkommer löpande, ofta 2 000–20 000 kr/mån.',
      'Regelefterlevnad – GDPR, AI-förordningen och branschkrav påverkar arkitektur och dokumentation.',
    ],
    warnings: [
      'Offerten lovar "AI" utan att specificera modell, data eller utvärdering. Be om en teknisk arkitekturskiss och mätpunkter.',
      'Ingen plan för drift och kostnader per anrop – API-räkningen kan annars skena när användningen växer.',
      'En proof of concept prissatt som produktionslösning – en demo på två veckor är inte samma sak som ett driftsatt system.',
    ],
    faq: [
      { q: 'Behöver vi egen data för att komma igång?', a: 'Nej, inte för en enkel chattbot eller automation. Men värdet ökar markant när lösningen bygger på era dokument, ärenden eller produktdata – räkna då med extra tid för datakvalitet.' },
      { q: 'Vad kostar AI-lösningen i drift efter lansering?', a: 'Räkna med 2 000–20 000 kr per månad beroende på volym: API-anrop, vektordatabas, övervakning och mindre justeringar. Be byrån räkna på er förväntade användning i offerten.' },
      { q: 'Ska vi bygga själva eller anlita byrå?', a: 'Utan egen ML-kompetens är en byrå snabbaste vägen till ett mätbart resultat. Ett vanligt upplägg är att byrån bygger och sedan överlämnar med kunskapsöverföring till ert team.' },
      { q: 'Hur vet vi att AI:n faktiskt levererar värde?', a: 'Definiera KPI före start: svarstid, andel lösta ärenden, timmar sparade. En seriös byrå sätter upp utvärdering mot dessa mål redan i proof of concept-fasen.' },
      { q: 'Vem äger modellen och datan?', a: 'Ni ska äga er data och all träningsdata. Basmodellerna ägs av respektive leverantör (OpenAI, Anthropic med flera) – kräv skriftligt att ni kan exportera er data när som helst.' },
    ],
    categorySlug: 'analys-data',
    categoryLabel: 'Analys- och databyråer',
    wizardCategoryQuery: 'AI-utveckling',
    relatedArticleSlugs: ['ai-verktyg-marknadsforing-2026', 'chatgpt-synlighet-for-foretag-2026'],
  },
  {
    slug: 'it-konsult',
    matrixKey: 'it-konsult',
    title: 'Vad kostar en IT-konsult 2026? Timpriser i Sverige',
    metaDescription: desc('en IT-konsult'),
    h1: 'Vad kostar en IT-konsult 2026?',
    serviceLabel: 'IT-konsult',
    quickAnswer: 'En erfaren IT-konsult kostar normalt 1 250–1 550 kr i timmen hos en svensk byrå. Enklare roller ligger under, specialister och arkitekter över.',
    intro:
      'Timpriset för IT-konsulter spänner från cirka 950 kr för juniora roller till över 2 000 kr för specialister. Här är priserna per senioritetsnivå – och vad som avgör var ditt uppdrag landar.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Junior konsult eller generalist – support, enklare utveckling, drift och underhåll' },
      { level: 'standard', label: 'Standard', includes: 'Erfaren utvecklare eller konsult – självständigt arbete i era system och team' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Specialist, arkitekt eller tech lead – komplexa integrationer, säkerhet, skalning' },
    ],
    drivers: [
      'Senioritet och specialisering – en molnarkitekt eller säkerhetsexpert kostar 50–80 % mer än en generalist.',
      'Uppdragets längd – längre uppdrag ger ofta 5–15 % lägre timpris än korta insatser.',
      'Plats – Stockholm och Göteborg ligger normalt 10–20 % över mindre orter; distansarbete kan jämna ut skillnaden.',
      'Branschkrav – bank, finans och offentlig sektor kräver ofta säkerhetsprövade konsulter, vilket höjer priset.',
      'Omfattning – heltid kontra deltid, och om konsulten ska leda arbetet eller bara leverera.',
    ],
    warnings: [
      'Lågt timpris men "senior konsult" visar sig vara junior på plats – be alltid om CV och referenser för den faktiska personen.',
      'Offerten saknar takpris eller estimat – utan ram växer kostnaden löpande utan stopp.',
      'Konsulten byts ut mitt i uppdraget mot en billigare profil utan att priset justeras.',
    ],
    faq: [
      { q: 'Timpris eller fast pris – vad är bäst?', a: 'Fast pris passar väl avgränsade leveranser med tydligt scope. Timpris passar löpande utveckling och förvaltning. Många väljer fast pris för första fasen och timpris för fortsatt arbete.' },
      { q: 'Vad är ett rimligt timpris för en utvecklare 2026?', a: 'En erfaren utvecklare kostar normalt 1 250–1 550 kr i timmen hos svenska byråer. Under 1 000 kr bör du dubbelkolla senioriteten, över 1 800 kr ska det finnas tydlig specialisering.' },
      { q: 'Hur jämför jag konsulter rättvist?', a: 'Jämför aldrig bara timpris. En senior på 1 500 kr som löser uppgiften på halva tiden är billigare än en junior på 950 kr. Be om referenscase med tid och resultat.' },
      { q: 'Kan man förhandla timpriset?', a: 'Ja, särskilt vid längre uppdrag, deltidsupplägg eller retainer – 5–15 % är vanligt. Förhandla hellre på volym än att pressa priset dit byrån tappar incitament.' },
    ],
    categorySlug: 'webbutveckling',
    categoryLabel: 'Webbutvecklingsbyråer',
    wizardCategoryQuery: 'IT-konsult',
    relatedArticleSlugs: ['hur-valjer-man-webbyra', 'sveriges-digitala-byraer-konjunktur-2026'],
  },
  {
    slug: 'sociala-medier',
    matrixKey: 'sociala-medier',
    title: 'Vad kostar en byrå för sociala medier 2026? Priser i Sverige',
    metaDescription: desc('hjälp med sociala medier'),
    h1: 'Vad kostar en byrå för sociala medier 2026?',
    serviceLabel: 'satsning i sociala medier',
    quickAnswer: 'Löpande skötsel av sociala medier kostar normalt 15 000–35 000 kr i månaden för en standardnivå med strategi, innehåll och uppföljning.',
    intro:
      'Priset för byråhjälp med sociala medier varierar från cirka 8 000 kr i månaden för grundläggande publicering till över 75 000 kr för fullskalig always-on. Här är vad som ingår på respektive nivå.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Fast publiceringsschema, 3–4 inlägg/månad i en kanal, enkel rapport' },
      { level: 'standard', label: 'Standard', includes: 'Strategi, innehållsproduktion, 2–3 kanaler, community management och månadsrapport' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Always-on, kreativa koncept, video i volym, annonsoptimering och influerarsamarbeten' },
    ],
    drivers: [
      'Antal kanaler och publiceringstakt – varje kanal kräver anpassat material, inte bara kopierat innehåll.',
      'Innehållsproduktion – foto och video på plats kostar mer än grafiska mallar och stockmaterial.',
      'Community management – att svara på kommentarer och meddelanden, särskilt utanför kontorstid.',
      'Betald annonsering – mediebudgeten tillkommer alltid utöver byråarvodet.',
      'Rapportering och strategimöten – frekvens och detaljnivå på uppföljningen.',
    ],
    warnings: [
      'Arvodet ser lågt ut men annonsbudget och innehållsproduktion tillkommer – be om total månadskostnad.',
      'Byrån rapporterar bara räckvidd och gillningar – be om koppling till affärsmål som leads eller försäljning.',
      'Otydligt vem som äger kontona och materialet om samarbetet avslutas.',
    ],
    faq: [
      { q: 'Vad är skillnaden på organiskt och annonserat?', a: 'Organiskt är det ni publicerar på egna kanaler utan mediekostnad. Annonserat (paid social) är betald distribution där mediebudgeten går direkt till plattformen – den ligger utöver byråarvodet.' },
      { q: 'Hur snabbt ser man resultat?', a: 'Organiskt tar normalt 3–6 månader att bygga upp. Betald annonsering kan ge resultat inom veckor. Räkna med en uppstartsfas på minst en månad oavsett.' },
      { q: 'Vilka kanaler ska vi satsa på?', a: 'Där era kunder finns – inte alla. B2B domineras av LinkedIn, yngre målgrupper av TikTok och Instagram, lokala tjänster ofta av Facebook. En bra byrå rekommenderar färre kanaler gjorda ordentligt.' },
      { q: 'Kan vi sköta publiceringen internt och bara ta hjälp med strategi?', a: 'Ja, många byråer erbjuder strategi- och coachingsupplägg från cirka 8 000–15 000 kr per månad, där ert team producerar och byrån styr riktning och kvalitet.' },
    ],
    categorySlug: 'digital-marknadsforing',
    categoryLabel: 'Digitala marknadsföringsbyråer',
    wizardCategoryQuery: 'Sociala medier',
    relatedArticleSlugs: ['vad-kostar-digital-marknadsforing', 'digital-marknadsforing-for-foretag'],
  },
  {
    slug: 'mjukvaruutveckling',
    matrixKey: 'mjukvara',
    title: 'Vad kostar mjukvaruutveckling 2026? Priser i Sverige',
    metaDescription: desc('mjukvaruutveckling'),
    h1: 'Vad kostar mjukvaruutveckling 2026?',
    serviceLabel: 'mjukvaruprojekt',
    quickAnswer: 'Ett mjukvaruprojekt på standardnivå – ett skräddarsytt system med integrationer – kostar normalt 300 000–700 000 kr hos en svensk byrå.',
    intro:
      'Skräddarsydd mjukvara spänner från cirka 150 000 kr för en fokuserad MVP till flera miljoner för affärskritiska plattformar. Här är vad svenska byråer faktiskt tar – och hur du håller budgeten.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'MVP eller internt verktyg – en kärnfunktion, begränsad användargrupp, 6–10 veckor' },
      { level: 'standard', label: 'Standard', includes: 'Skräddarsytt system med integrationer, roller och behörigheter samt driftsättning' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Affärskritisk plattform – hög tillgänglighet, många integrationer, compliance-krav' },
    ],
    drivers: [
      'Antal integrationer – varje externt system (affärssystem, betalning, e-signering) är normalt 20 000–80 000 kr.',
      'Krav på säkerhet och compliance – loggning, kryptering och behörighetsmodeller lägger på 15–30 %.',
      'Legacy-miljö – att bygga mot äldre system utan API:er tar ofta dubbelt så lång tid.',
      'Test och kvalitetssäkring – automatiserade tester kostar i uppstart men sänker ägandekostnaden.',
      'Teamets storlek och senioritet – två seniorer levererar ofta snabbare än fyra juniorer till samma budget.',
    ],
    warnings: [
      'Offerten täcker bygget men inte drift och underhåll – räkna normalt med 15–25 % av byggkostnaden per år.',
      'Fast pris utan kravspecifikation – otydliga krav i fastprisprojekt leder till ändringsdebatt i stället för leverans.',
      'Ingen dokumentation eller kunskapsöverlämning – ni blir låsta till byrån för varje framtida ändring.',
    ],
    faq: [
      { q: 'MVP eller färdigt system direkt?', a: 'Börja nästan alltid med en MVP – den minsta versionen som skapar värde. Det kapar initialkostnaden med 50–70 % och låter er styra fortsättningen på verklig användning.' },
      { q: 'Hur mycket kostar underhåll per år?', a: 'Räkna med 15–25 % av byggkostnaden årligen för drift, säkerhetsuppdateringar och mindre förbättringar. Ett system för 400 000 kr kostar alltså normalt 60 000–100 000 kr per år att äga.' },
      { q: 'Vem äger koden?', a: 'Ni ska äga källkoden och den ska ligga i ert eget repo. Kräv det skriftligt – inklusive dokumentation och driftsinstruktioner – innan projektet startar.' },
      { q: 'Agilt eller fast pris?', a: 'Fast pris fungerar för små, mycket väldefinierade projekt. För allt större är ett agilt upplägg med sprintar och löpande prioritering säkrare – ni betalar för framsteg, inte gissningar.' },
    ],
    categorySlug: 'apputveckling',
    categoryLabel: 'Apputvecklingsbyråer',
    wizardCategoryQuery: 'Mjukvaruutveckling',
    relatedArticleSlugs: ['hur-lang-tid-tar-apputveckling', 'hur-valjer-man-webbyra'],
  },
  {
    slug: 'video-foto',
    matrixKey: 'video-foto',
    title: 'Vad kostar video och foto 2026? Priser i Sverige',
    metaDescription: desc('video och foto'),
    h1: 'Vad kostar video och foto 2026?',
    serviceLabel: 'videoproduktion',
    quickAnswer: 'En videoproduktion på standardnivå – heldagsinspelning, klipp och färgkorrigering – kostar normalt 20 000–60 000 kr hos en svensk byrå.',
    intro:
      'Priset på video och foto varierar från några tusenlappar för en halvdagsfotografering till över 200 000 kr för kampanjproduktioner. Här är vad svenska produktionsbolag faktiskt tar – och vad som ingår.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Halvdagsfotografering eller enkel produktvideo med befintligt manér' },
      { level: 'standard', label: 'Standard', includes: 'Heldag produktion, manus, regi, klipp och color grade' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Flerdags produktion, drönare, motion graphics och kampanjmaterial i flera format' },
    ],
    drivers: [
      'Antal inspelningsdagar – den största enskilda kostnaden, normalt 8 000–25 000 kr per dag med team.',
      'Teamets storlek – en filmer vs regissör, fotograf, ljud och ljus gör stor skillnad i både pris och resultat.',
      'Manus och storyboard – ju tydligare förarbete, desto effektivare inspelningsdagar.',
      'Efterbearbetning – klipp, ljudläggning, färgkorrigering och grafik kostar normalt 3 000–10 000 kr per färdig minut.',
      'Musik, licenser och format – rättigheter för musik och anpassningar för varje kanal tillkommer.',
    ],
    warnings: [
      'Pris per "färdig video" utan specificerade inspelningsdagar eller revisioner – be om en detaljerad uppdelning.',
      'Råmaterial och fulla rättigheter ingår inte – utan dem kan ni inte återanvända materialet fritt.',
      'Drönare erbjuds utan tillstånd och försäkring – ett olagligt erbjudande kan bli ert ansvar.',
    ],
    faq: [
      { q: 'Vad kostar en företagsfilm?', a: 'En professionell företagsfilm på 1–3 minuter kostar normalt 20 000–60 000 kr med heldagsinspelning, klipp och musik. Enklare varianter med halvdag och befintligt manér landar under 20 000 kr.' },
      { q: 'Vad tar en fotograf i timmen?', a: 'Svenska företagsfotografer tar normalt 800–1 500 kr i timmen plus efterbearbetning. Många erbjuder halv- och heldagspriser som blir billigare än timdebitering.' },
      { q: 'Hur många revisioner brukar ingå?', a: 'Standard är 2–3 revisionsrundor på klippet. Kontrollera att det står i offerten – extra rundor kostar normalt 2 000–5 000 kr styck.' },
      { q: 'Vem äger materialet efter leverans?', a: 'Kräv full nyttjanderätt i alla kanaler utan tidsbegränsning, och att råmaterialet levereras eller arkiveras hos er. Det bör stå skriftligt i avtalet.' },
    ],
    categorySlug: 'media',
    categoryLabel: 'Mediabyråer',
    wizardCategoryQuery: 'Video & foto',
    relatedArticleSlugs: ['vad-kostar-digital-marknadsforing', 'digital-marknadsforing-for-foretag'],
  },
  {
    slug: 'varumarke-pr',
    matrixKey: 'varumarke',
    title: 'Vad kostar varumärkesutveckling 2026? Priser i Sverige',
    metaDescription: desc('varumärkesutveckling'),
    h1: 'Vad kostar varumärkesutveckling 2026?',
    serviceLabel: 'varumärkesutveckling',
    quickAnswer: 'En varumärkesutveckling på standardnivå – plattform, grafisk profil och mallar – kostar normalt 50 000–120 000 kr hos en svensk byrå.',
    intro:
      'Priset för att bygga eller förnya ett varumärke varierar från cirka 25 000 kr för en logotype med minimanual till över 300 000 kr för komplett identitet med strategi och lansering. Här är vad som skiljer nivåerna åt.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Logotype, färg och typografi med kort manual' },
      { level: 'standard', label: 'Standard', includes: 'Varumärkesplattform, grafisk profil och mallar för vardagsbruk' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Komplett identitet med varumärkesstrategi, tonalitet, lansering och PR' },
    ],
    drivers: [
      'Strategiunderlag – workshops, kundinsikter och konkurrentanalys lägger grunden och kostar efter omfattning.',
      'Antal applikationer – varje mall (presentation, offert, sociala medier, skylt) är extra designarbete.',
      'Namnarbete – namnprocess med juridisk koll av varumärkesregistrering är ett eget delprojekt.',
      'Foto och illustration – egen bildstil kostar mer än stockmen bygger ett starkare varumärke.',
      'PR och lansering – mediegenomslag kräver story, pressmaterial och uppföljning.',
    ],
    warnings: [
      'En logotyp utan plattform – utan positionering och tonalitet blir profilen bara dekoration.',
      'Källfiler och rättigheter ingår inte – kräv originalfiler (AI, EPS, fonter med licens) i leveransen.',
      'PR-insats utan mätbart mål – be om definierade nyckeltal före start, inte bara "synlighet".',
    ],
    faq: [
      { q: 'Vad är skillnaden mellan logotype och varumärke?', a: 'Logotypen är en symbol. Varumärket är hela upplevelsen: positionering, budskap, tonalitet och visuellt uttryck. En profil utan strategi åldras snabbt och används inkonsekvent.' },
      { q: 'Vad kostar ett namnbyte?', a: 'Namnprocess med idé, juridisk förkoll och domänkontroll kostar normalt 30 000–80 000 kr, utöver själva identitetsarbetet. Varumärkesregistrering hos PRV tillkommer med några tusenlappar per klass.' },
      { q: 'Äger vi logotypen efter leverans?', a: 'Det ska ni göra. Kräv full nyttjanderätt utan begränsningar, alla källfiler och en fontlicens som täcker er användning – skriftligt, innan projektet startar.' },
      { q: 'Hur lång tid tar en rebrand?', a: 'En uppdaterad profil tar 3–5 veckor, en komplett varumärkesutveckling med strategi 6–10 veckor och en rebrand med lansering 3–6 månader inklusive intern förankring.' },
    ],
    categorySlug: 'grafisk-design',
    categoryLabel: 'Design- och varumärkesbyråer',
    wizardCategoryQuery: 'Varumärke & PR',
    relatedArticleSlugs: ['webbdesign-trender-2026', 'sveriges-digitala-byraer-konjunktur-2026'],
  },
  {
    slug: 'ux-webbdesign',
    matrixKey: 'ux',
    title: 'Vad kostar UX-design 2026? Priser i Sverige',
    metaDescription: desc('UX-design'),
    h1: 'Vad kostar UX-design 2026?',
    serviceLabel: 'UX-designsatsning',
    quickAnswer: 'En UX-designsatsning på standardnivå – research, wireframes, klickbar prototyp och UI-design – kostar normalt 60 000–140 000 kr hos en svensk byrå.',
    intro:
      'Priset på UX-design varierar från cirka 30 000 kr för en expertgranskning till över 400 000 kr för en full process med användartester och designsystem. Här är vad som skiljer nivåerna åt.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Expertgranskning (UX-audit) med prioriterad åtgärdslista' },
      { level: 'standard', label: 'Standard', includes: 'Användarresearch, wireframes, klickbar prototyp och UI-design' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Full process med användartester, designsystem och överlämning till utveckling' },
    ],
    drivers: [
      'Antal användarintervjuer och tester – verklig research kostar men eliminerar gissningar.',
      'Antal unika vyer och flöden – en tjänst med fem flöden är billigare än en med tjugo.',
      'Designsystem vs engångsdesign – ett system kostar mer upfront men halverar framtida designarbete.',
      'Tillgänglighetskrav – WCAG-anpassning är lagkrav för många och bör ingå från start.',
      'Dokumentation och överlämning – kvaliteten på underlaget till utvecklarna avgör slutresultatet.',
    ],
    warnings: [
      '"Snygga bilder" utan research eller tester – design utan användarunderlag är gissningskonst.',
      'Ingen klickbar prototyp före utveckling – utan prototyp upptäcks flödesfel först i dyr kod.',
      'Tillgänglighet nämns inte alls – WCAG ska vara en självklar del av leveransen 2026.',
    ],
    faq: [
      { q: 'Vad är en UX-audit?', a: 'En expertgranskning av er befintliga tjänst mot vedertagna principer och data. Resultatet är en prioriterad lista över problem och åtgärder – ofta den mest kostnadseffektiva första insatsen.' },
      { q: 'Behöver vi verkligen användartester?', a: 'Ja – tester med fem användare avslöjar normalt de flesta användbarhetsproblem. Att hitta dem i prototyp kostar en bråkdel av att åtgärda dem efter lansering.' },
      { q: 'Vad är skillnaden på UX och UI?', a: 'UX är struktur och flöde – hur tjänsten fungerar. UI är det visuella lagret ovanpå. Bästa resultatet får man när båda drivs av samma designer eller team.' },
      { q: 'När lönar sig ett designsystem?', a: 'När ni har fler än en produkt, ett team större än tre utvecklare eller frekventa designändringar. Då betalar systemet tillbaka sig inom ett år i snabbare leveranser.' },
    ],
    categorySlug: 'ux-ui-design',
    categoryLabel: 'UX- och UI-byråer',
    wizardCategoryQuery: 'UX/Webbdesign',
    relatedArticleSlugs: ['webbdesign-trender-2026', 'vad-kostar-en-hemsida-2026'],
  },
  {
    slug: 'it-support',
    matrixKey: 'it-support',
    title: 'Vad kostar IT-support 2026? Priser i Sverige',
    metaDescription: desc('IT-support'),
    h1: 'Vad kostar IT-support 2026?',
    serviceLabel: 'IT-supportavtal',
    quickAnswer: 'Ett IT-supportavtal på standardnivå – proaktiv drift, backup och SLA – kostar normalt 700–1 200 kr per användare och månad.',
    intro:
      'Priset på IT-support varierar från cirka 400 kr per användare och månad för grundläggande helpdesk till över 2 000 kr för en helt outsourcad IT-avdelning. Här är vad som ingår på respektive nivå.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Helpdesk kontorstid, fjärrsupport och grundläggande uppdateringar' },
      { level: 'standard', label: 'Standard', includes: 'Proaktiv drift, säkerhetskopiering, virusskydd (EDR) och SLA på svarstider' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Outsourcad IT-avdelning: strategi, säkerhetsarbete, infrastruktur och beredskap' },
    ],
    drivers: [
      'Antal användare och enheter – priserna skalar per enhet; servrar och nätverk tillkommer ofta separat.',
      'SLA och svarstider – garanti om svar inom en timme kostar mer än bästa möjliga.',
      'Säkerhetsnivå – EDR, backup med återläsningstest och MFA ingår på olika nivåer.',
      'On-site vs fjärr – regelbundna platsbesök höjer priset men löser vissa problem snabbare.',
      'Infrastruktur – moln, servrar och nätverksutrustning prissätts per enhet eller miljö.',
    ],
    warnings: [
      '"Allt ingår" utan specificerade svarstider – utan SLA är löftet värdelöst den dagen systemet ligger nere.',
      'Backup utan återläsningstest – en backup som aldrig testats är en förhoppning, inte en plan.',
      'Oklar uppsägning och ägarskap – admin-konton, lösenord och dokumentation ska alltid tillhöra er.',
    ],
    faq: [
      { q: 'Vad kostar IT-support för ett litet företag?', a: 'För 5–20 anställda landar ett proaktivt avtal normalt på 700–1 200 kr per användare och månad, alltså 3 500–24 000 kr totalt. Timpris för ad hoc-support är 800–1 400 kr.' },
      { q: 'Abonnemang eller betala per timme?', a: 'Abonnemang lönar sig från cirka fem användare: proaktivt underhåll förebygger driftstopp som alltid kostar mer än avtalet. Per timme passar enstaka behov.' },
      { q: 'Vad betyder proaktiv drift?', a: 'Att leverantören övervakar, patchar och åtgärdar innan problem uppstår – i stället för att bara svara när något redan gått sönder. Det är den viktigaste skillnaden mellan nivåerna.' },
      { q: 'Hur byter vi IT-leverantör smidigt?', a: 'Säkra först alla admin-konton, lösenord och dokumentation. En seriös ny leverantör gör en överlämningsplan med den gamla. Uppsägningstiden är normalt 3 månader.' },
    ],
    categorySlug: 'webbutveckling',
    categoryLabel: 'Webbutvecklingsbyråer',
    wizardCategoryQuery: 'Underhåll/IT Support',
    relatedArticleSlugs: ['hur-valjer-man-webbyra', 'sveriges-digitala-byraer-konjunktur-2026'],
  },
  {
    slug: 'affarsutveckling',
    matrixKey: 'affarsutveckling',
    title: 'Vad kostar affärsutveckling 2026? Priser i Sverige',
    metaDescription: desc('affärsutveckling'),
    h1: 'Vad kostar affärsutveckling 2026?',
    serviceLabel: 'affärsutvecklingsuppdrag',
    quickAnswer: 'Ett affärsutvecklingsuppdrag på standardnivå – strategiarbete med workshops och genomförandeplan – kostar normalt 60 000–150 000 kr.',
    intro:
      'Priset på konsulthjälp med affärsutveckling varierar från cirka 25 000 kr för en fokuserad analys till över 500 000 kr för långsiktiga transformationsprogram. Här är vad som skiljer nivåerna åt.',
    levels: [
      { level: 'enkel', label: 'Enkel', includes: 'Affärsanalys eller marknadsöversikt med konkreta rekommendationer' },
      { level: 'standard', label: 'Standard', includes: 'Strategiarbete med workshops, målbild och genomförandeplan' },
      { level: 'avancerad', label: 'Avancerad', includes: 'Långsiktigt transformationsprogram med styrning och uppföljning' },
    ],
    drivers: [
      'Analysdjup – datainsamling, kundintervjuer och marknadsanalys kostar efter omfattning.',
      'Antal workshops och deltagare – varje session med er organisation kräver förberedelse och facilitering.',
      'Konsultens senioritet – erfarna strategkonsulter tar 1 500–2 500 kr i timmen, juniora under 1 200 kr.',
      'Genomförandestöd vs rapport – att få hjälp med att genomföra planen kostar mer men ger resultat.',
      'Branschspecialisering – konsulter med djup branschkännedom tar mer betalt men behöver kortare upplärning.',
    ],
    warnings: [
      'En tjock rapport utan genomförandeplan – be om en prioriterad åtgärdslista med ansvariga och datum.',
      'Senior partner säljer in, juniora konsulter levererar – be om teamet med namn och CV i offerten.',
      'Inga mätbara mål definierade – utan KPI:er kan varken ni eller konsulten utvärderas.',
    ],
    faq: [
      { q: 'Vad gör en affärsutvecklingskonsult egentligen?', a: 'Analyserar er situation, identifierar tillväxtmöjligheter eller ineffektivitet och hjälper er prioritera och genomföra förändringar. De bästa levererar beslutsunderlag och driv, inte bara presentationer.' },
      { q: 'När lönar sig extern hjälp?', a: 'Vid strategiska vägval (nya marknader, digitalisering, prissättning), när organisationen är låst, eller när ni behöver kompetens som inte finns internt för ett tidsbegränsat arbete.' },
      { q: 'Vad kostar en managementkonsult i timmen?', a: 'Normalt 1 200–2 500 kr i timmen beroende på senioritet och byrå. För definierade uppdrag är fastpris eller paketpris vanligt och tryggare för budgeten.' },
      { q: 'Hur mäter man effekten av affärsutveckling?', a: 'Definiera 2–3 KPI:er före start – omsättning, marginal, konvertering, ledtid. Utvärdera mot dem efter 3, 6 och 12 månader. En seriös konsult föreslår detta själv.' },
    ],
    categorySlug: 'digital-marknadsforing',
    categoryLabel: 'Digitala marknadsföringsbyråer',
    wizardCategoryQuery: 'Affärsutveckling',
    relatedArticleSlugs: ['sveriges-digitala-byraer-konjunktur-2026', 'hur-valjer-man-webbyra'],
  },
]

export const findPriceGuide = (slug: string) => PRICE_GUIDES.find((g) => g.slug === slug)
