// Programmatic SEO – norske byer × tjenestekategorier
// Første norske datasett: 12 byer klargjort for når markedet aktiveres
// (VITE_MARKET=no). Språk: norsk bokmål. Struktur speiler seoCities.ts.

import type { CityData } from './seoCities'

export const CITIES_NO: CityData[] = [
  { slug: 'oslo', name: 'Oslo', population: '720 000', region: 'Oslo', description: 'Norges hovedstad og digitale sentrum.', techDescription: 'Oslo er Nordens raskest voksende tech-hub med et levende startupmiljø, Oslo Science Park og alt fra små designstudioer til store konsulentselskaper.' },
  { slug: 'bergen', name: 'Bergen', population: '290 000', region: 'Vestland', description: 'Vestlandets kreative og teknologiske sentrum.', techDescription: 'Bergen har et sterkt medie- og techmiljø med Media City Bergen som katalysator, og en lang tradisjon for design, medieteknologi og e-handel.' },
  { slug: 'trondheim', name: 'Trondheim', population: '215 000', region: 'Trøndelag', description: 'Teknologibyen med NTNU i sentrum.', techDescription: 'Trondheim er Norges teknologihovedstad drevet av NTNU og et tett samspill mellom forskning, startups og etablerte IT-selskaper.' },
  { slug: 'stavanger', name: 'Stavanger', population: '150 000', region: 'Rogaland', description: 'Energibyen med voksende digital sektor.', techDescription: 'Stavanger kombinerer energikompetanse i verdensklasse med en raskt voksende digital sektor og flere sterke web- og konsulentmiljøer.' },
  { slug: 'kristiansand', name: 'Kristiansand', population: '115 000', region: 'Agder', description: 'Sørlandets digitale knutepunkt.', techDescription: 'Kristiansand har et etablert teknologimiljø med sterke aktører innen programvare, e-handel og digital markedsføring.' },
  { slug: 'drammen', name: 'Drammen', population: '105 000', region: 'Buskerud', description: 'Vekstby i Oslos nærområde.', techDescription: 'Drammen drar nytte av nærheten til hovedstaden og har et voksende miljø av digitale byråer og IT-konsulenter.' },
  { slug: 'fredrikstad', name: 'Fredrikstad', population: '85 000', region: 'Østfold', description: 'Kreativ by ved Oslofjorden.', techDescription: 'Fredrikstad har en levende kreativ scene med byråer innen web, design og kommunikasjon, og korte avstander til Oslo-markedet.' },
  { slug: 'sandnes', name: 'Sandnes', population: '82 000', region: 'Rogaland', description: 'Industriby i Stavanger-regionen.', techDescription: 'Sandnes er en del av Stavanger-regionens sterke økonomi med økende etterspørsel etter digitale tjenester og lokale byråer.' },
  { slug: 'tromso', name: 'Tromsø', population: '78 000', region: 'Troms', description: 'Nord-Norges digitale hovedstad.', techDescription: 'Tromsø har et sterkt digitalt miljø drevet av UiT Norges arktiske universitet og en levende startup-scene i nord.' },
  { slug: 'alesund', name: 'Ålesund', population: '67 000', region: 'Møre og Romsdal', description: 'Maritim teknikk og design i verdensklasse.', techDescription: 'Ålesund er kjent for maritim teknologi og jugendarkitektur, med byråer som kombinerer design og teknisk presisjon.' },
  { slug: 'tonsberg', name: 'Tønsberg', population: '58 000', region: 'Vestfold', description: 'Norges eldste by med moderne byråmiljø.', techDescription: 'Tønsberg har et voksende byråmiljø innen web og markedsføring, med kort vei til både Sandefjord og Oslo.' },
  { slug: 'bodo', name: 'Bodø', population: '53 000', region: 'Nordland', description: 'Nordlandets voksende digitale sentrum.', techDescription: 'Bodø vokser raskt med ny universitetsby, europeisk kulturhovedstadsår 2024 og økende etterspørsel etter digitale tjenester.' },
]

// Slå opp bydata per slug – brukes av programmatiske sider når Norge aktiveres
export const CITIES_NO_BY_SLUG: ReadonlyMap<string, CityData> = new Map(
  CITIES_NO.map((city) => [city.slug, city]),
)
