export interface ToolPage {
  slug: string
  metaTitle: string
  metaDesc: string
  h1: string
  intro: string
  description: string
  relatedLinks: { label: string; href: string }[]
}

/**
 * Bara färdiga, verkligt användbara verktyg ska ligga här.
 * Listan driver både /verktyg och de statiska SEO-rutterna/sitemap.
 * Lägg inte tillbaka ett verktyg förrän själva interaktionen är implementerad.
 */
export const TOOLS: ToolPage[] = [
  {
    slug: 'hemsida-pris-kalkylator',
    metaTitle: 'Hemsida pris kalkylator – beräkna kostnaden | Updro',
    metaDesc: 'Beräkna ett prisintervall för din hemsida utifrån omfattning och funktioner. Gratis kalkylator utan registrering – jämför sedan med riktiga offerter.',
    h1: 'Hemsida pris kalkylator',
    intro: 'Få ett första riktvärde på vad en ny hemsida kan kosta utifrån dina behov. Kalkylatorn ger ett scenario att utgå från innan du jämför riktiga offerter.',
    description: 'Kalkylatorn väger in omfattning och funktionalitet för att ge ett första prisintervall. Resultatet är ett planeringsunderlag, inte en bindande offert.',
    relatedLinks: [
      { label: 'Webbutveckling pris', href: '/webbutveckling/pris' },
      { label: 'Vad kostar en hemsida?', href: '/artiklar/vad-kostar-en-hemsida-2026' },
      { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
      { label: 'Jämför offerter', href: '/publicera/webbutveckling' },
    ],
  },
]

export const findTool = (slug: string) => TOOLS.find(tool => tool.slug === slug)
