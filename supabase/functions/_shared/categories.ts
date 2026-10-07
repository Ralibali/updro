/** Shared by the browser and Edge Functions. Values remain compatible with saved data. */
export const CATEGORY_DEFINITIONS = [
  { value: 'Webbutveckling', label: 'Webbutveckling', slug: 'webbutveckling', icon: '🌐', aliases: [] },
  { value: 'E-handel', label: 'E-handel', slug: 'ehandel', icon: '🛒', aliases: ['e-handel'] },
  { value: 'Digital marknadsföring', label: 'Digital marknadsföring', slug: 'digital-marknadsforing', icon: '📈', aliases: ['e-postmarknadsforing', 'analys-data', 'reklam'] },
  { value: 'SEO', label: 'SEO', slug: 'seo', icon: '🔍', aliases: [] },
  { value: 'Grafisk design/UX', label: 'Grafisk design & UX', slug: 'grafisk-design', icon: '🎨', aliases: ['ux-ui-design', 'design', 'tryck'] },
  { value: 'UX/Webbdesign', label: 'Webbdesign', slug: 'webbdesign', icon: '✏️', aliases: ['ux-webbdesign', 'UX / Webbdesign'] },
  { value: 'App-utveckling', label: 'App-utveckling', slug: 'app-utveckling', icon: '📱', aliases: ['apputveckling'] },
  { value: 'Mjukvaruutveckling', label: 'Mjukvaruutveckling', slug: 'mjukvaruutveckling', icon: '⚙️', aliases: [] },
  { value: 'AI-utveckling', label: 'AI-utveckling', slug: 'ai-utveckling', icon: '🤖', aliases: [] },
  { value: 'IT-konsult', label: 'IT-konsult', slug: 'it-konsult', icon: '💻', aliases: [] },
  { value: 'Underhåll/IT Support', label: 'IT-support & underhåll', slug: 'it-support', icon: '🛠️', aliases: ['IT-support / Underhåll'] },
  { value: 'Sociala medier', label: 'Sociala medier', slug: 'sociala-medier', icon: '📣', aliases: ['media'] },
  { value: 'Video & foto', label: 'Video & foto', slug: 'video-foto', icon: '🎬', aliases: ['fotografering'] },
  { value: 'Varumärke & PR', label: 'Varumärke & PR', slug: 'varumarke-pr', icon: '📰', aliases: ['kommunikation'] },
  { value: 'Affärsutveckling', label: 'Affärsutveckling', slug: 'affarsutveckling', icon: '🚀', aliases: [] },
  { value: 'Google Ads', label: 'Google Ads', slug: 'google-ads', icon: '🎯', aliases: [] },
] as const

export type Category = typeof CATEGORY_DEFINITIONS[number]['value']
export const CATEGORIES = CATEGORY_DEFINITIONS.map(category => category.value)
export const CATEGORY_VALUES: ReadonlySet<string> = new Set(CATEGORIES)
export const CATEGORY_BY_SLUG: Record<string, Category> = Object.fromEntries(
  CATEGORY_DEFINITIONS.flatMap(category => [category.slug, ...category.aliases]
    .map(slug => [slug.toLowerCase(), category.value])),
)
export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  CATEGORY_DEFINITIONS.map(category => [category.value, category.icon]),
)
export const resolveCategory = (input?: string | null): Category | '' => {
  const normalized = input?.trim().toLowerCase()
  if (!normalized) return ''
  return CATEGORY_DEFINITIONS.find(category =>
    category.value.toLowerCase() === normalized || category.label.toLowerCase() === normalized,
  )?.value || CATEGORY_BY_SLUG[normalized] || ''
}
export const categoryLabel = (value: string): string =>
  CATEGORY_DEFINITIONS.find(category => category.value === resolveCategory(value))?.label || value
