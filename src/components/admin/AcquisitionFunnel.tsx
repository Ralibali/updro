import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Eye, FilePenLine, Send, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { groupAttributionRows, type AttributionRow } from '@/lib/attributionFunnel'

const sinceThirtyDays = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
const rate = (value: number, base: number) => base > 0 ? Math.round((value / base) * 1000) / 10 : 0

const AcquisitionFunnel = () => {
  const since = useMemo(sinceThirtyDays, [])

  const { data: pageViews = [], isLoading: viewsLoading } = useQuery({
    queryKey: ['acquisition-funnel-page-views', since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('path, session_id')
        .gte('created_at', since)
      if (error) throw error
      return data || []
    },
  })

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['acquisition-funnel-click-events', since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('click_events')
        .select('event_name, session_id')
        .gte('created_at', since)
      if (error) throw error
      return data || []
    },
  })

  const projectsQuery = useQuery({
    queryKey: ['acquisition-funnel-projects', since],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since)
      if (error) throw error
      return count || 0
    },
  })
  const projectCount = projectsQuery.data || 0

  const attributionQuery = useQuery({
    queryKey: ['acquisition-funnel-attributions', since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_attributions')
        .select('first_source, first_medium, first_campaign, first_landing_path, project_id, projects(category)')
        .gte('created_at', since)
      if (error) throw error
      return (data || []) as unknown as AttributionRow[]
    },
  })

  const funnel = useMemo(() => {
    const visitors = new Set(pageViews.map(view => view.session_id)).size
    const wizardVisitors = new Set(pageViews.filter(view => view.path === '/publicera').map(view => view.session_id)).size
    const started = new Set(events.filter(event => event.event_name === 'lead_started').map(event => event.session_id)).size
    const detailsReached = new Set(events.filter(event => event.event_name === 'lead_step_completed').map(event => event.session_id)).size
    const submitted = new Set(events.filter(event => event.event_name === 'lead_submitted').map(event => event.session_id)).size

    return [
      { label: 'Besökare', value: visitors, conversion: 100, icon: Users },
      { label: 'Såg formuläret', value: wizardVisitors, conversion: rate(wizardVisitors, visitors), icon: Eye },
      { label: 'Startade leadflödet', value: started, conversion: rate(started, visitors), icon: FilePenLine },
      { label: 'Nådde sista steget', value: detailsReached, conversion: rate(detailsReached, visitors), icon: ArrowRight },
      { label: 'Skickade in', value: submitted, conversion: rate(submitted, visitors), icon: Send },
      { label: 'Projekt i databasen', value: projectCount, conversion: rate(projectCount, visitors), icon: Send },
    ]
  }, [pageViews, events, projectCount])

  const grouped = useMemo(() => groupAttributionRows(attributionQuery.data || [], projectCount), [attributionQuery.data, projectCount])

  const loading = viewsLoading || eventsLoading || projectsQuery.isLoading
  const visitors = funnel[0]?.value || 0
  const projects = funnel[funnel.length - 1]?.value || 0

  return (
    <Card className="mb-6 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-base">Förvärvstratt – senaste 30 dagarna</CardTitle>
        <p className="text-xs text-muted-foreground">
          Visar var potentiella beställare faller bort från första besöket till ett faktiskt projekt i databasen.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Hämtar konverteringsdata…</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {funnel.map(step => (
                <div key={step.label} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <step.icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-semibold text-muted-foreground">{step.conversion}% av besökare</span>
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold">{step.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{step.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-muted/40 p-4 text-sm">
              {visitors === 0 ? (
                <p>Ingen mätbar mänsklig trafik har registrerats under perioden.</p>
              ) : projects === 0 ? (
                <p><strong>{visitors} besökare men inga projekt.</strong> Använd stegen ovan för att se om problemet ligger i trafikkvalitet, formulärstart eller inskickning.</p>
              ) : (
                <p><strong>{projects} projekt från {visitors} besökare</strong> ger en total besök-till-projekt-konvertering på {rate(projects, visitors)}%.</p>
              )}
            </div>

            <AttributionBreakdown grouped={grouped} totalProjects={projectCount} loading={attributionQuery.isLoading} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

type GroupedAttribution = ReturnType<typeof groupAttributionRows>

const AttributionBreakdown = ({ grouped, totalProjects, loading }: {
  grouped: GroupedAttribution
  totalProjects: number
  loading: boolean
}) => {
  if (loading) return null
  if (totalProjects === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed p-4 text-xs text-muted-foreground">
        Attribution visas här så snart nya projekt kommer in. Utan data räknas alla besök som ”Okänd/organisk”.
      </p>
    )
  }
  const sections: Array<{ title: string; rows: Array<{ label: string; count: number }> }> = [
    { title: 'Källa', rows: grouped.sources },
    { title: 'Medium', rows: grouped.mediums },
    { title: 'Kampanj', rows: grouped.campaigns },
    { title: 'Landningssida', rows: grouped.landings },
    { title: 'Kategori', rows: grouped.categories },
  ]
  const hasKnown = grouped.sources.some(row => row.label !== 'Okänd/organisk')

  return (
    <div className="mt-6 space-y-4">
      <h4 className="font-display text-sm font-semibold">Attribution per projekt</h4>
      {!hasKnown && (
        <p className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
          Ingen kampanjdata är registrerad än – alla projekt räknas som ”Okänd/organisk” tills UTM-taggade länkar används.
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {sections.map(section => (
          <div key={section.title} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {section.rows.length === 0 ? (
                <li className="text-xs text-muted-foreground">Ingen data</li>
              ) : section.rows.slice(0, 6).map(row => (
                <li key={row.label} className="flex items-center justify-between gap-2">
                  <span className="truncate" title={row.label}>{row.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AcquisitionFunnel
