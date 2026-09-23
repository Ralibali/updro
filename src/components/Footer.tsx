import { Link } from 'react-router-dom'
import Logo from '@/components/Logo'
import {
  FOOTER_COLUMNS,
  FOOTER_CITY_LINKS,
  FOOTER_LEGAL_LINKS
} from '@/lib/footerLinks'
export default function Footer() {
  return (
    <footer className="updro-footer" role="contentinfo">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Ett tydligare sätt att hitta och samarbeta med digitala byråer.
            </p>
            <div className="mt-6 space-y-1.5 text-xs text-muted-foreground">
              <p>Aurora Media AB · Org.nr 559272-0220</p>
              <a
                href="mailto:info@auroramedia.se"
                className="inline-block text-sm text-primary hover:underline"
              >
                info@auroramedia.se
              </a>
            </div>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-5 text-sm font-semibold">{column.title}</h2>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 border-t pt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span>Byråer i</span>
          {FOOTER_CITY_LINKS.map((city) => (
            <Link key={city.href} to={city.href} className="hover:text-primary">
              {city.label}
            </Link>
          ))}
          <Link to="/stader" className="text-primary">
            Alla städer
          </Link>
        </div>
        <div className="mt-6 pt-6 border-t flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Updro · Aurora Media AB</span>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
