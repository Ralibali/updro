import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import { FOOTER_COLUMNS, FOOTER_CITY_LINKS, FOOTER_LEGAL_LINKS } from '@/lib/footerLinks'

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-white" role="contentinfo">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <Logo size="md" className="[&_span]:text-white" />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">Jämför digitala byråer och offerter utan massutskick.</p>
            <div className="mt-5 space-y-1 text-xs text-white/65">
              <p>© {new Date().getFullYear()} Updro – Aurora Media AB</p>
              <p>Org.nr 559272-0220</p>
              <a href="mailto:info@auroramedia.se" className="hover:text-white">info@auroramedia.se</a>
            </div>
          </div>

          {FOOTER_COLUMNS.map(column => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-sm font-bold mb-4 text-white">{column.title}</h2>
              <ul className="space-y-2.5">
                {column.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-white/15 mt-12 pt-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
            <span className="text-white/65">Byråer i</span>
            {FOOTER_CITY_LINKS.map(city => <Link key={city.href} to={city.href} className="hover:text-white transition-colors">{city.label}</Link>)}
            <Link to="/stader" className="font-semibold text-white/80 hover:text-white">Alla städer →</Link>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/65">
            {FOOTER_LEGAL_LINKS.map(link => <Link key={link.href} to={link.href} className="hover:text-white">{link.label}</Link>)}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
