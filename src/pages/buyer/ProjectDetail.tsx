import { useCallback, useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { Check, X, Phone, Mail, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BUDGET_LABELS, START_TIME_LABELS, CATEGORY_STYLES } from '@/lib/constants'
import { timeAgo, formatPrice } from '@/lib/dateUtils'
import { toast } from 'sonner'
import { decideProjectOffer } from '@/lib/marketplaceActions'
import { PAYMENT_PLAN_LABELS } from '@/lib/agreements'
import OfferAttachment from '@/components/shared/OfferAttachment'
import { trackAgencySelected } from '@/lib/analytics'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ProjectStepper from '@/components/shared/ProjectStepper'
import BuyerDecisionCard from '@/components/shared/BuyerDecisionCard'
import RatingDisplay from '@/components/shared/RatingDisplay'
import VerificationChecklist from '@/components/shared/VerificationChecklist'
import ProjectOutcomeCard from '@/components/buyer/ProjectOutcomeCard'
import AgreementPanel from '@/components/agreements/AgreementPanel'
import ReviewCard from '@/components/buyer/ReviewCard'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<any>(null)
  const [offers, setOffers] = useState<any[]>([])
  const [confirmOffer, setConfirmOffer] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const offersRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deciding, setDeciding] = useState(false)
  const decidingRef = useRef(false)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!id) return
    const current = ++requestId.current
    setLoading(true)
    setLoadError(null)
    try {
      const [projectResult, offerResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.rpc('get_buyer_project_offers', { p_project_id: id }),
      ])
      if (projectResult.error) throw projectResult.error
      if (offerResult.error) throw offerResult.error
      if (!Array.isArray(offerResult.data)) throw new Error('Offertlistan kunde inte läsas.')
      if (current !== requestId.current) return
      setProject(projectResult.data)
      setOffers(offerResult.data)
    } catch {
      if (current === requestId.current) setLoadError('Kunde inte läsa uppdraget och dess offerter. Försök igen.')
    } finally {
      if (current === requestId.current) setLoading(false)
    }
  }, [id])

  const cancelPendingLoad = useCallback(() => { requestId.current++ }, [])
  useEffect(() => { setProject(null); setOffers([]); void load(); return cancelPendingLoad }, [load, cancelPendingLoad])

  const handleDecision = async (offerId: string, decision: 'accepted' | 'declined') => {
    if (decidingRef.current) return
    decidingRef.current = true
    setDeciding(true)
    try {
      await decideProjectOffer(offerId, decision)
      setOffers(previous => previous.map(offer => offer.id === offerId ? { ...offer, status: decision }
        : decision === 'accepted' && offer.status === 'pending' ? { ...offer, status: 'declined' } : offer))
      if (decision === 'accepted') {
        setProject((previous: any) => ({ ...previous, status: 'closed' }))
        try { trackAgencySelected(project?.category, project?.city) } catch { /* Analytics must not block the saved decision. */ }
      }
      setConfirmOffer(null)
      toast.success(decision === 'accepted' ? 'Offert accepterad. Granska och skapa ert samarbetsavtal.' : 'Offerten är avböjd. Byrån har fått en notis.')
      await load()
    } catch (cause) {
      toast.error((cause as { message?: string })?.message || 'Beslutet kunde inte sparas. Försök igen.')
    } finally {
      decidingRef.current = false
      setDeciding(false)
    }
  }

  const scrollToOffers = () => {
    offersRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleProjectClosed = () => {
    setProject((prev: any) => prev ? { ...prev, status: 'closed' } : prev)
    setOffers(prev => prev.map(o => o.status === 'pending' ? { ...o, status: 'declined' } : o))
  }

  const handleDeleteProject = async () => {
    if (!id) return
    setDeleting(true)
    const { error } = await supabase.from('projects').delete().eq('id', id).select('id').single()
    setDeleting(false)
    if (error) {
      toast.error(error.message || 'Kunde inte ta bort uppdraget')
    } else {
      toast.success('Uppdraget har tagits bort')
      navigate('/dashboard/buyer/uppdrag')
    }
    setShowDeleteConfirm(false)
  }

  if (loading && !project) return <div className="animate-pulse h-40 bg-muted rounded-xl" />
  if (!project) return <div role="alert" className="rounded-xl border p-6"><p>{loadError || 'Uppdraget kunde inte hittas.'}</p><Button onClick={load} className="mt-3">Försök igen</Button></div>

  return (
    <>
      <div className="max-w-5xl">
        {loadError && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 p-4"><p>{loadError}</p><Button variant="outline" onClick={load} disabled={loading} className="mt-2">Försök igen</Button></div>}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold mb-2 ${CATEGORY_STYLES[project.category] || ''}`}>{project.category}</span>
                  <h1 className="font-display text-2xl font-bold">{project.title}</h1>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={offers.some(offer => offer.status === 'accepted')}
                  aria-label="Ta bort uppdrag"
                  className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title={offers.some(offer => offer.status === 'accepted') ? 'Uppdrag med accepterad offert bevaras för er överenskommelse' : 'Ta bort uppdrag'}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span>{BUDGET_LABELS[project.budget_range] || 'Ej angiven'}</span>
                <span>{START_TIME_LABELS[project.start_time] || ''}</span>
                <span>{project.city}</span>
                <span>{timeAgo(project.created_at)}</span>
              </div>
            </div>

            <div className="bg-card rounded-xl border p-5 mb-8">
              <h3 className="font-semibold mb-2">Beskrivning</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Decision card */}
            <BuyerDecisionCard
              project={project}
              offers={offers}
              onScrollToOffers={scrollToOffers}
              onProjectClosed={handleProjectClosed}
            />

            {id && (
              <ProjectOutcomeCard
                projectId={id}
                buyerId={project.buyer_id}
                offers={offers}
              />
            )}


            <div ref={offersRef}>
              <h2 className="font-display text-lg font-semibold mb-4">
                Intresserade byråer ({offers.length})
              </h2>

              {offers.length === 0 ? (
                <div className="bg-card rounded-xl border p-6 text-center">
                  <p className="text-muted-foreground">Du har inte fått någon offert ännu. När en byrå svarar kan du jämföra förslag, pris och tidsplan här.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {offers.map(offer => {
                    const sp = offer.supplier_profiles
                    return (
                      <div key={offer.id} className="bg-card rounded-xl border p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{offer.profiles?.company_name || offer.profiles?.full_name || 'Byrå'}</h3>
                            <p className="text-xs text-muted-foreground">{offer.profiles?.city} · {timeAgo(offer.created_at)}</p>
                            {sp && (
                              <div className="mt-2">
                                <RatingDisplay avgRating={sp.avg_rating || 0} reviewCount={sp.review_count || 0} />
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-semibold rounded-full px-2 py-1 ${
                            offer.status === 'accepted' ? 'bg-accent/10 text-accent' :
                            offer.status === 'declined' ? 'bg-destructive/10 text-destructive' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {offer.status === 'pending' ? 'Ny' : offer.status === 'accepted' ? 'Accepterad' : 'Avböjd'}
                          </span>
                        </div>

                        {/* Verification checklist */}
                        {sp && (
                          <VerificationChecklist
                            isVerified={sp.is_verified}
                            hasFskatt={sp.has_fskatt}
                            creditCheckPassed={sp.credit_check_passed}
                            completedProjects={sp.completed_projects}
                          />
                        )}

                        <h4 className="font-medium mt-3">{offer.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{offer.description}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
                          <span className="font-bold text-lg text-primary">{formatPrice(offer.price)}{offer.payment_plan === 'hourly' ? '/timme' : ''}<span className="ml-1 text-xs font-normal text-muted-foreground">exkl. moms</span></span>
                          {offer.delivery_weeks && <span className="text-muted-foreground">{offer.delivery_weeks} veckor</span>}
                          {offer.payment_plan && <span className="text-muted-foreground capitalize">{PAYMENT_PLAN_LABELS[offer.payment_plan] || offer.payment_plan}</span>}
                        </div>

                        <OfferAttachment path={offer.attachment_url} />

                        {/* Contact info when accepted */}
                        {offer.status === 'accepted' && offer.profiles && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Kontaktuppgifter</p>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary border-2 border-accent">
                                {(sp?.contact_name || offer.profiles.full_name || '?')[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">
                                  {sp?.contact_name || offer.profiles.full_name}
                                </p>
                                {(sp?.contact_phone || offer.profiles.phone) && (
                                  <a
                                    href={`tel:${sp?.contact_phone || offer.profiles.phone}`}
                                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                                  >
                                    <Phone size={12} />
                                    {sp?.contact_phone || offer.profiles.phone}
                                  </a>
                                )}
                                {offer.profiles.email && <a
                                  href={`mailto:${sp?.contact_email || offer.profiles.email}`}
                                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  <Mail size={12} />
                                  {sp?.contact_email || offer.profiles.email}
                                </a>}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4 flex-wrap">
                          {offer.status === 'pending' && (
                            <>
                              <Button size="sm" disabled={deciding || loading || !!loadError} onClick={() => setConfirmOffer(offer)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Check className="mr-1 h-3 w-3" /> Acceptera
                              </Button>
                              <Button size="sm" variant="outline" disabled={deciding || loading || !!loadError} onClick={() => handleDecision(offer.id, 'declined')}>
                                <X className="mr-1 h-3 w-3" /> Avböj
                              </Button>
                            </>
                          )}
                          {(offer.status === 'pending' || offer.status === 'accepted') && (
                            <Link to={`/dashboard/buyer/chatt?project=${id}&user=${offer.supplier_id}`}>
                              <Button size="sm" variant={offer.status === 'accepted' ? 'default' : 'outline'}>
                                💬 Chatta med byrån
                              </Button>
                            </Link>
                          )}
                        </div>

                        {offer.status === 'accepted' && id && (
                          <>
                            <AgreementPanel projectId={id} offerId={offer.id} role="buyer" />
                            <ReviewCard projectId={id} />
                          </>
                        )}

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Stepper */}
          <div className="hidden md:block">
            <div className="sticky top-24">
              <ProjectStepper
                project={project}
                offers={offers}
                onScrollToOffers={scrollToOffers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirm accept dialog */}
      <Dialog open={!!confirmOffer} onOpenChange={() => { if (!deciding) setConfirmOffer(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acceptera offert?</DialogTitle>
            <DialogDescription>
              Acceptera offert från {confirmOffer?.profiles?.company_name || confirmOffer?.profiles?.full_name}?
              Övriga offerter markeras som avböjda.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" disabled={deciding} onClick={() => setConfirmOffer(null)}>Avbryt</Button>
            <Button disabled={deciding || !confirmOffer} onClick={() => handleDecision(confirmOffer.id, 'accepted')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {deciding ? 'Sparar beslut…' : 'Acceptera offerten'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort uppdrag?</DialogTitle>
            <DialogDescription>
              Vill du verkligen ta bort "{project?.title}"? Alla tillhörande offerter tas också bort. Detta kan inte ångras.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Avbryt</Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting ? 'Tar bort…' : 'Ta bort'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProjectDetail
