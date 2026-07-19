/**
 * Marknadsupplösning och marknadsmedvetna hjälpfunktioner.
 *
 * Aktiv marknad läses från VITE_MARKET vid byggtillfället. Allt som
 * saknas eller är okänt faller tillbaka på Sverige — befintlig beteende
 * ändras aldrig om variabeln inte sätts.
 */

import { MARKETS, DEFAULT_MARKET, type MarketCode, type MarketConfig } from '@/config/markets'

/** Löser upp aktiv marknadskod från miljövariabeln. */
export function getMarketCode(env: string | undefined = import.meta.env.VITE_MARKET): MarketCode {
  if (env && env in MARKETS) return env as MarketCode
  return DEFAULT_MARKET
}

/** Konfigurationen för den aktiva marknaden. */
export function getMarket(code: MarketCode = getMarketCode()): MarketConfig {
  return MARKETS[code] ?? MARKETS[DEFAULT_MARKET]
}

/** Den aktiva marknaden (löses en gång per anrop — billig operation). */
export const activeMarket = (): MarketConfig => getMarket(getMarketCode())

/**
 * Formaterar ett belopp enligt en given marknads språk och valuta.
 * Använder Intl.NumberFormat för korrekta tusenavgränsare och valutasymbol.
 */
export function formatPriceForMarket(amount: number, market: MarketConfig): string {
  return new Intl.NumberFormat(market.locale, {
    style: 'currency',
    currency: market.currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formaterar ett belopp enligt aktiv marknad.
 * Standardbeteendet (sv-SE/SEK) är avsett att matcha tidigare formatPrice.
 */
export function formatMarketPrice(amount: number): string {
  return formatPriceForMarket(amount, activeMarket())
}
