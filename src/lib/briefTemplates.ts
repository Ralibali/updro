export interface BriefQuestion {
  id: string
  label: string
  placeholder: string
  required?: boolean
}

export interface BriefTemplate {
  slug: string
  categorySlug?: string
  categoryName: string
  title: string
  shortTitle: string
  description: string
  metaTitle: string
  metaDescription: string
  intro: string
  questions: BriefQuestion[]
  checklist: string[]
  links: { label: string; href: string }[]
}

const sharedQuestions: BriefQuestion[] = [
  { id: 'mal', label: 'Vad vill ni uppnå?', placeholder: 'Beskriv affärsmålet, problemet eller resultatet ni vill se.', required: true },
  { id: 'malgrupp', label: 'Vem är lösningen till för?', placeholder: 'Beskriv målgruppen, kunderna eller användarna.' },
  { id: 'omfattning', label: 'Vad ska ingå?', placeholder: 'Lista viktigaste funktionerna, leveranserna eller delarna.', required: true },
  { id: 'befintligt', label: 'Vad finns redan idag?', placeholder: 'Nuvarande lösning, material, system, data eller tidigare arbete.' },
  { id: 'krav', label: 'Finns särskilda krav eller begränsningar?', placeholder: 'Teknik, integrationer, tillgänglighet, juridik, språk eller annat.' },
  { id: 'framgang', label: 'Hur avgör ni om projektet lyckats?', placeholder: 'Mätetal, önskat beteende eller konkret effekt.' },
]

const make = (template: Omit<BriefTemplate, 'questions'> & { extraQuestions?: BriefQuestion[] }): BriefTemplate => ({
  ...template,
  questions: [...sharedQuestions, ...(template.extraQuestions ?? [])],
})

