import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProjectStep = 'created' | 'published' | 'choosing' | 'agreement' | 'review' | 'closed'

const STEPS = [
  { id: 'created' as const, label: 'Uppdrag sparat', description: 'Ditt uppdrag är sparat. När det publiceras kan byråer lämna offert.', cta: false },
  { id: 'published' as const, label: 'Väntar på offerter', description: 'Uppdraget är publicerat. Du ser byråernas förslag här när de svarar.', cta: false },
  { id: 'choosing' as const, label: 'Jämför och välj byrå', description: 'Jämför omfattning, pris och tidsplan innan du accepterar en offert.', cta: true },
  { id: 'agreement' as const, label: 'Avtal och uppstart', description: 'Granska samarbetsavtalet och kom överens om uppstarten med byrån.', cta: true },
  { id: 'review' as const, label: 'Lämna omdöme', description: 'Uppdraget är markerat som slutfört. Berätta hur samarbetet fungerade.', cta: true },
]
const STEP_ORDER: ProjectStep[] = ['created', 'published', 'choosing', 'agreement', 'review']
const getStepIndex = (step: ProjectStep) => STEP_ORDER.indexOf(step)

// eslint-disable-next-line react-refresh/only-export-components
export function calculateCurrentStep(project: any, offers: any[]): ProjectStep {
  if (project.status === 'completed') return 'review'
  if (offers.some(offer => offer.status === 'accepted')) return 'agreement'
  if (offers.some(offer => offer.status === 'pending')) return 'choosing'
  if (project.status === 'closed' || project.status === 'rejected') return 'closed'
  if (project.status === 'active') return 'published'
  return 'created'
}

interface ProjectStepperProps {
  project: any
  offers: any[]
  compact?: boolean
  onScrollToOffers?: () => void
  onOpenReview?: () => void
}

const ProjectStepper = ({ project, offers, compact = false, onScrollToOffers, onOpenReview }: ProjectStepperProps) => {
  const currentStep = calculateCurrentStep(project, offers)
  const currentIndex = getStepIndex(currentStep)

  const stepsToShow = compact ? STEPS.filter((_, i) => {
    // In compact: show completed + current + next
    return i >= currentIndex - 1 && i <= currentIndex + 1
  }) : STEPS

  if (currentStep === 'closed') return <div className="rounded-2xl border bg-card p-6"><h3 className="font-semibold">Uppdraget tar inte emot fler offerter</h3><p className="mt-2 text-sm text-muted-foreground">Ingen offert är accepterad. Du kan läsa tidigare förslag här.</p></div>

  return (
    <div className="bg-card border rounded-2xl p-6">
      <h3 className="font-semibold text-foreground mb-6">
        Så funkar Updro
      </h3>
      <div className="flex flex-col gap-0">
        {stepsToShow.map((step, displayIndex) => {
          const actualIndex = STEPS.indexOf(step)
          const isCompleted = currentIndex > actualIndex
          const isCurrent = currentStep === step.id
          const isFuture = currentIndex < actualIndex

          return (
            <div key={step.id} className="flex gap-4">
              {/* Icon + vertical line */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                  ${isCompleted ? 'bg-accent text-accent-foreground' : ''}
                  ${isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
                  ${isFuture ? 'bg-muted text-muted-foreground' : ''}
                `}>
                  {isCompleted
                    ? <Check size={16} />
                    : <span className="text-xs font-bold">{actualIndex + 1}</span>
                  }
                </div>
                {displayIndex < stepsToShow.length - 1 && (
                  <div className={`w-0.5 h-8 mt-1 ${
                    isCompleted ? 'bg-accent' : 'bg-border'
                  }`} />
                )}
              </div>
              {/* Text + CTA */}
              <div className="pb-6">
                <p className={`font-semibold text-sm ${
                  isFuture ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
                {isCurrent && step.cta && (step.id === 'choosing' || step.id === 'agreement') && onScrollToOffers && (
                  <Button
                    size="sm"
                    onClick={onScrollToOffers}
                    className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    {step.id === 'agreement' ? 'Granska avtalet →' : 'Jämför offerter →'}
                  </Button>
                )}
                {isCurrent && step.cta && step.id === 'review' && onOpenReview && (
                  <Button
                    size="sm"
                    onClick={onOpenReview}
                    className="mt-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                  >
                    Lämna omdöme →
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProjectStepper
