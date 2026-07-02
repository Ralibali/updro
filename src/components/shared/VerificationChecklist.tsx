import { CheckCircle, ShieldCheck } from 'lucide-react'

interface VerificationChecklistProps {
  isVerified?: boolean
  hasFskatt?: boolean
  creditCheckPassed?: boolean
  completedProjects?: number
  verifiedLevel?: string
  companyStatus?: string
}

const VerificationChecklist = ({ isVerified, hasFskatt, creditCheckPassed, completedProjects, verifiedLevel, companyStatus }: VerificationChecklistProps) => {
  const companyVerified = verifiedLevel === 'verified' || verifiedLevel === 'premium'
  const hasAny = companyVerified || isVerified || hasFskatt || creditCheckPassed || Boolean(completedProjects)
  if (!hasAny) return null

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {companyVerified && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700" title="Organisationsnummer, skatteuppgifter och bolagsstatus har kontrollerats av Updro">
          <ShieldCheck size={15} className="shrink-0 text-emerald-500" />
          Företagsuppgifter kontrollerade
        </div>
      )}
      {companyStatus === 'active' && <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle size={14} className="shrink-0 text-emerald-500" />Aktivt bolag</div>}
      {hasFskatt && <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle size={14} className="shrink-0 text-emerald-500" />F-skatt registrerad</div>}
      {creditCheckPassed && <div className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle size={14} className="shrink-0 text-emerald-500" />Kreditkontroll genomförd</div>}
      {Boolean(completedProjects) && <div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle size={14} className="shrink-0" />{completedProjects} genomförda uppdrag via Updro</div>}
    </div>
  )
}

export default VerificationChecklist
