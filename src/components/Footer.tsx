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
      { label: 'Integritetspolicy', href: '/integritetspolicy' },
      { label: 'Villkor', href: '/villkor' },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo size="md" />
            <p className="mt-3 text-sm text-muted-foreground">
              Kvalitetsuppdrag till din byrå – prova gratis i 14 dagar
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

        <div className="border-t mt-12 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Updro.se – Aurora Media AB (559272-0220)
        </div>
      </div>
    </footer>
  )
}

export default Footer
