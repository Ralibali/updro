// Category links for the navbar. The navbar renders on every page, so it must
// not import seoData.ts (about 95 kB of page copy). categoryNavLinks.test.ts
// keeps this list in sync with getCategoryNavLinks() in seoData.ts.
export const CATEGORY_NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Webbutveckling', href: '/webbutveckling' },
  { label: 'E-handel', href: '/ehandel' },
  { label: 'Digital marknadsföring', href: '/digital-marknadsforing' },
  { label: 'SEO', href: '/seo' },
  { label: 'Grafisk design & UX', href: '/grafisk-design' },
  { label: 'UX / Webbdesign', href: '/webbdesign' },
  { label: 'App-utveckling', href: '/app-utveckling' },
  { label: 'Mjukvaruutveckling', href: '/mjukvaruutveckling' },
  { label: 'AI-utveckling', href: '/ai-utveckling' },
  { label: 'IT-konsult', href: '/it-konsult' },
  { label: 'IT-support / Underhåll', href: '/it-support' },
  { label: 'Sociala medier', href: '/sociala-medier' },
  { label: 'Video & Foto', href: '/video-foto' },
  { label: 'Varumärke & PR', href: '/varumarke-pr' },
  { label: 'Affärsutveckling', href: '/affarsutveckling' },
  { label: 'Google Ads', href: '/google-ads' },
]
