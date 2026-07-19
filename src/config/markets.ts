/**
 * Marknadskonfiguration — Updro är byggt för att expandera geografiskt.
 *
 * Varje marknad definierar språk, valuta, domän och standardland/-stad.
 * Aktiv marknad styrs av miljövariabeln VITE_MARKET ('se' | 'no'),
 * med 'se' som standard så att befintlig drift är helt opåverkad.
 *
 * När Danmark aktiveras: lägg till en 'dk'-post här och motsvarande
 * stadsdata (t.ex. src/lib/seoCitiesDk.ts) — inga fler kodändringar
 * ska behövas för grundläggande marknadsbyte.
 */

export type MarketCode = 'se' | 'no'

export interface MarketConfig {
  /** Kod som används i VITE_MARKET */
  code: MarketCode
  /** BCP 47-språktagg för Intl-formattering och html lang */
  locale: string
  /** ISO 4217-valutakod */
  currency: string
  /** Primärdomän för marknaden */
  domain: string
  /** Landets namn på marknadens eget språk */
  countryName: string
  /** Landnamn på svenska (för svenska UI:t om andra marknader) */
  countryNameSv: string
  /** Standardstad för stadsspecifikt innehåll */
  defaultCity: string
  /** Om marknaden är live och ska exponeras */
  enabled: boolean
}

export const MARKETS: Record<MarketCode, MarketConfig> = {
  se: {
    code: 'se',
    locale: 'sv-SE',
    currency: 'SEK',
    domain: 'updro.se',
    countryName: 'Sverige',
    countryNameSv: 'Sverige',
    defaultCity: 'stockholm',
    enabled: true,
  },
  no: {
    code: 'no',
    locale: 'nb-NO',
    currency: 'NOK',
    domain: 'updro.no',
    countryName: 'Norge',
    countryNameSv: 'Norge',
    defaultCity: 'oslo',
    enabled: false,
  },
}

export const DEFAULT_MARKET: MarketCode = 'se'
