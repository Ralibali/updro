import { SEO_PAGES } from './seoData'

export interface CityData {
  slug: string
  name: string
  population: string
  description: string
  techDescription: string
}

export const CITIES: CityData[] = [
  { slug: 'stockholm', name: 'Stockholm', population: '1 000 000+', description: 'Sveriges huvudstad och digitala nav med hundratals byråer.', techDescription: 'Stockholm är Nordens ledande tech-hub med över 40 000 techarbetare. Här finns allt från startups till enterprise-byråer med djup digital kompetens.' },
  { slug: 'goteborg', name: 'Göteborg', population: '590 000', description: 'Västkustens kreativa centrum med stark design- och tech-tradition.', techDescription: 'Göteborg har en dynamisk tech-scen driven av Chalmers och Lindholmen Science Park. Stark tradition inom design, industri och e-handel.' },
  { slug: 'malmo', name: 'Malmö', population: '350 000', description: 'Skånes digitala centrum med växande startup-scen.', techDescription: 'Malmö har blivit en hotspot för tech-startups med närheten till Köpenhamn och Media Evolution City som katalysatorer.' },
  { slug: 'uppsala', name: 'Uppsala', population: '230 000', description: 'Universitetsstad med stark innovations- och forskningskompetens.', techDescription: 'Uppsala erbjuder en unik kombination av akademisk spets och företagsamhet. Flera framgångsrika tech-bolag har rötter här.' },
  { slug: 'linkoping', name: 'Linköping', population: '165 000', description: 'Östergötlands tech-centrum med stark IT-tradition.', techDescription: 'Linköping har en stark IT-sektor med rötter i Linköpings universitet och närheten till techbolag som Sectra och IFS.' },
  { slug: 'orebro', name: 'Örebro', population: '155 000', description: 'Centralt beläget nav med växande digital sektor.', techDescription: 'Örebro har ett växande digitalt ekosystem med flera framgångsrika webbbyråer och IT-konsultbolag.' },
  { slug: 'vasteras', name: 'Västerås', population: '155 000', description: 'Industristad med stark teknisk kompetens.', techDescription: 'Västerås har en lång tradition av teknisk innovation tack vare ABB och Mälardalens universitet.' },
  { slug: 'helsingborg', name: 'Helsingborg', population: '145 000', description: 'Skånes kreativa port med växande digital sektor.', techDescription: 'Helsingborg har på kort tid blivit en kreativ hub med co-working spaces och digitala byråer i Oceanhamnen-området.' },
  { slug: 'norrkoping', name: 'Norrköping', population: '142 000', description: 'Visualiseringens huvudstad med stark digital kompetens.', techDescription: 'Norrköping har positionerat sig som Sveriges visualiseringscentrum med Visualization Center C och Norrköpings Science Park.' },
  { slug: 'jonkoping', name: 'Jönköping', population: '140 000', description: 'Entreprenörsstad med stark företagartradition.', techDescription: 'Jönköping har en av Sveriges starkaste företagartraditioner. Jönköping University driver innovation och digital kompetens i regionen.' },
  { slug: 'lund', name: 'Lund', population: '125 000', description: 'Universitetsstad med världsledande forskning.', techDescription: 'Lund erbjuder världsledande forskning via Lunds universitet och Ideon Science Park – en av Europas äldsta tech-parker.' },
  { slug: 'umea', name: 'Umeå', population: '130 000', description: 'Norrlands digitala huvudstad.', techDescription: 'Umeå har en stark digital sektor driven av universitetet och en livlig startup-scen med fokus på design och användarupplevelse.' },
]

export const SERVICE_CATEGORIES = SEO_PAGES.map(p => ({
  slug: p.categorySlug,
  name: p.categoryName,
}))

// Generate city × service combinations
export interface CityServicePage {
  citySlug: string
  cityName: string
  serviceSlug: string
  serviceName: string
  metaTitle: string
  metaDesc: string
  h1: string
  intro: string
  sections: { heading: string; content: string }[]
  faq: { q: string; a: string }[]
  relatedLinks: { label: string; href: string }[]
}

const generateCityServicePage = (city: CityData, service: { slug: string; name: string }): CityServicePage => ({
  citySlug: city.slug,
  cityName: city.name,
  serviceSlug: service.slug,
  serviceName: service.name,
  metaTitle: `${service.name} ${city.name} – Hitta byrå | Updro`,
  metaDesc: `Hitta de bästa byråerna för ${service.name.toLowerCase()} i ${city.name}. Jämför offerter kostnadsfritt och hitta rätt partner.`,
  h1: `${service.name} i ${city.name}`,
  intro: `Letar du efter professionell ${service.name.toLowerCase()} i ${city.name}? ${city.techDescription} Via Updro jämför du kostnadsfritt offerter från kvalitetssäkrade byråer i ${city.name} och hittar den perfekta partnern för ditt projekt.`,
  sections: [
    {
      heading: `${service.name}-byråer i ${city.name}`,
      content: `${city.name} (${city.population} invånare) har ett brett utbud av byråer som specialiserar sig på ${service.name.toLowerCase()}. ${city.description}\n\nOavsett om du behöver en lokal partner eller en byrå som levererar på distans – genom att jämföra offerter via Updro hittar du rätt kvalitet till rätt pris. Vi matchar dig med verifierade byråer som har erfarenhet av just din typ av projekt.`
    },
    {
      heading: `Varför välja en byrå i ${city.name}?`,
      content: `Att välja en lokal byrå i ${city.name} ger flera fördelar:\n\n- **Fysiska möten** – Enklare att diskutera projekt öga mot öga\n- **Lokal marknadskännedom** – Förståelse för den lokala marknaden\n- **Snabb responstid** – Samma tidszon, inga förseningar\n- **Nätverk** – Kontakter med andra lokala leverantörer\n- **Partnerskap** – Lättare att bygga långsiktiga relationer\n\nSamtidigt kan distanssamarbeten fungera utmärkt – det viktigaste är att byrån levererar kvalitet och förstår dina behov.`
    },
    {
      heading: `Vad kostar ${service.name.toLowerCase()} i ${city.name}?`,
      content: `Priserna för ${service.name.toLowerCase()} i ${city.name} varierar beroende på byråns storlek, erfarenhet och projektets komplexitet. Generellt ligger priserna i linje med rikssnittet, med Stockholm ofta 10–20% dyrare.\n\nDet bästa sättet att hitta rätt pris är att jämföra minst 3 offerter. Via Updro kan du göra detta kostnadsfritt – beskriv ditt projekt och få offerter inom 24 timmar.`
    },
  ],
  faq: [
    { q: `Vad kostar ${service.name.toLowerCase()} i ${city.name}?`, a: `Priserna varierar beroende på projektets omfattning. Jämför minst 3 offerter via Updro för att hitta rätt pris.` },
    { q: `Hur hittar jag rätt ${service.name.toLowerCase()}-byrå i ${city.name}?`, a: `Jämför offerter via Updro, granska byråernas portfolio, och be om kundrekommendationer. Vi matchar dig med relevanta byråer i ${city.name}.` },
    { q: `Kan jag anlita en byrå utanför ${city.name}?`, a: `Absolut! Många projekt genomförs framgångsrikt på distans. Det viktiga är byråns kompetens och kommunikation, inte geografisk plats.` },
  ],
  relatedLinks: [
    { label: `${service.name}`, href: `/${service.slug}` },
    { label: `${service.name} pris`, href: `/${service.slug}/pris` },
    ...CITIES.filter(c => c.slug !== city.slug).slice(0, 2).map(c => ({
      label: `${service.name} ${c.name}`, href: `/${service.slug}/${c.slug}`
    })),
  ]
})

// Pre-generate all city×service pages
export const CITY_SERVICE_PAGES: CityServicePage[] = CITIES.flatMap(city =>
  SERVICE_CATEGORIES.map(service => generateCityServicePage(city, service))
)

// City hub page data
export interface CityHubData {
  slug: string
  name: string
  metaTitle: string
  metaDesc: string
  h1: string
  intro: string
  description: string
  services: { name: string; href: string }[]
}

export const getCityHubData = (citySlug: string): CityHubData | undefined => {
  const city = CITIES.find(c => c.slug === citySlug)
  if (!city) return undefined
  return {
    slug: city.slug,
    name: city.name,
    metaTitle: `Digitala byråer i ${city.name} – Jämför offerter | Updro`,
    metaDesc: `Hitta de bästa digitala byråerna i ${city.name}. Webbutveckling, SEO, e-handel, apputveckling – jämför offerter kostnadsfritt.`,
    h1: `Digitala tjänster i ${city.name}`,
    intro: `${city.name} (${city.population} invånare) ${city.description} ${city.techDescription} Via Updro jämför du offerter från kvalitetssäkrade byråer i ${city.name} – kostnadsfritt och utan förpliktelser.`,
    description: city.techDescription,
    services: SERVICE_CATEGORIES.map(s => ({
      name: `${s.name} i ${city.name}`,
      href: `/${s.slug}/${city.slug}`,
    })),
  }
}

export const getAllCityHubs = (): CityHubData[] => CITIES.map(c => getCityHubData(c.slug)!)

// Find a specific city service page
export const findCityServicePage = (serviceSlug: string, citySlug: string) =>
  CITY_SERVICE_PAGES.find(p => p.serviceSlug === serviceSlug && p.citySlug === citySlug)
