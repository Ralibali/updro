import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'

declare const __BUILD_TIMESTAMP__: string
const BUILD_ID = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : 'dev'

const footerColumns = [
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

const cityLinks = [
  { label: 'Stockholm', href: '/byraer/stockholm' },
  { label: 'Göteborg', href: '/byraer/goteborg' },
  { label: 'Malmö', href: '/byraer/malmo' },
  { label: 'Uppsala', href: '/byraer/uppsala' },
  { label: 'Linköping', href: '/byraer/linkoping' },
  { label: 'Jönköping', href: '/byraer/jonkoping' },
  { label: 'Örebro', href: '/byraer/orebro' },
  { label: 'Umeå', href: '/byraer/umea' },
]

const Footer = () => {
  return (
    <footer className="bg-foreground text-background" role="contentinfo">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <Logo size="md" className="[&_span]:text-background" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-background/60">Jämför digitala byråer och offerter utan massutskick.</p>
            <div className="mt-5 space-y-1 text-xs text-background/45">
              <p>© {new Date().getFullYear()} Updro – Aurora Media AB</p>
              <p>Org.nr 559272-0220</p>
              <a href="mailto:info@auroramedia.se" className="hover:text-background">info@auroramedia.se</a>
            </div>
          </div>

          {footerColumns.map(column => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-sm font-bold mb-4 text-background">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-background/60 hover:text-background transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-background/10 mt-12 pt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-background/55">
            <span className="text-background/40">Byråer i</span>
            {cityLinks.map(city => <Link key={city.href} to={city.href} className="hover:text-background transition-colors">{city.label}</Link>)}
            <Link to="/stader" className="font-semibold text-background/80 hover:text-background">Alla städer →</Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-background/45">
            <Link to="/redaktionell-policy" className="hover:text-background">Redaktionell policy</Link>
            <Link to="/cookies" className="hover:text-background">Cookiepolicy</Link>
            <Link to="/rapportera-innehall" className="hover:text-background">Rapportera innehåll</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 py-3 text-center">
        <span className="text-[10px] text-background/30 select-all" title="Build ID">v {BUILD_ID}</span>
      </div>
    </footer>
  )
}

export default Footer
