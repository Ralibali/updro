import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

const footerColumns = [
  {
    title: 'För beställare',
    links: [
      { label: 'Publicera uppdrag', href: '/publicera' },
      { label: 'Hur det fungerar', href: '/#hur-det-fungerar' },
      { label: 'Guider', href: '/guider' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'För byråer',
    links: [
      { label: 'Registrera byrå', href: '/registrera/byra' },
      { label: 'Priser', href: '/priser' },
      { label: 'Logga in', href: '/logga-in' },
    ],
  },
  {
    title: 'Resurser',
    links: [
      { label: 'Artiklar', href: '/artiklar' },
      { label: 'Verktyg', href: '/verktyg' },
      { label: 'Jämförelser', href: '/jamfor' },
      { label: 'Om oss', href: '/om-oss' },
      { label: 'Integritetspolicy', href: '/integritetspolicy' },
      { label: 'Villkor', href: '/villkor' },
      { label: 'Sitemap', href: '/sitemap' },
    ],
  },
]

const popularServices = [
  { label: 'Webbutveckling', href: '/webbutveckling' },
  { label: 'SEO-byrå', href: '/seo' },
  { label: 'E-handel', href: '/ehandel' },
  { label: 'Apputveckling', href: '/app-utveckling' },
  { label: 'Digital marknadsföring', href: '/digital-marknadsforing' },
  { label: 'Grafisk design', href: '/grafisk-design' },
  { label: 'Google Ads-byrå', href: '/google-ads' },
  { label: 'UX/UI-design', href: '/ux-ui-design' },
  { label: 'Mjukvaruutveckling', href: '/mjukvaruutveckling' },
  { label: 'AI-utveckling', href: '/ai-utveckling' },
]

const popularCities = [
  { label: 'Stockholm', href: '/stader/stockholm' },
  { label: 'Göteborg', href: '/stader/goteborg' },
  { label: 'Malmö', href: '/stader/malmo' },
  { label: 'Uppsala', href: '/stader/uppsala' },
  { label: 'Linköping', href: '/stader/linkoping' },
  { label: 'Örebro', href: '/stader/orebro' },
  { label: 'Helsingborg', href: '/stader/helsingborg' },
  { label: 'Umeå', href: '/stader/umea' },
  { label: 'Västerås', href: '/stader/vasteras' },
  { label: 'Norrköping', href: '/stader/norrkoping' },
  { label: 'Jönköping', href: '/stader/jonkoping' },
  { label: 'Lund', href: '/stader/lund' },
]

const comparisons = [
  { label: 'Bästa SEO-byrån', href: '/basta-seo-byran' },
  { label: 'Bästa webbyrån', href: '/basta-webbyran' },
  { label: 'Bästa e-handelsbyrån', href: '/basta-ehandel-byran' },
  { label: 'Bästa app-byrån', href: '/basta-app-byran' },
]

const Footer = () => {
  return (
    <footer className="border-t bg-card" role="contentinfo">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo size="md" />
            <p className="mt-3 text-sm text-muted-foreground">
              Sveriges ledande marknadsplats för digitala uppdrag. Jämför offerter från kvalitetssäkrade byråer – helt gratis.
            </p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.href.includes('#') ? (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* SEO internal links */}
        <div className="border-t mt-12 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <nav aria-label="Populära tjänster">
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Populära tjänster</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {popularServices.map((s) => (
                <Link key={s.href} to={s.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {s.label}
                </Link>
              ))}
            </div>
          </nav>
          <nav aria-label="Byråer per stad">
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Byråer per stad</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {popularCities.map((c) => (
                <Link key={c.href} to={c.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          </nav>
          <nav aria-label="Jämförelser">
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Jämförelser</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {comparisons.map((c) => (
                <Link key={c.href} to={c.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Updro.se – Aurora Media AB (559272-0220). Alla rättigheter förbehållna.
        </div>
      </div>
    </footer>
  )
}

export default Footer
