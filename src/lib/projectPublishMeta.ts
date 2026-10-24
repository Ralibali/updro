import { categoryLabel, resolveCategory } from './constants'

/** Shared by the form and its static landing pages. */
export const PROJECT_PUBLISH_META = {
  title: 'Publicera uppdrag – få offerter från digitala byråer | Updro',
  description: 'Beskriv ditt digitala projekt. Updro granskar briefen före matchning med högst tre relevanta byråer. Du väljer själv om du vill gå vidare.',
  h1: 'Vad behöver du hjälp med?',
}

export function projectPublishMeta(slug?: string) {
  if (!slug) return PROJECT_PUBLISH_META
  const category = resolveCategory(slug)
  const label = category ? categoryLabel(category) : slug.replace(/-/g, ' ')
  return {
    title: `Publicera uppdrag inom ${label} | Updro`,
    description: `Beskriv vad du behöver hjälp med inom ${label}. Granska din brief innan du skickar den. Det är gratis för beställare.`,
    h1: `Vad behöver du hjälp med inom ${label}?`,
  }
}
