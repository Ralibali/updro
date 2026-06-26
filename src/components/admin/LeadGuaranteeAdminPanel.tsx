import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { reviewLeadRefundRequest } from '@/lib/marketplaceActions'

const REASON_LABELS: Record<string, string> = {
  invalid_contact: 'Felaktiga kontaktuppgifter',
  no_response: 'Kunden svarar inte',
  fake_lead: 'Falskt uppdrag eller spam',
  duplicate: 'Dubblett',
  wrong_scope: 'Felaktig beskrivning',
  other: 'Annan anledning',
}

type GuaranteeRow = {
  id: string
  supplier_id: string
  project_id: string
  reason: string
  details: string | null
  status: 'pending' | 'approved' | 'rejected'
  credit_refunded: boolean
  admin_note: string | null
  created_at: string
  reviewed_at: string | null
  project?: { title: string; category: string } | null
  supplier?: { full_name: string | null; company_name: string | null; email: string | null } | null
}

const LeadGuaranteeAdminPanel = () => {
  const [rows, setRows] = useState<GuaranteeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data: requests, error } = await (supabase as any)
        .from('lead_refund_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error

      const projectIds = [...new Set((requests || []).map((row: any) => row.project_id))]
      const supplierIds = [...new Set((requests || []).map((row: any) => row.supplier_id))]
      const [{ data: projects }, { data: suppliers }] = await Promise.all([
        projectIds.length ? supabase.from('projects').select('id, title, category').in('id', projectIds) : Promise.resolve({ data: [] as any[] }),
        supplierIds.length ? supabase.from('profiles').select('id, full_name, company_name, email').in('id', supplierIds) : Promise.resolve({ data: [] as any[] }),
      ])

      const projectMap = new Map((projects || []).map((item: any) => [item.id, item]))
      const supplierMap = new Map((suppliers || []).map((item: any) => [item.id, item]))
      setRows((requests || []).map((row: any) => ({
        ...row,
        project: projectMap.get(row.project_id) || null,
        supplier: supplierMap.get(row.supplier_id) || null,
      })))
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Kunde inte hämta garantiärenden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visibleRows = useMemo(
    () => showAll ? rows : rows.filter(row => row.status === 'pending'),
    [rows, showAll],
  )

  const review = async (row: GuaranteeRow, decision: 'approved' | 'rejected') => {
    setProcessing(row.id)
    try {
      const result = await reviewLeadRefundRequest(row.id, decision, notes[row.id] || '')
      setRows(previous => previous.map(item => item.id === row.id ? {
        ...item,
        status: result.status,
        credit_refunded: result.credit_refunded,
        admin_note: notes[row.id]?.trim() || null,
        reviewed_at: new Date().toISOString(),
      } : item))
      toast.success(decision === 'approved' ? 'Leadgarantin godkänd.' : 'Garantiansökan avslagen.')
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message || 'Kunde inte behandla ärendet.')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Leadgaranti</h2>
          <p className="text-sm text-muted-foreground mt-1">{rows.filter(row => row.status === 'pending').length} ärenden väntar på granskning.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAll(value => !value)}>{showAll ? 'Visa väntande' : 'Visa alla'}</Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />Uppdatera</Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />Hämtar garantiärenden...</div>
      ) : visibleRows.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-center text-muted-foreground">Inga garantiärenden att visa.</div>
      ) : (
        <div className="space-y-4">
          {visibleRows.map(row => (
            <article key={row.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.status === 'pending' ? 'bg-amber-100 text-amber-800' : row.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {row.status === 'pending' ? 'Väntar' : row.status === 'approved' ? 'Godkänd' : 'Avslagen'}
                  </span>
                  <h3 className="font-semibold mt-2">{row.project?.title || 'Okänt uppdrag'}</h3>
                  <p className="text-sm text-muted-foreground">{row.supplier?.company_name || row.supplier?.full_name || 'Okänd byrå'} · {row.supplier?.email || 'Ingen e-post'}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString('sv-SE')}</p>
              </div>

              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                <p><strong>Anledning:</strong> {REASON_LABELS[row.reason] || row.reason}</p>
                {row.details && <p className="mt-2 whitespace-pre-wrap">{row.details}</p>}
              </div>

              {row.status === 'pending' ? (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={notes[row.id] || ''}
                    onChange={event => setNotes(previous => ({ ...previous, [row.id]: event.target.value }))}
                    placeholder="Intern kommentar eller förklaring till byrån..."
                    maxLength={1500}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button onClick={() => review(row, 'approved')} disabled={processing === row.id} className="bg-emerald-700 hover:bg-emerald-800">
                      {processing === row.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}Godkänn
                    </Button>
                    <Button variant="destructive" onClick={() => review(row, 'rejected')} disabled={processing === row.id}>
                      <X className="h-4 w-4 mr-1" />Avslå
                    </Button>
                  </div>
                </div>
              ) : row.admin_note ? (
                <p className="text-sm mt-3"><strong>Kommentar:</strong> {row.admin_note}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default LeadGuaranteeAdminPanel
