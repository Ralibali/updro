import { CATEGORY_DEFINITIONS } from '../../supabase/functions/_shared/categories'

// Lightweight shared registry; no SEO page copy in the navigation bundle.
export const CATEGORY_NAV_LINKS = CATEGORY_DEFINITIONS.map(({ label, slug }) => ({
  label, href: `/${slug}`,
}))
