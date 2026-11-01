import { useCallback, useEffect, useMemo, useState } from 'react'
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

// Scheduled jobs are expected to run on their own; silence means the cron job
// or its secret is missing, which looks "healthy" if only errors are counted.
// maxSilenceMinutes is the longest normal gap between two runs, with margin.
const WATCHED = [
  { name: 'submit-guest-lead', maxSilenceMinutes: null },
  { name: 'analyze-brief', maxSilenceMinutes: null },
  { name: 'send-guest-offer-emails', maxSilenceMinutes: 30 },
  { name: 'send-notification-emails', maxSilenceMinutes: 30 },
  { name: 'send-supplier-lead-alerts', maxSilenceMinutes: 30 },
  { name: 'offer-reminder-cron', maxSilenceMinutes: 26 * 60 },
  { name: 'send-followup-reminders', maxSilenceMinutes: 26 * 60 },
] as const
const WATCHED_NAMES: string[] = WATCHED.map(item => item.name)
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
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
}

type Summary = {
  function_name: string
  total: number
  errors: number
  last_run: string | null
  avg_ms: number
  median_ms: number
  p95_ms: number
}

const statusPill = (row: LogRow) => {
  if (row.ok) return 'bg-emerald-50 text-emerald-700'
  if (row.status_code >= 500) return 'bg-red-50 text-red-700'
  if (row.status_code === 429) return 'bg-amber-50 text-amber-800'
  return 'bg-yellow-50 text-yellow-800'
}

const AdminFunctionLogs = () => {
  const [rows, setRows] = useState<LogRow[]>([])
  const [serverSummaries, setServerSummaries] = useState<Summary[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState<number>(24)
  const [selected, setSelected] = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString()
    const [{ data, error }, summary] = await Promise.all([
      (supabase as any)
        .from('edge_function_logs')
        .select('*')
        .in('function_name', WATCHED_NAMES)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(500),
      supabase.rpc('admin_edge_function_summary', { p_since: since, p_names: WATCHED_NAMES }),
    ])
    setLoading(false)
    setServerSummaries(summary.error || !Array.isArray(summary.data) ? null : summary.data as Summary[])
    if (error) { console.error(error); return }
    setRows((data as LogRow[]) || [])
  }, [hours])

  useEffect(() => { load() }, [load])


  // Counts come from the server so busy jobs cannot push quiet ones out of the
  // 500-row list below. Before the summary function is deployed, fall back to
  // the visible rows.
  const summaries = useMemo(() => WATCHED.map(({ name, maxSilenceMinutes }) => {
    const server = serverSummaries?.find(item => item.function_name === name)
    const list = rows.filter(row => row.function_name === name)
    const total = server?.total ?? list.length
    const errors = server?.errors ?? list.filter(row => !row.ok).length
    const lastRun = server ? server.last_run : list[0]?.created_at || null
    const silent = maxSilenceMinutes !== null
      && (!lastRun || Date.now() - Date.parse(lastRun) > maxSilenceMinutes * 60 * 1000)
    return {
      name,
      silent,
      lastRun,
      total,
      errors,
      errorRate: total ? (errors / total) * 100 : 0,
      median: server?.median_ms ?? median(list.map(row => row.duration_ms)),
      p95: server?.p95_ms ?? percentile(list.map(row => row.duration_ms), 95),
    }
  }), [rows, serverSummaries])

  const filtered = selected === 'all' ? rows : rows.filter(row => row.function_name === selected)

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6" />Edge-funktioner</h1>
            <p className="text-sm text-muted-foreground mt-1">Publika endpoints och schemalagda mejljobb. Senaste {hours} h.</p>
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
            const healthy = summary.errorRate < 5 && !summary.silent
            return (
              <button key={summary.name} onClick={() => setSelected(summary.name)}
                className={cn('text-left rounded-2xl border bg-card p-5 hover:shadow-sm transition', selected === summary.name && 'ring-2 ring-primary')}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold">{summary.name}</h2>
                  <span className={cn('inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5',
                    healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                    {healthy ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {healthy ? 'Frisk' : summary.silent ? 'Ingen körning' : 'Se över'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Anrop</p><p className="font-semibold text-lg">{summary.total}</p></div>
                  <div><p className="text-xs text-muted-foreground">Fel</p><p className="font-semibold text-lg">{summary.errors} <span className="text-xs text-muted-foreground">({summary.errorRate.toFixed(1)}%)</span></p></div>
                  <div><p className="text-xs text-muted-foreground">Median</p><p className="font-semibold text-lg">{summary.median} ms</p></div>
                  <div><p className="text-xs text-muted-foreground">p95</p><p className="font-semibold text-lg">{summary.p95} ms</p></div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{summary.silent ? `${summary.lastRun ? `Senaste körning ${timeAgo(summary.lastRun)}` : 'Har aldrig körts'} – kontrollera schemalagt jobb och hemlighet.` : summary.lastRun ? `Senaste körning ${timeAgo(summary.lastRun)}` : 'Inga anrop i perioden.'}</p>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Filter:</span>
          <Button size="sm" variant={selected === 'all' ? 'default' : 'outline'} onClick={() => setSelected('all')}>Alla</Button>
          {WATCHED_NAMES.map(name => (
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
