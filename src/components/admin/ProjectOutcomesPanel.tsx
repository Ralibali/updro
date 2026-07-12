import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/dateUtils'
import { OUTCOME_SHORT_LABELS, type ProjectOutcome } from '@/lib/projectOutcomes'

type Row = {
  id: string
  outcome: ProjectOutcome
  actual_value_sek: number | null
  created_at: string
  updated_at: string
  selected_offer_id: string | null
  projects: { title: string | null; category: string | null } | null
  offers: {
    price: number | string | null
    profiles: { company_name: string | null; full_name: string | null } | null
  } | null
}

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('sv-SE')

const ProjectOutcomesPanel = () => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['admin-project-outcomes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_outcomes')
        .select(`
          id, outcome, actual_value_sek, created_at, updated_at, selected_offer_id,
          projects:project_id(title, category),
          offers:selected_offer_id(price, profiles!offers_supplier_id_fkey(company_name, full_name))
        `)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return (data ?? []) as unknown as Row[]
    },
  })

  const total = data.length
  const hired = data.filter(r => r.outcome === 'hired')
  const hiredValue = hired.reduce((sum, r) => sum + (Number(r.actual_value_sek) || 0), 0)

  return (
    <Card className="mt-6 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">Rapporterade projektutfall</CardTitle>
        <p className="text-xs text-muted-foreground">
          Faktiskt utfall från beställare. Statistiken visas endast internt.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Läser in utfall…</p>
        ) : error ? (
          <p className="text-sm text-destructive">Kunde inte läsa utfall.</p>
        ) : total === 0 ? (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Inga rapporterade utfall ännu. Beställare uppmanas rapportera efter första offerten.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Rapporterade</p>
                <p className="font-display text-2xl font-bold">{total}</p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Anlitade byrå</p>
                <p className="font-display text-2xl font-bold">{hired.length}</p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground">Rapporterat värde (hired)</p>
                <p className="font-display text-2xl font-bold">{formatPrice(hiredValue)}</p>
              </div>
            </div>
            {total < 5 && (
              <p className="mb-3 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                Underlaget är litet ({total} rapporterade). Undvik att dra slutsatser innan minst fem utfall finns.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3">Projekt</th>
                    <th className="py-2 pr-3">Kategori</th>
                    <th className="py-2 pr-3">Utfall</th>
                    <th className="py-2 pr-3">Vald byrå</th>
                    <th className="py-2 pr-3">Värde</th>
                    <th className="py-2 pr-3">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(row => (
                    <tr key={row.id} className="border-t border-border/50 align-top">
                      <td className="py-2 pr-3">{row.projects?.title || '—'}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{row.projects?.category || '—'}</td>
                      <td className="py-2 pr-3">{OUTCOME_SHORT_LABELS[row.outcome]}</td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.offers?.profiles?.company_name || row.offers?.profiles?.full_name || '—'}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {row.actual_value_sek != null ? formatPrice(Number(row.actual_value_sek)) : '—'}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">{dateFmt(row.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ProjectOutcomesPanel
