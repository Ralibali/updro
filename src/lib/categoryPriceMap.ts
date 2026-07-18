import { PRICE_MATRIX, type LevelKey } from './priceGuideData'

/**
 * Kopplar wizard-kategorierna (CATEGORIES i constants.ts) till
 * prisguidens matrisnycklar och guide-slugs. Kategorier utan egen
 * prisguide lämnas utanför mappningen och visar ingen prisindikator.
 */
export const CATEGORY_PRICE_MAP: Record<string, { matrixKey: keyof typeof PRICE_MATRIX; guideSlug: string; guideLabel: string }> = {
  'Webbutveckling': { matrixKey: 'hemsida', guideSlug: 'hemsida', guideLabel: 'hemsida' },
  'E-handel': { matrixKey: 'ehandel', guideSlug: 'e-handel', guideLabel: 'e-handel' },
  'SEO': { matrixKey: 'seo', guideSlug: 'seo', guideLabel: 'SEO' },
  'Digital marknadsföring': { matrixKey: 'ads', guideSlug: 'google-ads', guideLabel: 'Google Ads' },
  'App-utveckling': { matrixKey: 'app', guideSlug: 'apputveckling', guideLabel: 'apputveckling' },
  'Grafisk design/UX': { matrixKey: 'design', guideSlug: 'grafisk-design', guideLabel: 'design' },
  'UX/Webbdesign': { matrixKey: 'ux', guideSlug: 'ux-webbdesign', guideLabel: 'UX/webbdesign' },
  'Varumärke & PR': { matrixKey: 'varumarke', guideSlug: 'varumarke-pr', guideLabel: 'varumärke & PR' },
  'AI-utveckling': { matrixKey: 'ai', guideSlug: 'ai-utveckling', guideLabel: 'AI-utveckling' },
  'IT-konsult': { matrixKey: 'it-konsult', guideSlug: 'it-konsult', guideLabel: 'IT-konsult' },
  'Sociala medier': { matrixKey: 'sociala-medier', guideSlug: 'sociala-medier', guideLabel: 'sociala medier' },
  'Mjukvaruutveckling': { matrixKey: 'mjukvara', guideSlug: 'mjukvaruutveckling', guideLabel: 'mjukvaruutveckling' },
  'Video & foto': { matrixKey: 'video-foto', guideSlug: 'video-foto', guideLabel: 'video & foto' },
  'Underhåll/IT Support': { matrixKey: 'it-support', guideSlug: 'it-support', guideLabel: 'IT-support' },
  'Affärsutveckling': { matrixKey: 'affarsutveckling', guideSlug: 'affarsutveckling', guideLabel: 'affärsutveckling' },
}

export const LEVEL_LABELS: Record<LevelKey, string> = {
  enkel: 'Enkel',
  standard: 'Standard',
  avancerad: 'Avancerad',
}
