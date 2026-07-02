import { motion, useReducedMotion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpdroSealProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'verified' | 'pending'
  tone?: 'dark' | 'light'
  className?: string
  label?: string
}

const SIZE_PX = { sm: 44, md: 72, lg: 112 } as const

const UpdroSeal = ({
  size = 'md',
  variant = 'verified',
  tone = 'dark',
  className,
  label,
}: UpdroSealProps) => {
  const px = SIZE_PX[size]
  const reduce = useReducedMotion()
  const isVerified = variant === 'verified'
  const stroke = tone === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary-foreground))'
  const inkFill = tone === 'dark' ? 'hsl(var(--primary))' : 'hsl(var(--primary-foreground))'
  const inkText = tone === 'dark' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary))'
  const mutedStroke = tone === 'dark' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted))'
  const ringColor = isVerified ? stroke : mutedStroke
  const dash = isVerified ? undefined : '4 3'
  const ariaLabel = label || (isVerified ? 'Verifierad byrå' : 'Verifiering pågår')

  const initial = reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.15 }
  const animate = { opacity: 1, scale: 1 }
  const transition = reduce ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' as const }

  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      initial={initial}
      animate={animate}
      transition={transition}
      className={cn('inline-flex shrink-0', className)}
      style={{ width: px, height: px }}
    >
      <svg viewBox="0 0 120 120" width={px} height={px} aria-hidden="true">
        <defs>
          <path
            id={`seal-arc-${size}-${variant}`}
            d="M 60,60 m -48,0 a 48,48 0 1,1 96,0 a 48,48 0 1,1 -96,0"
            fill="none"
          />
        </defs>
        <circle cx="60" cy="60" r="55" fill="none" stroke={ringColor} strokeWidth="1.25" strokeDasharray={dash} opacity="0.7" />
        <circle cx="60" cy="60" r="48" fill="none" stroke={ringColor} strokeWidth="1.25" strokeDasharray={dash} />
        <text
          fill={ringColor}
          style={{ fontFamily: '"Schibsted Grotesk", system-ui, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em' }}
        >
          <textPath href={`#seal-arc-${size}-${variant}`} startOffset="0">
            {isVerified
              ? 'VERIFIERAD · UPDRO · BOLAGSVERKET · F-SKATT · '
              : 'GRANSKAS · UPDRO · GRANSKAS · '}
          </textPath>
        </text>
        <circle cx="60" cy="60" r="28" fill={isVerified ? inkFill : 'transparent'} stroke={ringColor} strokeWidth="1.25" strokeDasharray={dash} />
        {isVerified ? (
          <g transform="translate(60 60)">
            <Check x={-12} y={-12} width={24} height={24} stroke={inkText} strokeWidth={3} />
          </g>
        ) : (
          <text
            x="60"
            y="65"
            textAnchor="middle"
            fill={ringColor}
            style={{ fontFamily: '"Schibsted Grotesk", system-ui, sans-serif', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}
          >
            PENDING
          </text>
        )}
      </svg>
    </motion.div>
  )
}

export default UpdroSeal
