import { ShieldCheck, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import UpdroSeal from '@/components/shared/UpdroSeal'

interface VerificationBadgesProps {
  isBankIdVerified?: boolean
  isPhoneVerified?: boolean
  isCompanyVerified?: boolean
  className?: string
  showSeal?: boolean
}

const VerificationBadges = ({
  isBankIdVerified,
  isPhoneVerified,
  isCompanyVerified,
  className,
  showSeal = false,
}: VerificationBadgesProps) => {
  if (!isBankIdVerified && !isPhoneVerified && !isCompanyVerified) return null

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {showSeal && isCompanyVerified && <UpdroSeal size="sm" />}
      {isCompanyVerified && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          Bolagsverket-verifierad
        </span>
      )}
      {isBankIdVerified && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-accent/15 text-accent-foreground border border-accent/30 rounded-full px-2 py-0.5">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          BankID-verifierad
        </span>
      )}
      {isPhoneVerified && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5">
          <Smartphone className="h-3 w-3" aria-hidden="true" />
          Mobilverifierad
        </span>
      )}
    </div>
  )
}

export default VerificationBadges
