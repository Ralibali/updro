import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' }
export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap font-display font-semibold ${sizes[size]} ${className}`}
      aria-label="Updro, startsida"
    >
      <span aria-hidden="true" className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="M6 6v9a6 6 0 0 0 12 0V6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" /></svg><ArrowUpRight className="absolute -right-1 -top-1 h-[18px] w-[18px] rounded border-2 border-background bg-primary" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="tracking-[-0.06em] text-foreground">
        updro<span aria-hidden="true" className="text-primary">.</span>
      </span>
    </Link>
  )
}
