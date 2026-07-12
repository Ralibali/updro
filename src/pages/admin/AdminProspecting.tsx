import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ExternalLink, RefreshCw, Search, Sparkles } from 'lucide-react'
import { buildProspectingQuery, type ProspectingNeedType } from '@/lib/prospecting'
import { cn } from '@/lib/utils'

type LeadStatus =
  | 'new' | 'reviewed' | 'contacted' | 'replied'
  | 'qualified' | 'converted' | 'rejected' | 'do_not_contact'

interface Campaign {
  id: string
  name: string
  query: string
  location: string
  need_type: ProspectingNeedType
  industry: string | null
  result_limit: number
  status: 'draft' | 'running' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
}

interface Lead {
  id: string
  campaign_id: string
  company_name: string
  domain: string
  website_url: string
  city: string | null
  industry: string | null
  fit_score: number
  observed_signals: string[]
  contact_page_url: string | null
  status: LeadStatus
  created_at: string
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'Ny' },
  { value: 'reviewed', label: 'Granskad' },
  { value: 'contacted', label: 'Kontaktad' },
  { value: 'replied', label: 'Svarat' },
  { value: 'qualified', label: 'Kvalificerad' },
  { value: 'converted', label: 'Konverterad' },
  { value: 'rejected', label: 'Avvisad' },
  { value: 'do_not_contact', label: 'Kontakta ej' },
]

