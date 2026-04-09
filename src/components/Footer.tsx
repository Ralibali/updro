import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

const footerColumns = [
  {
    title: 'För kunder',
    links: [
      { label: 'Starta förfrågan', href: '/publicera' },
      { label: 'Hitta webbyrå', href: '/hitta-webbyra' },
      { label: 'Hitta SEO-byrå', href: '/hitta-seo-byra' },
      { label: 'Hitta digital byrå', href: '/hitta-digital-byra' },
      { label: 'Updro vs Offerta', href: '/updro-vs-offerta' },
      { label: 'Updro vs Hittabyrå', href: '/updro-vs-hittabyra' },
      { label: 'Hur det fungerar', href: '/#hur-det-fungerar' },
    ],
  },
  {
    title: 'För byråer',
    links: [
      { label: 'Registrera din byrå', href: '/registrera/byra' },
      { label: 'Byrå-dashboard', href: '/dashboard/supplier' },
      { label: 'Priser', href: '/priser' },
      { label: 'Villkor för byråer', href: '/villkor' },
    ],
  },
  {
    title: 'Om oss',
    links: [
      { label: 'Om Updro', href: '/om-oss' },
      { label: 'Integritetspolicy', href: '/integritetspolicy' },
      { label: 'Användarvillkor', href: '/villkor' },
      { label: 'Cookiepolicy', href: '/cookies' },
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
]

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-white" role="contentinfo">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo size="md" className="[&_span]:text-white" />
            <p className="mt-3 text-sm text-gray-400">
              Sveriges marknadsplats för digitala uppdrag
            </p>
            <p className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} Updro – Aurora Media AB
            </p>
            <p className="text-xs text-gray-500">info@auroramedia.se</p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="font-display font-semibold text-sm mb-4 text-white">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.href.includes('#') ? (
                      <a href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
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
        <div className="border-t border-gray-800 mt-12 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <nav aria-label="Populära tjänster">
            <h4 className="font-display font-semibold text-sm mb-4 text-white">Populära tjänster</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {popularServices.map((s) => (
                <Link key={s.href} to={s.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {s.label}
                </Link>
              ))}
            </div>
          </nav>
          <nav aria-label="Byråer per stad">
            <h4 className="font-display font-semibold text-sm mb-4 text-white">Byråer per stad</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {popularCities.map((c) => (
                <Link key={c.href} to={c.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                  {c.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default Footer
