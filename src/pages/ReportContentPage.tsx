import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { setSEOMeta } from '@/lib/seoHelpers'

const ReportContentPage = () => {
  const [contentUrl, setContentUrl] = useState('')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [goodFaith, setGoodFaith] = useState(false)

  useEffect(() => { setSEOMeta({ title: 'Rapportera innehåll | Updro', description: 'Anmäl misstänkt olagligt innehåll eller överklaga ett modereringsbeslut.', canonical: 'https://updro.se/rapportera-innehall' }) }, [])
  const mailBody = useMemo(() => ['ANMÄLAN OM INNEHÅLL PÅ UPDRO', '', `URL/identifierare: ${contentUrl}`, `Skäl: ${reason}`, '', details, '', `Anmälare: ${name}`, `E-post: ${email}`, 'Intygande om god tro: Ja'].join('\n'), [contentUrl, reason, details, name, email])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!contentUrl.trim() || !reason.trim() || !details.trim() || !name.trim() || !email.trim() || !goodFaith) return
    window.location.href = `mailto:info@auroramedia.se?subject=${encodeURIComponent(`Anmälan om innehåll – ${reason.trim()}`)}&body=${encodeURIComponent(mailBody)}`
  }

  return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-16 px-4"><article className="max-w-3xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-2">Rapportera innehåll eller överklaga beslut</h1><p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12</p>
      <div className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <section><h2 className="font-display text-lg font-semibold text-foreground mb-2">Vad kan rapporteras?</h2><p>Anmäl innehåll som du anser är olagligt, gör intrång i rättigheter eller bryter mot Updros villkor, exempelvis bedrägeri, hot, diskriminering, personuppgiftsintrång, upphovsrättsintrång, falska omdömen eller vilseledande företagsuppgifter.</p></section>
        <form onSubmit={submit} className="rounded-2xl border bg-card p-5 space-y-4">
          <div><Label htmlFor="report-url">URL eller identifierare *</Label><Input id="report-url" value={contentUrl} onChange={e => setContentUrl(e.target.value)} required /></div>
          <div><Label htmlFor="report-reason">Skäl eller kategori *</Label><Input id="report-reason" value={reason} onChange={e => setReason(e.target.value)} required /></div>
          <div><Label htmlFor="report-details">Beskrivning och bevis *</Label><Textarea id="report-details" value={details} onChange={e => setDetails(e.target.value)} rows={6} required /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="report-name">Namn *</Label><Input id="report-name" value={name} onChange={e => setName(e.target.value)} required /></div><div><Label htmlFor="report-email">E-post *</Label><Input id="report-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div></div>
          <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={goodFaith} onChange={e => setGoodFaith(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" required /><span>Jag intygar att uppgifterna lämnas i god tro och är korrekta efter bästa förmåga.</span></label>
          <Button type="submit" disabled={!goodFaith} className="rounded-xl">Skapa anmälan i e-post</Button>
          <p className="text-xs text-muted-foreground">Knappen öppnar ditt e-postprogram. Formuläret lagrar inte uppgifterna hos Updro innan du själv skickar mejlet.</p>
        </form>
        <section><h2 className="font-display text-lg font-semibold text-foreground mb-2">Bedömning</h2><p>Updro granskar underlaget och kan begära komplettering. Åtgärden kan vara att inte ingripa, begära rättelse, begränsa synlighet, ta bort innehåll eller begränsa ett konto.</p></section>
        <section><h2 className="font-display text-lg font-semibold text-foreground mb-2">Omprövning</h2><p>Den som berörs av ett modererings- eller avstängningsbeslut kan begära omprövning via <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>. Ange beslutet, berört konto eller innehåll, skälen och relevanta bevis.</p></section>
        <section><h2 className="font-display text-lg font-semibold text-foreground mb-2">Akut fara och missbruk</h2><p>Vid omedelbar fara eller misstänkt brott ska relevant myndighet eller larmnummer kontaktas. Uppenbart ogrundade eller upprepade missbruksanmälningar kan begränsas.</p></section>
      </div>
    </article></main><Footer /></div>
  )
}

export default ReportContentPage
