import { Link, useLocation } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { cn } from '@/lib/utils'
import { useNoindex } from '@/hooks/useNoindex'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { MoreHorizontal, HelpCircle, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  ctaButton?: { label: string; href: string }
}

const isActivePath = (pathname: string, href: string) => (
  pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
)

const DashboardLayout = ({ children, navItems, ctaButton }: DashboardLayoutProps) => {
  useNoindex()
  const location = useLocation()
  // Select the most specific route so Overview is not active on every child page.
  const activeHref = navItems.filter(item => isActivePath(location.pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
  const primaryMobileItems = navItems.slice(0, 4)
  const extraMobileItems = navItems.slice(4)
  const extraActive = extraMobileItems.some(item => item.href === activeHref)

  return (
    <div className="updro-workspace min-h-screen flex flex-col">
      <Navbar />
      <div className="updro-workspace-body">
        <aside className="updro-workspace-sidebar">
          <div className="px-3 py-3 mb-2">
            <p className="text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground">Min arbetsyta</p><p className="mt-2 text-lg font-medium text-foreground">{location.pathname.startsWith('/dashboard/supplier') ? 'Byråkontot' : location.pathname.startsWith('/admin') ? 'Administration' : 'Dina projekt'}</p>
          </div>
          {navItems.map(item => {
            const active = item.href === activeHref
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  active ? 'bg-sidebar-accent text-sidebar-accent-foreground ' : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">{item.badge}</span>
                )}
              </Link>
            )
          })}
          <div className="mt-auto pt-8 space-y-4">
            {ctaButton && <Button asChild className="w-full"><Link to={ctaButton.href}>{ctaButton.label}</Link></Button>}
            <Link to="/support" className="flex items-center gap-2 px-3 text-sm text-muted-foreground hover:text-primary"><HelpCircle className="h-4 w-4" /> Hjälp och kontakt <ArrowUpRight className="ml-auto h-4 w-4" /></Link>
            <p className="px-3 text-xs text-muted-foreground">Updro · Aurora Media AB</p>
          </div>
        </aside>

        <main className="updro-workspace-main">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50" aria-label="Dashboardnavigation">
        {primaryMobileItems.map(item => {
          const active = item.href === activeHref
          return (
            <Link
              key={item.href}
              to={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex flex-col items-center justify-center gap-1 rounded-xl text-xs px-1 py-2 min-h-12 min-w-14', active ? 'bg-accent/10 text-accent' : 'text-muted-foreground')}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label.split(' ')[0]}</span>
              {item.badge && item.badge > 0 ? (
                <span className="absolute translate-x-3 -translate-y-1 bg-primary text-primary-foreground text-[9px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">{item.badge}</span>
              ) : null}
            </Link>
          )
        })}

        {extraMobileItems.length > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <button className={cn('flex flex-col items-center justify-center gap-1 rounded-xl text-xs px-1 py-2 min-h-12 min-w-14', extraActive ? 'text-primary' : 'text-muted-foreground')}>
                <MoreHorizontal className="h-5 w-5" />
                <span>Mer</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl pb-8">
              <SheetTitle>Min arbetsyta</SheetTitle>
              <SheetDescription>Fler sidor och inställningar för ditt konto.</SheetDescription>
              <div className="grid grid-cols-3 gap-2 pt-4">
                {extraMobileItems.map(item => {
                  const active = item.href === activeHref
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-colors',
                        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-center">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <span className="absolute right-2 top-2 bg-primary text-primary-foreground text-[9px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center">{item.badge}</span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </div>
  )
}

export default DashboardLayout