const AdminProspecting = () => {
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(false)
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [running, setRunning] = useState(false)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [minScore, setMinScore] = useState(0)

  // Form
  const [name, setName] = useState('')
  const [needType, setNeedType] = useState<ProspectingNeedType>('valfritt')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('Sweden')
  const [freeText, setFreeText] = useState('')
  const [limit, setLimit] = useState(10)

  const previewQuery = useMemo(
    () => buildProspectingQuery({ freeText, needType, industry, location }),
    [freeText, needType, industry, location],
  )

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true)
    const { data } = await supabase
      .from('prospecting_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setCampaigns((data ?? []) as Campaign[])
    setLoadingCampaigns(false)
  }, [])

  const loadLeads = useCallback(async (campaignId: string) => {
    setLoadingLeads(true)
    const { data } = await supabase
      .from('prospecting_leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('fit_score', { ascending: false })
    setLeads((data ?? []).map(l => ({
      ...l,
      observed_signals: Array.isArray(l.observed_signals) ? l.observed_signals as string[] : [],
    })) as Lead[])
    setLoadingLeads(false)
  }, [])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])
  useEffect(() => { if (selectedId) loadLeads(selectedId) }, [selectedId, loadLeads])

  const runSearch = async () => {
    if (!name.trim() || !previewQuery) {
      toast({ title: 'Fyll i kampanjnamn och något att söka på', variant: 'destructive' })
      return
    }
    setRunning(true)
    const { data, error } = await supabase.functions.invoke('firecrawl-prospect-search', {
      body: {
        campaignName: name.trim(),
        query: previewQuery,
        location,
        needType,
        industry: industry.trim() || undefined,
        limit,
      },
    })
    setRunning(false)
    if (error) {
      toast({ title: 'Sökning misslyckades', description: error.message, variant: 'destructive' })
      return
    }
    toast({
      title: 'Klart',
      description: `${(data as { inserted?: number })?.inserted ?? 0} företag sparade.`,
    })
    await loadCampaigns()
    if ((data as { campaign_id?: string })?.campaign_id) {
      setSelectedId((data as { campaign_id: string }).campaign_id)
    }
  }

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    const patch: Partial<Lead> & { contacted_at?: string | null } = { status }
    if (status === 'contacted') patch.contacted_at = new Date().toISOString()
    const { error } = await supabase.from('prospecting_leads').update(patch).eq('id', leadId)
    if (error) {
      toast({ title: 'Kunde inte uppdatera', description: error.message, variant: 'destructive' })
      return
    }
    setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status } : l)))
  }

  const filteredLeads = leads.filter(l =>
    (statusFilter === 'all' || l.status === statusFilter) && l.fit_score >= minScore,
  )

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" /> Prospektering
          </h1>
          <p className="text-sm text-muted-foreground">
            Hitta företag via Firecrawl. Inga e-postadresser eller personuppgifter samlas in.
            Varje sökning använder Firecrawl-krediter.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadCampaigns} disabled={loadingCampaigns}>
          <RefreshCw className={cn('h-4 w-4 mr-1', loadingCampaigns && 'animate-spin')} />Uppdatera
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <section className="bg-card rounded-xl border p-4 space-y-3 h-fit">
          <h2 className="font-semibold">Ny sökning</h2>
          <div>
            <Label htmlFor="p-name">Kampanjnamn</Label>
            <Input id="p-name" value={name} onChange={e => setName(e.target.value)} placeholder="t.ex. Restauranger Göteborg – webb" />
          </div>
          <div>
            <Label>Behov</Label>
            <Select value={needType} onValueChange={v => setNeedType(v as ProspectingNeedType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="valfritt">Valfritt</SelectItem>
                <SelectItem value="webb">Ny hemsida</SelectItem>
                <SelectItem value="ehandel">E-handel</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="p-industry">Bransch (valfritt)</Label>
            <Input id="p-industry" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="restaurang, VVS, ..." />
          </div>
          <div>
            <Label htmlFor="p-loc">Ort / region</Label>
            <Input id="p-loc" value={location} onChange={e => setLocation(e.target.value)} placeholder="Göteborg" />
          </div>
          <div>
            <Label htmlFor="p-text">Fritext (valfritt)</Label>
            <Textarea id="p-text" value={freeText} onChange={e => setFreeText(e.target.value)} rows={2} placeholder="ytterligare sökord" />
          </div>
          <div>
            <Label>Antal</Label>
            <Select value={String(limit)} onValueChange={v => setLimit(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-muted p-3 text-xs">
            <div className="font-semibold text-muted-foreground mb-1">Förhandsvisning av sökfråga</div>
            <div className="font-mono break-words">{previewQuery || <span className="italic text-muted-foreground">Fyll i något ovan</span>}</div>
          </div>
          <Button onClick={runSearch} disabled={running || !previewQuery.trim()} className="w-full">
            <Search className={cn('h-4 w-4 mr-2', running && 'animate-pulse')} />
            {running ? 'Söker...' : 'Hitta företag'}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Sökningen använder Firecrawl-krediter från din workspace-anslutning.
          </p>
        </section>

        {/* Campaigns + leads */}
        <section className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <h2 className="font-semibold mb-2">Kampanjhistorik</h2>
            {campaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga kampanjer ännu.</p>
            ) : (
              <ul className="divide-y">
                {campaigns.map(c => (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'w-full text-left py-2 px-1 flex items-center gap-3 hover:bg-muted/50 rounded',
                        selectedId === c.id && 'bg-muted/60',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{c.query}</p>
                      </div>
                      <Badge variant={c.status === 'completed' ? 'default' : c.status === 'failed' ? 'destructive' : 'secondary'}>
                        {c.status}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString('sv-SE')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedId && (
            <div className="bg-card rounded-xl border p-4">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <h2 className="font-semibold mr-auto">Träffar</h2>
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as LeadStatus | 'all')}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla statusar</SelectItem>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={String(minScore)} onValueChange={v => setMinScore(Number(v))}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Min score" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Alla score</SelectItem>
                    <SelectItem value="40">≥ 40</SelectItem>
                    <SelectItem value="60">≥ 60</SelectItem>
                    <SelectItem value="80">≥ 80</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loadingLeads ? (
                <p className="text-sm text-muted-foreground">Laddar...</p>
              ) : filteredLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Inga företag matchar filtret.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground border-b">
                      <tr>
                        <th className="py-2 pr-2">Företag</th>
                        <th className="py-2 pr-2">Webbplats</th>
                        <th className="py-2 pr-2">Ort</th>
                        <th className="py-2 pr-2">Bransch</th>
                        <th className="py-2 pr-2">Score</th>
                        <th className="py-2 pr-2">Signaler</th>
                        <th className="py-2 pr-2">Kontaktsida</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(l => (
                        <tr key={l.id} className="border-b last:border-0 align-top">
                          <td className="py-2 pr-2 font-medium">{l.company_name}</td>
                          <td className="py-2 pr-2">
                            <a href={l.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                              {l.domain} <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">{l.city || '–'}</td>
                          <td className="py-2 pr-2 text-muted-foreground">{l.industry || '–'}</td>
                          <td className="py-2 pr-2 font-mono">{l.fit_score}</td>
                          <td className="py-2 pr-2 text-xs">
                            {l.observed_signals.length === 0 ? (
                              <span className="text-muted-foreground">–</span>
                            ) : (
                              <ul className="list-disc pl-4 space-y-0.5">
                                {l.observed_signals.map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                            )}
                          </td>
                          <td className="py-2 pr-2">
                            {l.contact_page_url ? (
                              <a href={l.contact_page_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                Öppna kontaktsida <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : <span className="text-muted-foreground text-xs">–</span>}
                          </td>
                          <td className="py-2">
                            <Select value={l.status} onValueChange={v => updateStatus(l.id, v as LeadStatus)}>
                              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminProspecting
