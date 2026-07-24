import { useEffect, useState } from 'react'
import { Check, Copy, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { buildReferralLink, REFERRAL_BONUS_CREDITS, REFERRAL_NEW_SUPPLIER_BONUS } from '@/lib/campaign'
import { trackReferralLinkCopied } from '@/lib/analytics'

/**
 * Värvningskort i byrådashboarden. Varje byrå har en unik kod; när en ny
 * byrå registrerar sig via länken får båda sidor bonus-leads (sätts
 * server-side i create-account).
 */
const ReferralCard = () => {
  const { supplierProfile } = useAuth()
  const referralCode = supplierProfile?.referral_code ?? null
  const [referredCount, setReferredCount] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!referralCode) return
    let isMounted = true
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('supplier_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', referralCode)
      if (!error && isMounted) setReferredCount(count ?? 0)
    }
    fetchCount()
    return () => { isMounted = false }
  }, [referralCode])

  if (!referralCode) return null

  const link = buildReferralLink(referralCode)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      trackReferralLinkCopied()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Kunde inte kopiera – markera länken manuellt.')
    }
  }

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="rounded-lg bg-accent/15 p-1.5">
          <Users className="h-4 w-4 text-accent" />
        </div>
        <h3 className="font-display font-semibold">Bjud in byråer – få {REFERRAL_BONUS_CREDITS} leads var</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Dela din länk. Byrån som registrerar sig får {REFERRAL_NEW_SUPPLIER_BONUS} extra leads,
        och du får {REFERRAL_BONUS_CREDITS} leads så fort kontot är skapat.
      </p>

      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          onFocus={event => event.target.select()}
          aria-label="Din värvningslänk"
          className="flex-1 min-w-0 rounded-lg border bg-background px-3 py-2 text-sm text-foreground/80"
        />
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground hover:bg-brand-mint-hover transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Kopierad!' : 'Kopiera'}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {referredCount === 0
          ? 'Ingen har gått med via din länk ännu – dela den i byrånätverket.'
          : `${referredCount} ${referredCount === 1 ? 'byrå har' : 'byråer har'} gått med via din länk.`}
      </p>
    </div>
  )
}

export default ReferralCard
