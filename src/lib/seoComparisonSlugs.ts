// Route slugs for the comparison pages in seoComparisons.ts. App.tsx only needs
// the slugs to register routes; importing the full comparison content there
// would ship it in the main bundle on every page. seoComparisonSlugs.test.ts
// keeps this list in sync with COMPARISON_PAGES.
export const COMPARISON_SLUGS = [
  'basta-seo-byran',
  'basta-webbyran',
  'basta-webbyran-stockholm',
  'basta-ehandel-byran',
  'basta-apputvecklare',
  'basta-marknadsforingsbyra',
  'basta-designbyran',
  'basta-it-konsulten',
  'basta-sociala-medier-byran',
  'basta-ai-byran',
  'basta-google-ads-byran',
  'basta-ux-byran',
  'basta-webbyran-goteborg',
  'basta-webbyran-malmo',
  'updro-vs-offerta',
  'updro-vs-hittabyra',
] as const
