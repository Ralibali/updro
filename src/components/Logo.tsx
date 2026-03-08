import { Flame } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const Logo = ({ size = 'md', className = '' }: LogoProps) => {
  return (
    <a href="/" className={`flex items-center gap-1.5 font-display font-bold ${sizes[size]} ${className}`}>
      <Flame className="h-5 w-5 text-accent fill-accent" />
      <span className="text-foreground tracking-tight">updro</span>
    </a>
  )
}

export default Logo
