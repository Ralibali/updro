export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

// Single source of truth for footer links – reused by Footer.tsx and by the
// static SEO footer so the two can never drift apart.
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'För beställare',
    links: [
      { label: 'Beskriv ett projekt', href: '/publicera' },
      { label: 'Hitta byråer', href: '/byraer' },
      { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
      { label: 'Hitta SEO-byrå', href: '/hitta-seo-byra' },
      { label: 'Pris-kalkylator', href: '/verktyg/hemsida-pris-kalkylator' },
    ],
  },
  {
    title: 'För byråer',
    links: [
      { label: 'Så fungerar Updro för byråer', href: '/for-byraer' },
      { label: 'Registrera din byrå', href: '/registrera/byra' },
      { label: 'Priser', href: '/priser' },
      { label: 'Alternativ till Partna', href: '/partna-alternativ' },
      { label: 'Byt från Partna', href: '/for-byraer/byt-fran-partna' },
    ],
  },
  {
    title: 'Guider & jämförelser',
    links: [
      { label: 'Artiklar och guider', href: '/artiklar' },
      { label: 'Gratis verktyg', href: '/verktyg' },
      { label: 'Alla jämförelser', href: '/jamfor' },
      { label: 'Webbutveckling pris', href: '/webbutveckling/pris' },
      { label: 'SEO pris', href: '/seo/pris' },
    ],
  },
  {
    title: 'Updro',
    links: [
      { label: 'Om Updro', href: '/om-oss' },
      { label: 'Vår metod', href: '/metod' },
      { label: 'Support', href: '/support' },
      { label: 'Villkor', href: '/villkor' },
      { label: 'Integritet & cookies', href: '/integritetspolicy' },
    ],
  },
]

export const FOOTER_CITY_LINKS: FooterLink[] = [
  { label: 'Stockholm', href: '/byraer/stockholm' },
  { label: 'Göteborg', href: '/byraer/goteborg' },
  { label: 'Malmö', href: '/byraer/malmo' },
  { label: 'Uppsala', href: '/byraer/uppsala' },
  { label: 'Linköping', href: '/byraer/linkoping' },
  { label: 'Jönköping', href: '/byraer/jonkoping' },
  { label: 'Örebro', href: '/byraer/orebro' },
  { label: 'Umeå', href: '/byraer/umea' },
]

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Redaktionell policy', href: '/redaktionell-policy' },
  { label: 'Cookiepolicy', href: '/cookies' },
  { label: 'Rapportera innehåll', href: '/rapportera-innehall' },
]
