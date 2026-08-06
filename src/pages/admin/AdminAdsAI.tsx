import { useMemo, useState } from 'react'
import { AdminLayout } from './AdminDashboard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Bot, CheckCircle2, ExternalLink, Lightbulb, MousePointerClick, Pause, Rocket, Settings2, Sparkles, Target, TrendingUp, Wallet } from 'lucide-react'

type AdsMetrics = {
  spend: number
  clicks: number
  impressions: number
  leads: number
  approvedLeads: number
}

type Recommendation = {
  level: 'good' | 'warning' | 'action'
  title: string
  detail: string
  action: string
}

const numberValue = (value: string) => {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

const AdminAdsAI = () => {
  const [metrics, setMetrics] = useState<AdsMetrics>({
    spend: 0,
    clicks: 0,
    impressions: 0,
    leads: 0,
    approvedLeads: 0,
  })

  const calculated = useMemo(() => {
    const ctr = metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
    const cpc = metrics.clicks > 0 ? metrics.spend / metrics.clicks : 0
    const conversionRate = metrics.clicks > 0 ? (metrics.leads / metrics.clicks) * 100 : 0
    const cpa = metrics.leads > 0 ? metrics.spend / metrics.leads : 0
    const approvedCpa = metrics.approvedLeads > 0 ? metrics.spend / metrics.approvedLeads : 0
    return { ctr, cpc, conversionRate, cpa, approvedCpa }
  }, [metrics])

  const recommendations = useMemo<Recommendation[]>(() => {
    if (metrics.clicks === 0 && metrics.spend === 0) {
      return [{
        level: 'action',
        title: 'Koppla Google Ads och starta första kampanjen',
        detail: 'Ads AI behöver kampanjdata för att kunna avgöra vilka sökord och annonser som faktiskt ger uppdrag.',
        action: 'Följ checklistan längre ned och starta Search-kampanjen mot /jamfor-offerter.',
      }]
    }

    const items: Recommendation[] = []
    if (metrics.impressions >= 100 && calculated.ctr < 4) items.push({
      level: 'warning', title: 'Låg klickfrekvens',
      detail: `CTR är ${calculated.ctr.toFixed(1)} %. För köpintention bör annonserna helst ligga över cirka 4–5 %.`,
      action: 'Testa rubriken “Få offerter från rätt webbyrå” och gör sökorden mer exakta.',
    })
    if (metrics.clicks >= 20 && metrics.leads === 0) items.push({
      level: 'action', title: 'Klick utan inskick',
      detail: `${metrics.clicks} klick har ännu inte gett något inskickat uppdrag.`,
      action: 'Kontrollera söktermerna, pausa informationssökningar och testa hela formuläret på mobil.',
    })
    if (metrics.clicks >= 10 && calculated.cpc > 40) items.push({
      level: 'warning', title: 'Hög klickkostnad',
      detail: `Genomsnittlig CPC är ${calculated.cpc.toFixed(0)} kr.`,
      action: 'Sänk max CPC, lägg till negativa sökord och prioritera “offert hemsida” samt “hitta webbyrå”.',
    })
    if (metrics.leads >= 3 && calculated.conversionRate >= 3) items.push({
      level: 'good', title: 'Landningssidan konverterar',
      detail: `${calculated.conversionRate.toFixed(1)} % av klicken blir uppdrag.`,
      action: 'Behåll vinnande sökord och öka budgeten försiktigt, högst 15–20 % åt gången.',
    })
    if (metrics.leads >= 3 && metrics.approvedLeads / metrics.leads < 0.5) items.push({
      level: 'warning', title: 'För låg leadkvalitet',
      detail: 'Mindre än hälften av inskicken blir godkända uppdrag.',
      action: 'Skärp sökorden och lägg till företag, budget och projektstart tydligare i annons och formulär.',
    })
    if (!items.length) items.push({
      level: 'good', title: 'Ingen tydlig varningssignal ännu',
      detail: 'Datamängden är fortfarande liten eller resultaten ligger inom rimliga startnivåer.',
      action: 'Fortsätt samla data och granska söktermerna varje dag första veckan.',
    })
    return items
  }, [metrics, calculated])

  const updateMetric = (key: keyof AdsMetrics, value: string) => {
    setMetrics(previous => ({ ...previous, [key]: numberValue(value) }))
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> Beta</Badge>
              <Badge variant="outline">Google Ads</Badge>
            </div>
            <h1 className="font-display text-3xl font-bold">Ads AI</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">Din kontrollpanel för att vinna fler uppdrag med Google Ads. Börja med manuell analys; när API-kopplingen är klar hämtas siffrorna automatiskt.</p>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <a href="https://ads.google.com/" target="_blank" rel="noreferrer">Öppna Google Ads <ExternalLink className="h-4 w-4" /></a>
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><Settings2 className="h-6 w-6" /></div>
          <div className="flex-1">
            <p className="font-semibold">Google Ads API är inte anslutet ännu</p>
            <p className="text-sm text-muted-foreground mt-1">Dashboarden fungerar nu som analysassistent. Automatisk import, pausning och budgetändringar aktiveras efter Google OAuth, developer token och ett manager/customer-ID.</p>
          </div>
          <Badge variant="outline" className="self-start md:self-auto">Manuellt läge</Badge>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4"><Bot className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-semibold">Mata in senaste 30 dagarna</h2></div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {([
              ['spend', 'Kostnad', 'kr'],
              ['impressions', 'Visningar', ''],
              ['clicks', 'Klick', ''],
              ['leads', 'Inskickade uppdrag', ''],
              ['approvedLeads', 'Godkända uppdrag', ''],
            ] as const).map(([key, label, suffix]) => (
              <div key={key} className="rounded-xl border bg-card p-4">
                <Label htmlFor={key}>{label}</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input id={key} inputMode="decimal" value={metrics[key] || ''} onChange={event => updateMetric(key, event.target.value)} placeholder="0" />
                  {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <Metric icon={MousePointerClick} label="CTR" value={`${calculated.ctr.toFixed(1)} %`} />
          <Metric icon={Wallet} label="CPC" value={`${calculated.cpc.toFixed(0)} kr`} />
          <Metric icon={Target} label="Konvertering" value={`${calculated.conversionRate.toFixed(1)} %`} />
          <Metric icon={TrendingUp} label="CPA uppdrag" value={`${calculated.cpa.toFixed(0)} kr`} />
          <Metric icon={CheckCircle2} label="CPA godkänt" value={`${calculated.approvedCpa.toFixed(0)} kr`} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4"><Lightbulb className="h-5 w-5 text-primary" /><h2 className="font-display text-xl font-semibold">AI-rekommendationer</h2></div>
          <div className="space-y-3">
            {recommendations.map(item => <RecommendationCard key={item.title} item={item} />)}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /> Integrationschecklista</h2>
            <div className="mt-5 space-y-4">
              <Checklist done title="Plausible finns på Updro" detail="Uppdrag Started och Uppdrag Submitted skickas redan." />
              <Checklist done title="UTM-attribution sparas" detail="Kampanj, sökord och landningssida följer med uppdraget." />
              <Checklist title="Google Ads-konvertering" detail="Skapa Begär offert och lägg in AW-ID/label i VITE_GOOGLE_ADS_LEAD_SEND_TO." />
              <Checklist title="Google OAuth" detail="Skapa OAuth-klient i Google Cloud och godkänn Google Ads-scope." />
              <Checklist title="Google Ads developer token" detail="Ansök via Google Ads API Center. Krävs för att läsa och ändra kampanjer." />
              <Checklist title="Supabase edge-funktion" detail="Nästa version hämtar kampanjdata säkert på serversidan och lagrar aldrig refresh token i webbläsaren." />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2"><Pause className="h-5 w-5 text-primary" /> Säker autopilot</h2>
            <p className="text-sm text-muted-foreground mt-2">När API:t kopplas in bör AI:n börja i godkännandeläge – inte ändra kontot fritt.</p>
            <div className="mt-5 space-y-3 text-sm">
              {[
                'AI föreslår negativa sökord från söktermsrapporten.',
                'AI föreslår paus först efter tillräckligt många klick.',
                'Budgethöjningar begränsas till högst 20 % per ändring.',
                'Du godkänner alltid ändringen innan den skickas till Google.',
                'Alla ändringar sparas i audit-loggen med före- och eftervärde.',
              ].map(text => <div key={text} className="flex gap-3"><CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /><span>{text}</span></div>)}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

const Metric = ({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) => (
  <div className="rounded-xl border bg-card p-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="h-4 w-4" />{label}</div>
    <p className="font-display text-2xl font-bold mt-2">{value}</p>
  </div>
)

const RecommendationCard = ({ item }: { item: Recommendation }) => {
  const styles = item.level === 'good'
    ? 'border-emerald-200 bg-emerald-50/60'
    : item.level === 'warning'
      ? 'border-amber-200 bg-amber-50/60'
      : 'border-primary/30 bg-primary/5'
  const Icon = item.level === 'good' ? CheckCircle2 : item.level === 'warning' ? AlertTriangle : Sparkles
  return (
    <div className={`rounded-xl border p-5 ${styles}`}>
      <div className="flex gap-3">
        <Icon className="h-5 w-5 mt-0.5 shrink-0" />
        <div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground mt-1">{item.detail}</p><p className="text-sm font-medium mt-3">Gör så här: {item.action}</p></div>
      </div>
    </div>
  )
}

const Checklist = ({ done = false, title, detail }: { done?: boolean; title: string; detail: string }) => (
  <div className="flex gap-3">
    {done ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
    <div><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground mt-0.5">{detail}</p></div>
  </div>
)

export default AdminAdsAI
