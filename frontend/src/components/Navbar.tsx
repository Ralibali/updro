import { useState } from 'react'
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
import { motion, AnimatePresence } from 'framer-motion'

const categoryLinks = getCategoryNavLinks()

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const { isAuthenticated, profile, isBuyer, isSupplier, isAdmin, signOut, isOnTrial, trialLeadsLeft } = useAuth()

  const dashboardLink = isAdmin ? '/admin' : isSupplier ? '/dashboard/supplier' : '/dashboard/buyer'
  const initials = (profile?.full_name || 'U').slice(0, 2).toUpperCase()

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-background/90 border-b border-border/50"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="container flex h-16 items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/byraer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Hitta byrå
            </Link>

            {/* Services mega menu */}
            <div className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Kategorier <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white dark:bg-card border rounded-xl shadow-lg p-4 w-[520px] grid grid-cols-2 gap-1">
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

            <Link to="/registrera/byra" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              För byråer
            </Link>

            <Link to="/om-oss" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Om Updro
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {isSupplier && isOnTrial && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary rounded-full px-3 py-1 flex items-center gap-1">
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
                    {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>}
                    {isAdmin && <DropdownMenuItem asChild><Link to="/admin/uppdrag">Sök uppdrag</Link></DropdownMenuItem>}
                    {!isAdmin && <DropdownMenuItem asChild><Link to={dashboardLink}>Dashboard</Link></DropdownMenuItem>}
                    <DropdownMenuItem asChild><Link to={isAdmin ? '/admin/installningar' : isBuyer ? '/dashboard/buyer/profil' : '/dashboard/supplier/profil'}>Min profil</Link></DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut} className="text-destructive">Logga ut</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/logga-in"><Button variant="ghost" size="sm">Logga in</Button></Link>
                <Link to="/publicera">
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Button size="sm" className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl px-5 shadow-md">
                      Starta förfrågan
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-foreground relative z-[60]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Meny">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[9999] bg-white dark:bg-background overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col p-6 gap-4">
              <Link to="/byraer" className="text-lg font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
                Hitta byrå
              </Link>
              <Link to="/registrera/byra" className="text-lg font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
                För byråer
              </Link>
              <Link to="/om-oss" className="text-lg font-medium text-foreground py-2" onClick={() => setMobileOpen(false)}>
                Om Updro
              </Link>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">Kategorier</p>
              <div className="grid grid-cols-2 gap-2">
                {categoryLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="text-sm text-foreground py-1.5" onClick={() => setMobileOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tema</span>
                  <ThemeToggle />
                </div>
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
                    <Link to="/publicera" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white">
                        Starta förfrågan
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
