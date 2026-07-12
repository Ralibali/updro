import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Loader2, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AdminLayout } from './AdminDashboard'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/dateUtils'

type LogRow = {
  id: string
  function_name: string
  status_code: number
  duration_ms: number
  ok: boolean
  error: string | null
  meta: Record<string, unknown> | null
  ip_hash: string | null
  created_at: string
}

const WATCHED = ['submit-guest-lead', 'analyze-brief'] as const
const WINDOWS = [
  { label: '1 h', hours: 1 },
  { label: '24 h', hours: 24 },
  { label: '7 d', hours: 24 * 7 },
] as const

const median = (values: number[]) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}
const percentile = (values: number[], p: number) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[idx]
}

const statusPill = (row: LogRow) => {
  if (row.ok) return 'bg-emerald-50 text-emerald-700'
  if (row.status_code >= 500) return 'bg-red-50 text-red-700'
  if (row.status_code === 429) return 'bg-amber-50 text-amber-800'
  return 'bg-yellow-50 text-yellow-800'
}

const AdminFunctionLogs = () => {
  const [rows, setRows] = useState<LogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState<number>(24)
  const [selected, setSelected] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString()
    const { data, error } = await (supabase as any)
      .from('edge_function_logs')
      .select('*')
      .in('function_name', WATCHED as unknown as string[])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500)
    setLoading(false)
    if (error) { console.error(error); return }
    setRows((data as LogRow[]) || [])
  }, [hours])

  useEffect(() => { load() }, [load])


  const summaries = useMemo(() => WATCHED.map(name => {
    const list = rows.filter(row => row.function_name === name)
    const durations = list.map(row => row.duration_ms)
    const errors = list.filter(row => !row.ok).length
    return {
      name,
      total: list.length,
      errors,
      errorRate: list.length ? (errors / list.length) * 100 : 0,
      avg: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      median: median(durations),
      p95: percentile(durations, 95),
    }
  }), [rows])

  const filtered = selected === 'all' ? rows : rows.filter(row => row.function_name === selected)

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" />Edge-funktioner</h1>
            <p className="text-sm text-muted-foreground mt-1">Strukturerad logg för publika endpoints. Senaste {hours} h.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {WINDOWS.map(window => (
              <Button key={window.hours} size="sm" variant={hours === window.hours ? 'default' : 'outline'} onClick={() => setHours(window.hours)}>{window.label}</Button>
            ))}
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={cn('h-4 w-4 mr-1', loading && 'animate-spin')} />Uppdatera
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {summaries.map(summary => {
            const healthy = summary.errorRate < 5
            return (
              <button key={summary.name} onClick={() => setSelected(summary.name)}
                className={cn('text-left rounded-2xl border bg-card p-5 hover:shadow-sm transition', selected === summary.name && 'ring-2 ring-primary')}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold">{summary.name}</h2>
                  <span className={cn('inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5',
                    healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                    {healthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {healthy ? 'Frisk' : 'Se över'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Anrop</p><p className="font-semibold text-lg">{summary.total}</p></div>
                  <div><p className="text-xs text-muted-foreground">Fel</p><p className="font-semibold text-lg">{summary.errors} <span className="text-xs text-muted-foreground">({summary.errorRate.toFixed(1)}%)</span></p></div>
                  <div><p className="text-xs text-muted-foreground">Median</p><p className="font-semibold text-lg">{summary.median} ms</p></div>
                  <div><p className="text-xs text-muted-foreground">p95</p><p className="font-semibold text-lg">{summary.p95} ms</p></div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Filter:</span>
          <Button size="sm" variant={selected === 'all' ? 'default' : 'outline'} onClick={() => setSelected('all')}>Alla</Button>
          {WATCHED.map(name => (
            <Button key={name} size="sm" variant={selected === name ? 'default' : 'outline'} onClick={() => setSelected(name)}>{name}</Button>
          ))}
        </div>

        <div className="bg-card border rounded-xl overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3">Tid</th>
                <th className="text-left p-3">Funktion</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Duration</th>
                <th className="text-left p-3">Fel / meta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Laddar…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Inga anrop i vald period.</td></tr>
              ) : filtered.map(row => (
                <tr key={row.id} className="border-b last:border-b-0 hover:bg-muted/20 align-top">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">{timeAgo(row.created_at)}</td>
                  <td className="p-3 font-medium">{row.function_name}</td>
                  <td className="p-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', statusPill(row))}>{row.status_code}</span></td>
                  <td className="p-3 tabular-nums">{row.duration_ms} ms</td>
                  <td className="p-3 text-xs">
                    {row.error && <p className="text-red-700 font-medium mb-1">{row.error}</p>}
                    {row.meta && Object.keys(row.meta).length > 0 && (
                      <code className="text-muted-foreground break-all">{JSON.stringify(row.meta)}</code>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminFunctionLogs
