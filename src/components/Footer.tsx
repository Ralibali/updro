import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

const footerColumns = [
  {
    title: 'För beställare',
    links: [
      { label: 'Publicera uppdrag', href: '/publicera' },
      { label: 'Hur det fungerar', href: '/#hur-det-fungerar' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'För byråer',
    links: [
      { label: 'Registrera', href: '/registrera/byra' },
      { label: 'Priser', href: '/priser' },
      { label: 'Logga in', href: '/logga-in' },
    ],
  },
  {
    title: 'Övrigt',
    links: [
      { label: 'Om oss', href: '/om-oss' },
      { label: 'Artiklar', href: '/artiklar' },
      { label: 'Verktyg', href: '/verktyg' },
      { label: 'Integritetspolicy', href: '/integritetspolicy' },
      { label: 'Villkor', href: '/villkor' },
    ],
  },
]

const popularServices = [
  { label: 'Webbutveckling', href: '/webbutveckling' },
  { label: 'SEO', href: '/seo' },
  { label: 'E-handel', href: '/e-handel' },
  { label: 'Google Ads', href: '/google-ads' },
  { label: 'Apputveckling', href: '/apputveckling' },
  { label: 'Digital marknadsföring', href: '/digital-marknadsforing' },
  { label: 'UX/UI-design', href: '/ux-ui-design' },
  { label: 'Grafisk design', href: '/grafisk-design' },
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
]

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo size="md" />
            <p className="mt-3 text-sm text-muted-foreground">
              Kvalitetsuppdrag till din byrå – prova gratis i fjorton dagar
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* SEO internal links */}
        <div className="border-t mt-12 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Populära tjänster</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {popularServices.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Byråer per stad</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {popularCities.map((c) => (
                <Link
                  key={c.href}
                  to={c.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Updro.se – Aurora Media AB (559272-0220)
        </div>
      </div>
    </footer>
  )
}

export default Footer
