import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import NotificationBell from '@/components/NotificationBell'
import ThemeToggle from '@/components/ThemeToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getCategoryNavLinks } from '@/lib/seoData'

const categoryLinks = getCategoryNavLinks()

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const { isAuthenticated, profile, isBuyer, isSupplier, isAdmin, signOut, isOnTrial, trialLeadsLeft } = useAuth()

  const dashboardLink = isAdmin ? '/admin' : isSupplier ? '/dashboard/supplier' : '/dashboard/buyer'
  const initials = (profile?.full_name || 'U').slice(0, 2).toUpperCase()

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', mobileOpen)
    return () => document.body.classList.remove('overflow-hidden')
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="container flex min-h-16 items-center justify-between gap-3 py-2">
          <Logo />

          <nav className="hidden items-center gap-6 md:flex" aria-label="Huvudnavigation">
            <a href="/#hur-det-fungerar" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Så fungerar det
            </a>

            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                className="flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-expanded={servicesOpen}
              >
                Tjänster <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {servicesOpen && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
                  <div className="grid w-[520px] grid-cols-2 gap-1 rounded-2xl border bg-white p-4 shadow-xl dark:bg-card">
                    {categoryLinks.map(link => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setServicesOpen(false)}
                        className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/byraer" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Utforska byråer
            </Link>

            <Link to="/registrera/byra" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              För byråer
            </Link>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {isSupplier && isOnTrial && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> Provperiod: {trialLeadsLeft} kvar
                  </span>
                )}
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Administration</Link></DropdownMenuItem>}
                    {isAdmin && <DropdownMenuItem asChild><Link to="/admin/uppdrag">Sök uppdrag</Link></DropdownMenuItem>}
                    {!isAdmin && <DropdownMenuItem asChild><Link to={dashboardLink}>Översikt</Link></DropdownMenuItem>}
                    <DropdownMenuItem asChild><Link to={isAdmin ? '/admin/installningar' : isBuyer ? '/dashboard/buyer/profil' : '/dashboard/supplier/profil'}>Min profil</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-destructive">Logga ut</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/logga-in"><Button variant="ghost" size="sm" className="min-h-11">Logga in</Button></Link>
                <Link to="/publicera">
                  <Button size="sm" className="min-h-11 rounded-xl bg-brand-orange px-5 text-white shadow-md hover:bg-brand-orange-hover">
                    Beskriv ditt uppdrag
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="relative z-[60] inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-foreground active:bg-muted md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-[9999] overflow-y-auto overscroll-contain border-t bg-background md:hidden">
          <nav className="flex flex-col gap-2 p-4 pb-[calc(2rem+env(safe-area-inset-bottom))]" aria-label="Mobilnavigation">
            <a href="/#hur-det-fungerar" className="flex min-h-12 items-center rounded-xl px-3 text-lg font-medium text-foreground active:bg-muted" onClick={closeMobile}>
              Så fungerar det
            </a>
            <Link to="/byraer" className="flex min-h-12 items-center rounded-xl px-3 text-lg font-medium text-foreground active:bg-muted" onClick={closeMobile}>
              Utforska byråer
            </Link>
            <Link to="/registrera/byra" className="flex min-h-12 items-center rounded-xl px-3 text-lg font-medium text-foreground active:bg-muted" onClick={closeMobile}>
              För byråer
            </Link>
            <Link to="/om-oss" className="flex min-h-12 items-center rounded-xl px-3 text-lg font-medium text-foreground active:bg-muted" onClick={closeMobile}>
              Om Updro
            </Link>

            <p className="mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tjänster</p>
            <div className="grid grid-cols-1 gap-1">
              {categoryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex min-h-11 items-center rounded-xl px-3 text-base text-foreground active:bg-muted"
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t pt-4">
              <div className="flex min-h-12 items-center justify-between px-3">
                <span className="text-sm text-muted-foreground">Utseende</span>
                <ThemeToggle />
              </div>
              {isAuthenticated ? (
                <>
                  <Link to={dashboardLink} onClick={closeMobile}>
                    <Button variant="outline" className="min-h-12 w-full rounded-xl">Översikt</Button>
                  </Link>
                  <Button variant="ghost" className="min-h-12 w-full rounded-xl text-destructive" onClick={() => { signOut(); closeMobile() }}>Logga ut</Button>
                </>
              ) : (
                <>
                  <Link to="/logga-in" onClick={closeMobile}>
                    <Button variant="outline" className="min-h-12 w-full rounded-xl">Logga in</Button>
                  </Link>
                  <Link to="/publicera" onClick={closeMobile}>
                    <Button className="min-h-12 w-full rounded-xl bg-brand-orange text-white hover:bg-brand-orange-hover">
                      Beskriv ditt uppdrag
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