export const BRIEF_TEMPLATES: BriefTemplate[] = [
  make({
    slug: 'webbplats', categorySlug: 'webbutveckling', categoryName: 'Webbutveckling', shortTitle: 'Webbplats',
    title: 'Briefmall för ny webbplats eller redesign',
    description: 'Samla mål, innehåll, funktioner, integrationer och kvalitetskrav innan du begär offert på en webbplats.',
    metaTitle: 'Briefmall webbplats – gratis kravspec för webbyrå | Updro',
    metaDescription: 'Bygg en tydlig webbplatsbrief gratis. Samla mål, funktioner, innehåll och krav och ta briefen direkt vidare till offertförfrågan.',
    intro: 'En bra webbbrief gör att byråerna räknar på samma problem i stället för att gissa på olika omfattning.',
    extraQuestions: [
      { id: 'sidor', label: 'Vilka sidtyper behövs?', placeholder: 'Exempel: startsida, tjänster, cases, blogg, kontakt, landningssidor.' },
      { id: 'integrationer', label: 'Vilka integrationer behövs?', placeholder: 'Exempel: CRM, bokning, betalning, nyhetsbrev, inloggning.' },
    ],
    checklist: ['Mål och primär konvertering', 'Sidtyper och innehållsansvar', 'Funktioner och integrationer', 'SEO, prestanda och tillgänglighet', 'Ägarskap, drift och förvaltning'],
    links: [{ label: 'Webbutveckling', href: '/webbutveckling' }, { label: 'Vad kostar en webbplats?', href: '/priser/webbutveckling' }, { label: 'Hitta webbyrå', href: '/hitta-webbyra' }],
  }),
  make({
    slug: 'seo', categorySlug: 'seo', categoryName: 'SEO', shortTitle: 'SEO',
    title: 'Briefmall för SEO-projekt',
    description: 'Beskriv nuläge, affärsmål, marknader, tekniska hinder och mätning så SEO-byråer kan lämna jämförbara förslag.',
    metaTitle: 'SEO brief mall – kravspecifikation för SEO-byrå | Updro',
    metaDescription: 'Gratis SEO-briefmall med mål, nuläge, teknisk SEO, innehåll och mätning. Bygg briefen och gå vidare till offert.',
    intro: 'SEO-offerter blir svåra att jämföra när varje byrå tolkar uppdraget olika. Briefen skapar en gemensam startpunkt.',
    extraQuestions: [
      { id: 'marknader', label: 'Vilka marknader och sökintentioner är viktigast?', placeholder: 'Produkter, tjänster, orter, språk eller kundresor.' },
      { id: 'data', label: 'Vilken mätdata finns?', placeholder: 'GSC, GA4, rankingdata, leads, intäkter eller annan attribution.' },
    ],
    checklist: ['Affärsmål före rankingmål', 'Teknisk plattform och migreringar', 'Prioriterade sökintentioner', 'Innehåll och länkar', 'Mätning och rapportering'],
    links: [{ label: 'SEO', href: '/seo' }, { label: 'SEO-priser', href: '/priser/seo' }, { label: 'Hitta SEO-byrå', href: '/hitta-seo-byra' }],
  }),
  make({
    slug: 'google-ads', categorySlug: 'google-ads', categoryName: 'Google Ads', shortTitle: 'Google Ads',
    title: 'Briefmall för Google Ads',
    description: 'Samla mål, erbjudande, marginaler, målgrupper, spårning och kontohistorik innan du tar in Google Ads-offerter.',
    metaTitle: 'Google Ads briefmall – underlag för byråoffert | Updro',
    metaDescription: 'Skapa en tydlig Google Ads-brief gratis med mål, spårning, erbjudande och konto. Ta briefen vidare till relevanta byråer.',
    intro: 'Annonsbudgeten är inte samma sak som målet. En bra brief utgår från vad en lönsam kund eller affär får kosta.',
    extraQuestions: [
      { id: 'sparning', label: 'Hur mäts leads eller köp idag?', placeholder: 'GA4, GTM, CRM, offlinekonverteringar, samtal eller e-handel.' },
      { id: 'konto', label: 'Finns ett befintligt Ads-konto?', placeholder: 'Beskriv historik, ungefärlig spend och vad som fungerat eller inte fungerat.' },
    ],
    checklist: ['Affärsmål och lönsamhetsmål', 'Konverteringsspårning', 'Produkter/tjänster och marginaler', 'Geografi och målgrupper', 'Ägarskap till konto och data'],
    links: [{ label: 'Digital marknadsföring', href: '/digital-marknadsforing' }, { label: 'Google Ads-byråer', href: '/byraer/kategori/google-ads' }, { label: 'Beskriv uppdraget', href: '/publicera/google-ads' }],
  }),
  make({
    slug: 'e-handel', categorySlug: 'ehandel', categoryName: 'E-handel', shortTitle: 'E-handel',
    title: 'Briefmall för e-handel och webbutik',
    description: 'Definiera sortiment, checkout, betalning, logistik, integrationer och tillväxtmål inför ett e-handelsprojekt.',
    metaTitle: 'E-handel briefmall – kravspec för webbutik | Updro',
    metaDescription: 'Gratis briefmall för e-handel. Strukturera sortiment, checkout, integrationer, logistik och mål före offertförfrågan.',
    intro: 'E-handelsprojekt blir snabbt större än själva webbutiken. Briefen synliggör flödena runt betalning, lager, order och data.',
    extraQuestions: [
      { id: 'plattform', label: 'Finns önskad eller befintlig plattform?', placeholder: 'Exempel: Shopify, WooCommerce, headless eller öppet för förslag.' },
      { id: 'logistik', label: 'Hur fungerar order, lager och frakt?', placeholder: 'ERP, lager, fraktavtal, returer, marknadsplatser eller fysisk butik.' },
    ],
    checklist: ['Sortiment och produktdata', 'Checkout och betalning', 'Lager, frakt och retur', 'ERP/PIM/CRM-integrationer', 'Mätning och konvertering'],
    links: [{ label: 'E-handel', href: '/ehandel' }, { label: 'Prisguide e-handel', href: '/priser/ehandel' }, { label: 'E-handelsbyråer', href: '/byraer/kategori/ehandel' }],
  }),
  make({
    slug: 'app', categorySlug: 'apputveckling', categoryName: 'App-utveckling', shortTitle: 'App',
    title: 'Briefmall för apputveckling',
    description: 'Strukturera användare, kärnflöden, plattformar, backend, integrationer och releasekrav inför apputveckling.',
    metaTitle: 'Apputveckling briefmall – kravspec för app | Updro',
    metaDescription: 'Gratis app-briefmall för iOS, Android och webbapp. Samla användarflöden, funktioner och tekniska krav före offert.',
    intro: 'Den dyraste appfunktionen är ofta den som aldrig behövde byggas. En brief hjälper er skilja MVP från senare önskemål.',
    extraQuestions: [
      { id: 'plattformar', label: 'Vilka plattformar behövs?', placeholder: 'iOS, Android, webb, tablet eller flera.' },
      { id: 'mvp', label: 'Vad måste finnas i första releasen?', placeholder: 'Beskriv de 3–5 kärnflöden som skapar värde från dag ett.' },
    ],
    checklist: ['Målgrupp och kärnproblem', 'MVP kontra senare funktioner', 'Plattform och backend', 'Inloggning, betalning och integrationer', 'Analys, test och release'],
    links: [{ label: 'Apputveckling', href: '/apputveckling' }, { label: 'Prisguide apputveckling', href: '/priser/apputveckling' }, { label: 'Apputvecklingsbyråer', href: '/byraer/kategori/apputveckling' }],
  }),
  make({
    slug: 'ai-projekt', categorySlug: 'ai-utveckling', categoryName: 'AI-utveckling', shortTitle: 'AI-projekt',
    title: 'Briefmall för AI-projekt och automation',
    description: 'Beskriv affärsproblem, data, kvalitetskrav, human-in-the-loop och risker innan du upphandlar en AI-lösning.',
    metaTitle: 'AI-projekt briefmall – kravspec för AI-lösning | Updro',
    metaDescription: 'Gratis briefmall för AI-projekt. Strukturera problem, data, integrationer, kvalitet och risk före offertförfrågan.',
    intro: 'Börja med arbetsflödet och den mätbara effekten – inte med en modell. Då kan leverantören föreslå rätt nivå av AI.',
    extraQuestions: [
      { id: 'data-ai', label: 'Vilken data eller kunskap får lösningen använda?', placeholder: 'Datakällor, dokument, API:er, system och eventuella känsliga uppgifter.' },
      { id: 'kvalitet-ai', label: 'Vilka fel är acceptabla och vilka är kritiska?', placeholder: 'Beskriv när mänsklig kontroll behövs och hur output ska verifieras.' },
    ],
    checklist: ['Affärsproblem och nulägeskostnad', 'Datakällor och rättigheter', 'Kvalitets- och säkerhetskrav', 'Human-in-the-loop', 'Mätbar effekt och driftskostnad'],
    links: [{ label: 'AI-utveckling', href: '/ai-utveckling' }, { label: 'AI-byråer', href: '/byraer/kategori/ai-utveckling' }, { label: 'Beskriv AI-projekt', href: '/publicera/ai-utveckling' }],
  }),
  make({
    slug: 'grafisk-profil', categorySlug: 'grafisk-design', categoryName: 'Grafisk design/UX', shortTitle: 'Grafisk profil',
    title: 'Briefmall för grafisk profil och visuell identitet',
    description: 'Samla positionering, målgrupp, användningsområden, befintliga tillgångar och leveransformat inför designuppdraget.',
    metaTitle: 'Grafisk profil briefmall – underlag för designbyrå | Updro',
    metaDescription: 'Gratis briefmall för grafisk profil, logotyp och visuell identitet. Strukturera behovet och jämför relevanta byråer.',
    intro: 'En grafisk profil ska fungera i verkliga kanaler, inte bara i en presentation. Specificera därför var identiteten ska användas.',
    extraQuestions: [
      { id: 'position', label: 'Hur ska varumärket uppfattas?', placeholder: 'Tre–fem egenskaper, positionering och vad ni inte vill signalera.' },
      { id: 'leveranser', label: 'Vilka konkreta designleveranser behövs?', placeholder: 'Logotyp, typografi, färger, mallar, sociala medier, presentationer, guidelines.' },
    ],
    checklist: ['Positionering och målgrupp', 'Befintligt varumärke', 'Kanaler och användningsfall', 'Leveransformat och rättigheter', 'Förvaltning av designbibliotek'],
    links: [{ label: 'Grafisk design', href: '/grafisk-design' }, { label: 'Designbyråer', href: '/byraer/kategori/grafisk-design' }, { label: 'Beskriv designuppdrag', href: '/publicera/grafisk-design' }],
  }),
  make({
    slug: 'offertforfragan', categoryName: 'Generell offertförfrågan', shortTitle: 'Offertförfrågan',
    title: 'Mall för offertförfrågan till digital byrå',
    description: 'Skapa ett neutralt underlag som gör offerter lättare att jämföra – utan att låsa er vid en teknisk lösning för tidigt.',
    metaTitle: 'Offertförfrågan mall – jämför digitala byråofferter | Updro',
    metaDescription: 'Gratis mall för offertförfrågan till webbyrå, SEO-, app-, design- eller marknadsföringsbyrå. Bygg brief och gå vidare till offert.',
    intro: 'Den bästa offertförfrågan beskriver problemet, önskat resultat och bedömningskriterier. Leverantören får sedan visa hur de skulle lösa det.',
    extraQuestions: [
      { id: 'utvardering', label: 'Hur ska offerterna jämföras?', placeholder: 'Exempel: metod, team, referenser, total kostnad, tidplan, support eller ägarskap.' },
      { id: 'svar', label: 'Vad vill ni att byrån redovisar i sitt svar?', placeholder: 'Arbetssätt, antaganden, scope, tillval, risker och vad som inte ingår.' },
    ],
    checklist: ['Samma underlag till alla', 'Tydliga mål och avgränsningar', 'Separera krav från önskemål', 'Begär antaganden och exkluderingar', 'Jämför total leverans – inte bara timpris'],
    links: [{ label: 'Hitta byråer', href: '/byraer' }, { label: 'Prisguider', href: '/priser' }, { label: 'Så väljer du webbyrå', href: '/hitta-webbyra' }],
  }),
]

export const getBriefTemplate = (slug?: string | null) =>
  BRIEF_TEMPLATES.find(template => template.slug === slug)
