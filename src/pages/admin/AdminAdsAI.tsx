import { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from './AdminDashboard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Bot, Check, Clipboard, Download, ExternalLink, Plus, Save, Sparkles, Trash2 } from 'lucide-react'

type CampaignDraft = {
  campaignName: string
  adGroupName: string
  dailyBudget: string
  maxCpc: string
  location: string
  languages: string
  finalUrl: string
  path1: string
  path2: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  headlines: string[]
  descriptions: string[]
  keywords: string
  negativeKeywords: string
  callouts: string
  sitelinks: Array<{ title: string; url: string; description1: string; description2: string }>
}

const STORAGE_KEY = 'updro:ads-ai:campaign-draft:v1'

const starterDraft: CampaignDraft = {
  campaignName: 'SE | Search | Webbyrå | Leads',
  adGroupName: 'Webbyrå och hemsida',
  dailyBudget: '200',
  maxCpc: '35',
  location: 'Sverige',
  languages: 'Svenska, Engelska',
  finalUrl: 'https://updro.se/jamfor-offerter',
  path1: 'offert',
  path2: 'webbyra',
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'search_webbyra',
  headlines: [
    'Få Offerter Från Rätt Webbyrå',
    'Jämför Upp Till Tre Offerter',
    'Behöver Ni En Ny Hemsida?',
    'Beskriv Projektet På 2 Minuter',
    'Gratis För Beställare',
    'Ingen Registrering Krävs',
    'Högst Tre Relevanta Byråer',
    'Jämför Pris Och Upplägg',
    'Slipp Massutskick',
    'Hitta Rätt Webbyrå',
  ],
  descriptions: [
    'Beskriv projektet en gång och få upp till tre relevanta offerter från svenska webbyråer.',
    'Gratis för beställare och helt utan förpliktelser. Jämför pris och upplägg i lugn och ro.',
    'Updro granskar briefen innan relevanta byråer kan lämna offert på ditt projekt.',
    'Ny hemsida, webbshop eller SEO? Skicka in behovet på cirka två minuter.',
  ],
  keywords: '[offert hemsida]\n"offert hemsida"\n[hemsida offert]\n"hemsida offert"\n[hitta webbyrå]\n"hitta webbyrå"\n[jämför webbyråer]\n"jämför webbyråer"\n[webbyrå offert]\n"webbyrå offert"\n[hjälp med hemsida]\n"hjälp med hemsida"',
  negativeKeywords: 'jobb\nlön\nutbildning\nkurs\npraktik\ngratis hemsida\nmall\ntemplate\ntutorial\nyoutube\nlogga in\nsupport',
  callouts: 'Gratis för beställare\nHögst tre offerter\nIngen registrering\nUtan förpliktelser\nSvenska byråer\nBriefen granskas',
  sitelinks: [
    { title: 'Beskriv Ditt Projekt', url: 'https://updro.se/publicera', description1: 'Tar ungefär två minuter', description2: 'Ingen registrering krävs' },
    { title: 'Se Prisguider', url: 'https://updro.se/priser', description1: 'Se vanliga prisnivåer', description2: 'Förbered din budget' },
  ],
}

const AdminAdsAI = () => {
  const [draft, setDraft] = useState<CampaignDraft>(starterDraft)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setDraft({ ...starterDraft, ...JSON.parse(saved) })
    } catch {
      // Behåll startmallen om lokalt innehåll är trasigt.
    }
  }, [])

  const trackingUrl = useMemo(() => {
    try {
      const url = new URL(draft.finalUrl)
      if (draft.utmSource) url.searchParams.set('utm_source', draft.utmSource)
      if (draft.utmMedium) url.searchParams.set('utm_medium', draft.utmMedium)
      if (draft.utmCampaign) url.searchParams.set('utm_campaign', draft.utmCampaign)
      url.searchParams.set('utm_term', '{keyword}')
      url.searchParams.set('utm_content', '{creative}')
      return url.toString()
    } catch {
      return draft.finalUrl
    }
  }, [draft.finalUrl, draft.utmSource, draft.utmMedium, draft.utmCampaign])

  const update = <K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) => {
    setDraft(previous => ({ ...previous, [key]: value }))
  }

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    toast.success('Kampanjutkastet är sparat i denna webbläsare.')
  }

  const reset = () => {
    setDraft(starterDraft)
    localStorage.removeItem(STORAGE_KEY)
    toast.success('Startmallen är återställd.')
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    toast.success(`${label} kopierat.`)
  }

  const exportJson = () => {
    const payload = { ...draft, trackingUrl, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${draft.campaignName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'google-ads-kampanj'}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const updateArray = (key: 'headlines' | 'descriptions', index: number, value: string) => {
    update(key, draft[key].map((item, itemIndex) => itemIndex === index ? value : item))
  }

  const removeArrayItem = (key: 'headlines' | 'descriptions', index: number) => {
    update(key, draft[key].filter((_, itemIndex) => itemIndex !== index))
  }

  const updateSitelink = (index: number, key: keyof CampaignDraft['sitelinks'][number], value: string) => {
    update('sitelinks', draft.sitelinks.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }

  return (
    <AdminLayout>
      <div className="space-y-7 max-w-7xl mx-auto">
        <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-2"><Badge className="gap-1"><Sparkles className="h-3 w-3" /> Ads AI</Badge><Badge variant="outline">Kampanjbyggare</Badge></div>
            <h1 className="font-display text-3xl font-bold">Bygg hela Google Ads-kampanjen enkelt</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">Skriv och ändra allt själv. Utkastet sparas lokalt, valideras mot Googles teckengränser och kan kopieras direkt när du skapar annonsen.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={reset}>Återställ mall</Button>
            <Button variant="outline" onClick={exportJson} className="gap-2"><Download className="h-4 w-4" /> Exportera</Button>
            <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> Spara utkast</Button>
            <Button asChild variant="secondary"><a href="https://ads.google.com/" target="_blank" rel="noreferrer">Öppna Google Ads <ExternalLink className="ml-2 h-4 w-4" /></a></Button>
          </div>
        </header>

        <section className="grid lg:grid-cols-2 gap-5">
          <Panel title="1. Kampanjinställningar" subtitle="Grundinställningar som du fyller i i Google Ads.">
            <Field label="Kampanjnamn"><Input value={draft.campaignName} onChange={e => update('campaignName', e.target.value)} /></Field>
            <Field label="Annonsgrupp"><Input value={draft.adGroupName} onChange={e => update('adGroupName', e.target.value)} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Budget per dag (kr)"><Input inputMode="decimal" value={draft.dailyBudget} onChange={e => update('dailyBudget', e.target.value)} /></Field>
              <Field label="Max CPC (kr)"><Input inputMode="decimal" value={draft.maxCpc} onChange={e => update('maxCpc', e.target.value)} /></Field>
              <Field label="Plats"><Input value={draft.location} onChange={e => update('location', e.target.value)} /></Field>
              <Field label="Språk"><Input value={draft.languages} onChange={e => update('languages', e.target.value)} /></Field>
            </div>
          </Panel>

          <Panel title="2. Länk och spårning" subtitle="Plausible läser UTM-värdena och Updro sparar attributionen på uppdraget.">
            <Field label="Slutlig webbadress"><Input value={draft.finalUrl} onChange={e => update('finalUrl', e.target.value)} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Visningssökväg 1"><LimitedInput value={draft.path1} max={15} onChange={value => update('path1', value)} /></Field>
              <Field label="Visningssökväg 2"><LimitedInput value={draft.path2} max={15} onChange={value => update('path2', value)} /></Field>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="UTM source"><Input value={draft.utmSource} onChange={e => update('utmSource', e.target.value)} /></Field>
              <Field label="UTM medium"><Input value={draft.utmMedium} onChange={e => update('utmMedium', e.target.value)} /></Field>
              <Field label="UTM campaign"><Input value={draft.utmCampaign} onChange={e => update('utmCampaign', e.target.value)} /></Field>
            </div>
            <CopyBox label="Färdig spårningslänk" value={trackingUrl} onCopy={() => copy(trackingUrl, 'Spårningslänken')} />
          </Panel>
        </section>

        <Panel title="3. Rubriker" subtitle={`Google tillåter upp till 15 rubriker, högst 30 tecken. Du har ${draft.headlines.length}.`}>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {draft.headlines.map((headline, index) => (
              <EditableAsset key={index} label={`Rubrik ${index + 1}`} value={headline} max={30} onChange={value => updateArray('headlines', index, value)} onRemove={() => removeArrayItem('headlines', index)} />
            ))}
          </div>
          <Button variant="outline" disabled={draft.headlines.length >= 15} onClick={() => update('headlines', [...draft.headlines, ''])} className="mt-4 gap-2"><Plus className="h-4 w-4" /> Lägg till rubrik</Button>
          <CopyAllButton value={draft.headlines.filter(Boolean).join('\n')} label="Kopiera alla rubriker" onCopy={copy} />
        </Panel>

        <Panel title="4. Beskrivningar" subtitle={`Google tillåter upp till 4 beskrivningar, högst 90 tecken. Du har ${draft.descriptions.length}.`}>
          <div className="grid lg:grid-cols-2 gap-3">
            {draft.descriptions.map((description, index) => (
              <EditableAsset key={index} label={`Beskrivning ${index + 1}`} value={description} max={90} textarea onChange={value => updateArray('descriptions', index, value)} onRemove={() => removeArrayItem('descriptions', index)} />
            ))}
          </div>
          <Button variant="outline" disabled={draft.descriptions.length >= 4} onClick={() => update('descriptions', [...draft.descriptions, ''])} className="mt-4 gap-2"><Plus className="h-4 w-4" /> Lägg till beskrivning</Button>
          <CopyAllButton value={draft.descriptions.filter(Boolean).join('\n')} label="Kopiera alla beskrivningar" onCopy={copy} />
        </Panel>

        <section className="grid lg:grid-cols-2 gap-5">
          <Panel title="5. Sökord" subtitle={'Ett sökord per rad. Använd [exakt matchning] eller "frasmatchning".'}>
            <Textarea className="min-h-[300px] font-mono text-sm" value={draft.keywords} onChange={e => update('keywords', e.target.value)} />
            <CopyAllButton value={draft.keywords} label="Kopiera sökord" onCopy={copy} />
          </Panel>
          <Panel title="6. Negativa sökord" subtitle="Ord som stoppar irrelevanta klick. Ett ord eller en fras per rad.">
            <Textarea className="min-h-[300px] font-mono text-sm" value={draft.negativeKeywords} onChange={e => update('negativeKeywords', e.target.value)} />
            <CopyAllButton value={draft.negativeKeywords} label="Kopiera negativa sökord" onCopy={copy} />
          </Panel>
        </section>

        <Panel title="7. Callouts" subtitle="Korta fördelar som visas tillsammans med annonsen. Ett per rad.">
          <Textarea className="min-h-[140px]" value={draft.callouts} onChange={e => update('callouts', e.target.value)} />
          <CopyAllButton value={draft.callouts} label="Kopiera callouts" onCopy={copy} />
        </Panel>

        <Panel title="8. Webbplatslänkar" subtitle="Lägg till extra länkar under annonsen.">
          <div className="space-y-4">
            {draft.sitelinks.map((sitelink, index) => (
              <div key={index} className="rounded-xl border p-4 grid md:grid-cols-2 gap-3 relative">
                <Field label="Rubrik"><Input value={sitelink.title} onChange={e => updateSitelink(index, 'title', e.target.value)} /></Field>
                <Field label="URL"><Input value={sitelink.url} onChange={e => updateSitelink(index, 'url', e.target.value)} /></Field>
                <Field label="Beskrivning 1"><Input value={sitelink.description1} onChange={e => updateSitelink(index, 'description1', e.target.value)} /></Field>
                <Field label="Beskrivning 2"><Input value={sitelink.description2} onChange={e => updateSitelink(index, 'description2', e.target.value)} /></Field>
                <Button size="icon" variant="ghost" className="absolute top-2 right-2" onClick={() => update('sitelinks', draft.sitelinks.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-4 gap-2" onClick={() => update('sitelinks', [...draft.sitelinks, { title: '', url: '', description1: '', description2: '' }])}><Plus className="h-4 w-4" /> Lägg till webbplatslänk</Button>
        </Panel>

        <Panel title="9. Annonsförhandsvisning" subtitle="En förenklad bild av hur annonsen kan se ut. Google väljer själv kombinationer.">
          <div className="rounded-xl border bg-white p-5 max-w-3xl text-sm">
            <p className="text-emerald-800">Sponsrad · updro.se › {draft.path1 || 'offert'} › {draft.path2 || 'webbyra'}</p>
            <p className="text-xl text-blue-800 mt-1">{draft.headlines.filter(Boolean).slice(0, 3).join(' | ') || 'Din annonsrubrik'}</p>
            <p className="text-slate-700 mt-1">{draft.descriptions.find(Boolean) || 'Din annonsbeskrivning visas här.'}</p>
          </div>
        </Panel>

        <div className="rounded-2xl border bg-primary/5 p-5 flex gap-4">
          <Bot className="h-6 w-6 text-primary shrink-0" />
          <div><p className="font-semibold">Nästa nivå: riktig Google Ads-koppling</p><p className="text-sm text-muted-foreground mt-1">När OAuth, customer-ID och developer token är anslutna kan samma formulär skapa kampanjer direkt, hämta resultat och låta AI föreslå ändringar som du godkänner.</p></div>
        </div>
      </div>
    </AdminLayout>
  )
}

const Panel = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border bg-card p-5 md:p-6">
    <h2 className="font-display text-xl font-semibold">{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground mt-1 mb-5">{subtitle}</p>}
    <div className="space-y-4">{children}</div>
  </section>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="space-y-1.5"><Label>{label}</Label>{children}</div>

const LimitedInput = ({ value, max, onChange }: { value: string; max: number; onChange: (value: string) => void }) => (
  <div><Input value={value} onChange={e => onChange(e.target.value)} /><CharacterCount value={value} max={max} /></div>
)

const EditableAsset = ({ label, value, max, textarea = false, onChange, onRemove }: { label: string; value: string; max: number; textarea?: boolean; onChange: (value: string) => void; onRemove: () => void }) => (
  <div className="rounded-xl border p-3 relative">
    <Label className="text-xs">{label}</Label>
    {textarea ? <Textarea className="mt-2 min-h-[90px] pr-9" value={value} onChange={e => onChange(e.target.value)} /> : <Input className="mt-2 pr-9" value={value} onChange={e => onChange(e.target.value)} />}
    <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-8 w-8" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
    <CharacterCount value={value} max={max} />
  </div>
)

const CharacterCount = ({ value, max }: { value: string; max: number }) => {
  const valid = value.length <= max
  return <div className={`text-xs mt-1 flex items-center gap-1 ${valid ? 'text-muted-foreground' : 'text-destructive font-semibold'}`}>{valid && <Check className="h-3 w-3" />}{value.length}/{max} tecken</div>
}

const CopyBox = ({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) => (
  <div className="rounded-xl bg-muted/50 p-3"><p className="text-xs font-semibold mb-2">{label}</p><div className="flex gap-2"><Input readOnly value={value} className="font-mono text-xs" /><Button size="icon" variant="outline" onClick={onCopy}><Clipboard className="h-4 w-4" /></Button></div></div>
)

const CopyAllButton = ({ value, label, onCopy }: { value: string; label: string; onCopy: (value: string, label: string) => void }) => (
  <Button variant="secondary" className="mt-4 gap-2" onClick={() => onCopy(value, label)}><Clipboard className="h-4 w-4" /> {label}</Button>
)

export default AdminAdsAI
