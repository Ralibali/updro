import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

const footerColumns = [
  {
    title: 'För beställare',
    links: [
      { label: 'Publicera uppdrag', href: '/publicera' },
      { label: 'Hur det fungerar', href: '/#hur-det-fungerar' },
      { label: 'Guider', href: '/guider' },
      { label: 'Kunskapsbank', href: '/kunskapsbank' },
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
      { label: 'Cookiepolicy', href: '/cookies' },
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
  { label: 'Stockholm', href: '/byraer/stockholm' },
  { label: 'Göteborg', href: '/byraer/goteborg' },
  { label: 'Malmö', href: '/byraer/malmo' },
  { label: 'Linköping', href: '/byraer/linkoping' },
  { label: 'Norrköping', href: '/byraer/norrkoping' },
  { label: 'Örebro', href: '/byraer/orebro' },
  { label: 'Helsingborg', href: '/byraer/helsingborg' },
  { label: 'Jönköping', href: '/byraer/jonkoping' },
  { label: 'Umeå', href: '/byraer/umea' },
  { label: 'Västerås', href: '/byraer/vasteras' },
  { label: 'Lund', href: '/byraer/lund' },
  { label: 'Halmstad', href: '/byraer/halmstad' },
  { label: 'Gävle', href: '/byraer/gavle' },
  { label: 'Sundsvall', href: '/byraer/sundsvall' },
  { label: 'Karlstad', href: '/byraer/karlstad' },
  { label: 'Borås', href: '/byraer/boras' },
  { label: 'Växjö', href: '/byraer/vaxjo' },
  { label: 'Kalmar', href: '/byraer/kalmar' },
  { label: 'Skellefteå', href: '/byraer/skelleftea' },
  { label: 'Luleå', href: '/byraer/lulea' },
  { label: 'Falun', href: '/byraer/falun' },
  { label: 'Skövde', href: '/byraer/skovde' },
  { label: 'Ängelholm', href: '/byraer/angelholm' },
  { label: 'Piteå', href: '/byraer/pitea' },
]

const categories = [
  { label: 'Digital marknadsföring', href: '/byraer/kategori/digital-marknadsforing' },
  { label: 'Design', href: '/byraer/kategori/design' },
  { label: 'SEO', href: '/byraer/kategori/seo' },
  { label: 'Reklam', href: '/byraer/kategori/reklam' },
  { label: 'Media', href: '/byraer/kategori/media' },
  { label: 'E-handel', href: '/byraer/kategori/e-handel' },
  { label: 'Webb', href: '/byraer/kategori/webb' },
  { label: 'Grafisk design', href: '/byraer/kategori/grafisk-design' },
  { label: 'PR', href: '/byraer/kategori/pr' },
  { label: 'Kommunikation', href: '/byraer/kategori/kommunikation' },
  { label: 'Tryck', href: '/byraer/kategori/tryck' },
  { label: 'Fotografering', href: '/byraer/kategori/fotografering' },
]

const comparisons = [
  { label: 'Bästa SEO-byrån', href: '/basta-seo-byran' },
  { label: 'Bästa webbyrån', href: '/basta-webbyran' },
  { label: 'Bästa e-handelsbyrån', href: '/basta-ehandel-byran' },
  { label: 'Bästa app-byrån', href: '/basta-app-byran' },
]

const topCombos = [
  { label: 'Design i Linköping', href: '/byraer/linkoping/design' },
  { label: 'Media i Norrköping', href: '/byraer/norrkoping/media' },
  { label: 'Reklam i Helsingborg', href: '/byraer/helsingborg/reklam' },
  { label: 'Digital marknadsföring i Halmstad', href: '/byraer/halmstad/digital-marknadsforing' },
  { label: 'SEO i Stockholm', href: '/byraer/stockholm/seo' },
  { label: 'Webb i Göteborg', href: '/byraer/goteborg/webb' },
  { label: 'E-handel i Malmö', href: '/byraer/malmo/e-handel' },
  { label: 'Grafisk design i Jönköping', href: '/byraer/jonkoping/grafisk-design' },
  { label: 'Digital marknadsföring i Örebro', href: '/byraer/orebro/digital-marknadsforing' },
  { label: 'Media i Malmö', href: '/byraer/malmo/media' },
  { label: 'Media i Göteborg', href: '/byraer/goteborg/media' },
  { label: 'Tryck i Linköping', href: '/byraer/linkoping/tryck' },
  { label: 'Tryck i Gävle', href: '/byraer/gavle/tryck' },
  { label: 'Reklam i Stockholm', href: '/byraer/stockholm/reklam' },
  { label: 'Design i Malmö', href: '/byraer/malmo/design' },
  { label: 'Webb i Umeå', href: '/byraer/umea/webb' },
  { label: 'SEO i Göteborg', href: '/byraer/goteborg/seo' },
  { label: 'PR i Stockholm', href: '/byraer/stockholm/pr' },
  { label: 'E-handel i Stockholm', href: '/byraer/stockholm/e-handel' },
  { label: 'Design i Örebro', href: '/byraer/orebro/design' },
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
        <div className="border-t mt-12 pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
          <nav aria-label="Kategorier">
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Kategorier</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {categories.map((c) => (
                <Link key={c.href} to={c.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {c.label}
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

        {/* Top combos */}
        <div className="border-t mt-8 pt-8">
          <nav aria-label="Populära stad+kategori">
            <h4 className="font-display font-semibold text-sm mb-4 text-foreground">Populära kombinationer</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {topCombos.map((c) => (
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
