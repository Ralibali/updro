import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'

const navLinks = [
  { label: 'Hitta byråer', href: '/byraer' },
  { label: 'Hur det fungerar', href: '/#hur-det-fungerar' },
  { label: 'Priser', href: '/priser' },
]

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/logga-in">
            <Button variant="ghost" size="sm">Logga in</Button>
          </Link>
          <Link to="/registrera/byra">
            <Button size="sm" className="bg-brand-blue hover:bg-brand-blue-hover text-primary-foreground rounded-full px-5 shadow-blue">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Prova gratis
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-card">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-lg font-medium text-foreground py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-4 mt-4 flex flex-col gap-3">
              <Link to="/logga-in" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Logga in</Button>
              </Link>
              <Link to="/registrera/byra" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-brand-blue hover:bg-brand-blue-hover text-primary-foreground">
                  <Zap className="mr-1.5 h-4 w-4" />
                  Prova gratis
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
