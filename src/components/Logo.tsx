import { Zap } from 'lucide-react'

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
    <a href="/" className={`flex items-center gap-1 font-display font-extrabold ${sizes[size]} ${className}`}>
      <Zap className="h-5 w-5 text-brand-blue fill-brand-blue" />
      <span className="text-foreground">upd</span>
      <span className="text-brand-blue">ro</span>
    </a>
  )
}

export default Logo
