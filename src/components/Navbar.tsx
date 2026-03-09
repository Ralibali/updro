import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import NotificationBell from '@/components/NotificationBell'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getCategoryNavLinks } from '@/lib/seoData'

const categoryLinks = getCategoryNavLinks()

const navLinks = [
  { label: 'Hur det fungerar', href: '/#hur-det-fungerar' },
  { label: 'Priser', href: '/priser' },
]

const extraLinks = [
  { label: 'Jämför byråer', href: '/jamfor' },
  { label: 'Städer', href: '/stader' },
  { label: 'Artiklar', href: '/artiklar' },
  { label: 'Verktyg', href: '/verktyg' },
]

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const { isAuthenticated, profile, isBuyer, isSupplier, isAdmin, signOut, isOnTrial, trialLeadsLeft } = useAuth()

  const dashboardLink = isAdmin ? '/admin' : isSupplier ? '/dashboard/supplier' : '/dashboard/buyer'
  const initials = (profile?.full_name || 'U').slice(0, 2).toUpperCase()

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-6">
            {/* Services mega menu */}
            <div className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tjänster <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-card border rounded-xl shadow-lg p-4 w-[520px] grid grid-cols-2 gap-1">
                    {categoryLinks.map(link => (
                      <Link key={link.href} to={link.href}
                        onClick={() => setServicesOpen(false)}
                        className="text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/byraer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Hitta byråer
            </Link>

            <Link to="/jamfor" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Jämför
            </Link>

            {navLinks.map((link) => (
              link.href.includes('#') ? (
                <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isSupplier && isOnTrial && (
                  <span className="text-xs font-semibold bg-accent/10 text-accent rounded-full px-3 py-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Trial: {trialLeadsLeft} leads
                  </span>
                )}
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild><Link to={dashboardLink}>Dashboard</Link></DropdownMenuItem>
                    {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>}
                    <DropdownMenuItem asChild><Link to={isAdmin ? '/dashboard/buyer/profil' : isBuyer ? '/dashboard/buyer/profil' : '/dashboard/supplier/profil'}>Min profil</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-destructive">Logga ut</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/logga-in"><Button variant="ghost" size="sm">Logga in</Button></Link>
                <Link to="/registrera/byra">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 shadow-blue">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Prova gratis
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-foreground relative z-[60]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Meny">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[9999] bg-background overflow-y-auto">
          <nav className="flex flex-col p-6 gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tjänster</p>
            <div className="grid grid-cols-2 gap-2">
              {categoryLinks.map((link) => (
                <Link key={link.href} to={link.href} className="text-sm text-foreground py-1.5" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t pt-4 mt-2">
              <Link to="/byraer" className="text-lg font-medium text-foreground py-2 block" onClick={() => setMobileOpen(false)}>
                Hitta byråer
              </Link>
              {extraLinks.map((link) => (
                <Link key={link.href} to={link.href} className="text-lg font-medium text-foreground py-2 block" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} className="text-lg font-medium text-foreground py-2 block" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t pt-4 mt-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardLink} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  <Button variant="ghost" className="w-full text-destructive" onClick={() => { signOut(); setMobileOpen(false) }}>Logga ut</Button>
                </>
              ) : (
                <>
                  <Link to="/logga-in" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Logga in</Button>
                  </Link>
                  <Link to="/registrera/byra" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Sparkles className="mr-1.5 h-4 w-4" /> Prova gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}

export default Navbar
