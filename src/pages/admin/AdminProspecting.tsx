import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { AdminLayout } from './AdminDashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Check, Download, ExternalLink, FileUp, RefreshCw, Search, Sparkles, X } from 'lucide-react'
import { buildProspectingQuery, type ProspectingNeedType, type ProspectingSignalFocus } from '@/lib/prospecting'
import { domainFromWebsite, exportApprovedOutreachCsv, parseOpenOutreach, type ApprovedOutreachLead } from '@/lib/openOutreach'
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
  source_url: string | null
  city: string | null
  industry: string | null
  fit_score: number
  observed_signals: string[]
  contact_page_url: string | null
  status: LeadStatus
  source_provider: 'firecrawl' | 'openoutreach' | 'manual'
  provider_lead_id: string | null
  fit_reason: string | null
  contact_first_name: string | null
  contact_last_name: string | null
  contact_title: string | null
  contact_email: string | null
  linkedin_url: string | null
  qualified_at: string | null
  outreach_subject: string | null
  outreach_body: string | null
  approval_status: 'not_ready' | 'draft' | 'approved' | 'changes_requested' | 'cancelled'
  export_count: number
  reply_note: string | null
  created_at: string
}

type ReviewDraft = {
  contact_first_name: string; contact_last_name: string; contact_title: string; contact_email: string;
  fit_reason: string; outreach_subject: string; outreach_body: string; reply_note: string;
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
  const [importRaw, setImportRaw] = useState('')
  const [importName, setImportName] = useState('OpenOutreach Sverige')
  const [importing, setImporting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [review, setReview] = useState<ReviewDraft | null>(null)

  // Form
  const [name, setName] = useState('')
  const [needType, setNeedType] = useState<ProspectingNeedType>('valfritt')
  const [signalFocus, setSignalFocus] = useState<ProspectingSignalFocus>('any')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('Sweden')
  const [freeText, setFreeText] = useState('')
  const [limit, setLimit] = useState(10)

  const previewQuery = useMemo(
    () => buildProspectingQuery({ freeText, needType, signalFocus, industry, location }),
    [freeText, needType, signalFocus, industry, location],
  )
  const filteredLeads = useMemo(() => leads.filter(lead =>
    (statusFilter === 'all' || lead.status === statusFilter) && lead.fit_score >= minScore,
  ), [leads, minScore, statusFilter])

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
        signalFocus,
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

  const openReview = (lead: Lead) => {
    setExpandedId(current => current === lead.id ? null : lead.id)
    setReview({
      contact_first_name: lead.contact_first_name ?? '', contact_last_name: lead.contact_last_name ?? '',
      contact_title: lead.contact_title ?? '', contact_email: lead.contact_email ?? '', fit_reason: lead.fit_reason ?? '',
      outreach_subject: lead.outreach_subject ?? '', outreach_body: lead.outreach_body ?? '', reply_note: lead.reply_note ?? '',
    })
  }

  const saveReview = async (lead: Lead, approvalStatus: Lead['approval_status']) => {
    if (!review) return
    if (approvalStatus === 'approved' && (!review.contact_email.trim() || !review.outreach_subject.trim() || !review.outreach_body.trim())) {
      toast({ title: 'E-post, ämne och meddelande krävs före godkännande', variant: 'destructive' })
      return
    }
    const { data: userData } = await supabase.auth.getUser()
    const patch = {
      ...review,
      contact_email: review.contact_email.trim().toLowerCase() || null,
      approval_status: approvalStatus,
      approved_at: approvalStatus === 'approved' ? new Date().toISOString() : null,
      approved_by: approvalStatus === 'approved' ? userData.user?.id ?? null : null,
    }
    const { data: saved, error } = await supabase.from('prospecting_leads').update(patch).eq('id', lead.id).select('*').single()
    if (error) { toast({ title: 'Kunde inte spara granskningen', description: error.message, variant: 'destructive' }); return }
    setLeads(current => current.map(item => item.id === lead.id ? { ...item, ...saved } as Lead : item))
    toast({ title: approvalStatus === 'approved' ? 'Godkänd för export' : 'Utkast sparat' })
  }

  const importOpenOutreach = async () => {
    const parsed = parseOpenOutreach(importRaw)
    if (parsed.length === 0) { toast({ title: 'Inga giltiga OpenOutreach-rader hittades', variant: 'destructive' }); return }
    const uniqueCompanies = [...new Map(parsed.map(item => [domainFromWebsite(item.website), item])).values()].slice(0, 100)
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) { toast({ title: 'Adminsessionen saknas', variant: 'destructive' }); return }
    setImporting(true)
    const { data: campaign, error: campaignError } = await supabase.from('prospecting_campaigns').insert({
      admin_id: userData.user.id, name: importName.trim() || 'OpenOutreach import', query: 'OpenOutreach import',
      location: 'Sweden', need_type: 'valfritt', result_limit: uniqueCompanies.length, status: 'completed', source_provider: 'openoutreach',
    }).select('id').single()
    if (campaignError || !campaign) {
      setImporting(false); toast({ title: 'Kunde inte skapa importkampanjen', description: campaignError?.message, variant: 'destructive' }); return
    }
    const rows = uniqueCompanies.map(item => ({
      campaign_id: campaign.id, company_name: item.company, domain: domainFromWebsite(item.website), website_url: item.website,
      source_url: item.website, fit_score: 0, observed_signals: [], status: 'new', source_provider: 'openoutreach',
      provider_lead_id: item.lead_id, fit_reason: item.reason, contact_first_name: item.first_name,
      contact_last_name: item.last_name, contact_title: item.title, contact_email: item.email,
      linkedin_url: item.linkedin_url, qualified_at: item.qualified_at || null, approval_status: 'not_ready',
    }))
    const { error } = await supabase.from('prospecting_leads').insert(rows)
    setImporting(false)
    if (error) { await supabase.from('prospecting_campaigns').delete().eq('id', campaign.id); toast({ title: 'Importen stoppades', description: error.message, variant: 'destructive' }); return }
    setImportRaw(''); await loadCampaigns(); setSelectedId(campaign.id)
    toast({ title: `${rows.length} företag importerade`, description: 'Inget har skickats. Granska varje pitch först.' })
  }

  const exportApproved = async () => {
    const approved = filteredLeads.filter(lead => lead.approval_status === 'approved' && lead.contact_email && lead.outreach_subject && lead.outreach_body)
    if (approved.length === 0) { toast({ title: 'Inga godkända och kompletta rader att exportera', variant: 'destructive' }); return }
    const csv = exportApprovedOutreachCsv(approved.map(lead => ({
      email: lead.contact_email, first_name: lead.contact_first_name, last_name: lead.contact_last_name,
      company: lead.company_name, title: lead.contact_title, website: lead.website_url, linkedin_url: lead.linkedin_url,
      reason: lead.fit_reason, lead_id: lead.provider_lead_id, qualified_at: lead.qualified_at,
      outreach_subject: lead.outreach_subject!, outreach_body: lead.outreach_body!,
    } satisfies ApprovedOutreachLead)))
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = `updro-outreach-${new Date().toISOString().slice(0, 10)}.csv`
    link.click(); URL.revokeObjectURL(link.href)
    const now = new Date().toISOString()
    await Promise.all(approved.map(lead => supabase.from('prospecting_leads').update({ export_count: (lead.export_count ?? 0) + 1, last_exported_at: now }).eq('id', lead.id)))
    const approvedIds = new Set(approved.map(lead => lead.id))
    setLeads(current => current.map(lead => approvedIds.has(lead.id) ? { ...lead, export_count: (lead.export_count ?? 0) + 1 } : lead))
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6" /> Prospektering
          </h1>
          <p className="text-sm text-muted-foreground">
            Hitta företag med verifierbara köp-, tillväxt- och problemsignaler via Firecrawl eller importera kvalificerade OpenOutreach-resultat.
            Inget skickas från Updro; varje pitch måste granskas och godkännas före export.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={exportApproved} disabled={!selectedId}><Download className="h-4 w-4 mr-1" />Exportera godkända</Button>
          <Button variant="outline" size="sm" onClick={loadCampaigns} disabled={loadingCampaigns}>
            <RefreshCw className={cn('h-4 w-4 mr-1', loadingCampaigns && 'animate-spin')} />Uppdatera
          </Button>
        </div>
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
            <Label>Varför nu-signal</Label>
            <Select value={signalFocus} onValueChange={v => setSignalFocus(v as ProspectingSignalFocus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Alla signaler</SelectItem>
                <SelectItem value="buying">Köpsignal – söker hjälp/leverantör</SelectItem>
                <SelectItem value="growth">Tillväxt – nyetablering/rekrytering</SelectItem>
                <SelectItem value="pain">Problem – manuellt/tekniskt hinder</SelectItem>
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
            {running ? 'Söker...' : 'Hitta signal-leads'}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Sökningen använder Firecrawl-krediter från din workspace-anslutning.
          </p>
          <details className="border-t pt-3">
            <summary className="cursor-pointer text-sm font-semibold flex items-center gap-2"><FileUp className="h-4 w-4" /> Importera OpenOutreach</summary>
            <div className="mt-3 space-y-3">
              <p className="text-[11px] text-muted-foreground">Klistra in CSV, JSONL eller en JSON-array från OpenOutreach. Dubbletter tas bort och felaktiga rader ignoreras.</p>
              <div><Label htmlFor="oo-name">Kampanjnamn</Label><Input id="oo-name" value={importName} onChange={event => setImportName(event.target.value)} /></div>
              <div><Label htmlFor="oo-data">Exportdata</Label><Textarea id="oo-data" value={importRaw} onChange={event => setImportRaw(event.target.value)} rows={7} placeholder="email,first_name,last_name,company,title,website,..." className="font-mono text-xs" /></div>
              <Button type="button" variant="secondary" className="w-full" disabled={importing || !importRaw.trim()} onClick={importOpenOutreach}><FileUp className="h-4 w-4 mr-2" />{importing ? 'Importerar…' : 'Importera utan att skicka'}</Button>
              <a href="https://github.com/eracle/OpenOutreach" target="_blank" rel="noreferrer" className="text-xs text-primary underline underline-offset-2 inline-flex items-center gap-1">Källmotor på GitHub <ExternalLink className="h-3 w-3" /></a>
            </div>
          </details>
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
                        <th className="py-2 pr-2">Outreach</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map(l => (
                        <Fragment key={l.id}>
                        <tr className="border-b last:border-0 align-top">
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
                            {l.source_url && (
                              <a href={l.source_url} target="_blank" rel="noopener noreferrer" className="mb-1 inline-flex items-center gap-1 text-primary hover:underline">
                                Källbevis <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            {l.fit_reason ? <p className="max-w-64 text-xs">{l.fit_reason}</p> : l.observed_signals.length === 0 ? (
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
                          <td className="py-2 pr-2">
                            <Badge variant={l.approval_status === 'approved' ? 'default' : l.approval_status === 'changes_requested' ? 'destructive' : 'secondary'}>{l.approval_status === 'not_ready' ? 'Ej granskad' : l.approval_status}</Badge>
                            <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs" onClick={() => openReview(l)}>Granska pitch</Button>
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
                        {expandedId === l.id && review && <tr className="border-b bg-muted/30"><td colSpan={9} className="p-4">
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="space-y-3">
                              <h3 className="font-semibold">Kontakt och kvalificering</h3>
                              <div className="grid grid-cols-2 gap-2"><Input aria-label="Förnamn" placeholder="Förnamn" value={review.contact_first_name} onChange={event => setReview(current => current && ({ ...current, contact_first_name: event.target.value }))} /><Input aria-label="Efternamn" placeholder="Efternamn" value={review.contact_last_name} onChange={event => setReview(current => current && ({ ...current, contact_last_name: event.target.value }))} /></div>
                              <Input aria-label="Roll" placeholder="Roll" value={review.contact_title} onChange={event => setReview(current => current && ({ ...current, contact_title: event.target.value }))} />
                              <Input aria-label="Arbetsmejl" type="email" placeholder="Arbetsmejl" value={review.contact_email} onChange={event => setReview(current => current && ({ ...current, contact_email: event.target.value }))} />
                              <Textarea aria-label="Varför leadet passar" rows={4} placeholder="Verifierad anledning till att leadet passar" value={review.fit_reason} onChange={event => setReview(current => current && ({ ...current, fit_reason: event.target.value }))} />
                            </div>
                            <div className="space-y-3">
                              <h3 className="font-semibold">Pitch att godkänna</h3>
                              <Input aria-label="Ämnesrad" placeholder="Ämnesrad" value={review.outreach_subject} onChange={event => setReview(current => current && ({ ...current, outreach_subject: event.target.value }))} />
                              <Textarea aria-label="Meddelande" rows={6} placeholder="Personligt meddelande. Kontrollera varje påstående." value={review.outreach_body} onChange={event => setReview(current => current && ({ ...current, outreach_body: event.target.value }))} />
                              <Textarea aria-label="Svarsnotering" rows={2} placeholder="Svar / nästa steg (valfritt)" value={review.reply_note} onChange={event => setReview(current => current && ({ ...current, reply_note: event.target.value }))} />
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => saveReview(l, 'draft')}>Spara utkast</Button>
                            <Button size="sm" onClick={() => saveReview(l, 'approved')}><Check className="h-4 w-4 mr-1" />Godkänn för export</Button>
                            <Button size="sm" variant="outline" onClick={() => saveReview(l, 'changes_requested')}>Begär ändring</Button>
                            <Button size="sm" variant="ghost" onClick={() => saveReview(l, 'cancelled')}><X className="h-4 w-4 mr-1" />Kontakta inte</Button>
                          </div>
                          <p className="mt-3 text-[11px] text-muted-foreground">Godkännande exporterar eller skickar ingenting. Knappen högst upp skapar en CSV för din valda, externa utskickskanal.</p>
                        </td></tr>}
                        </Fragment>
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
