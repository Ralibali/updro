import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { setSEOMeta } from '@/lib/seoHelpers'

const ProspectingPrivacyNoticePage = () => {
  useEffect(() => {
    setSEOMeta({ title: 'Integritetsinformation för prospektering | Updro', description: 'GDPR-information om Updros begränsade research av offentliga företagswebbplatser.', canonical: 'https://updro.se/integritet/prospektering' })
  }, [])

  return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 py-16 px-4"><article className="max-w-3xl mx-auto prose prose-slate">
      <h1 className="font-display text-3xl font-bold mb-2">Integritetsinformation för företagsprospektering</h1><p className="text-muted-foreground text-sm mb-8">Senast uppdaterad: 2026-07-12</p>
      <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Personuppgiftsansvarig</h2><p><strong>Aurora Media AB</strong>, org.nr. <strong>559272-0220</strong>, Gustafstorpsvägen 42, 585 74 Ljungsbro. Kontakt: <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Varför du får informationen</h2><p>Updro kan ha hittat information om ett företag eller en yrkesmässig kontaktväg genom en offentlig företagswebbplats eller ett sökresultat. Detta är information när uppgifter inte har samlats in direkt från personen.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Uppgifter och källa</h2><p>Vi kan behandla företagsnamn, domän, webbplats, offentlig beskrivning, bransch/ort, publik kontaktsida, observerade webbplatssignaler, fit score, granskningsstatus och kontaktstatus. Det automatiska Firecrawl-flödet samlar i nuläget inte in personnamn eller e-postadresser.</p><p className="mt-2">Källorna är offentliga företagswebbplatser, sökresultat och länkar som företaget självt publicerat.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Syfte och rättslig grund</h2><p>Syftet är relevant B2B-research, manuell prioritering och vid behov begränsad individuell företagskontakt. Rättslig grund är berättigat intresse efter intresseavvägning. Vi begränsar uppgifterna, använder offentliga företagskällor och tillåter inte automatiska massutskick i verktyget.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Fit score</h2><p>Fit score bygger på synliga webbplatssignaler och prioriterar endast intern granskning. Det är inte ett automatiserat beslut med rättslig eller liknande betydande effekt.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Mottagare och överföringar</h2><p>Uppgifterna är tillgängliga för behöriga administratörer och tekniska leverantörer, främst Supabase, Firecrawl och Lovable/hosting. Om behandling sker utanför EU/EES används giltigt överföringsstöd. Vi säljer inte uppgifterna.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Lagring</h2><p>Data sparas högst 12 månader efter senaste research eller kontakt, om den inte tidigare raderas eller behövs för pågående affärsdialog. En kontakta-ej-markering kan sparas längre för att respektera invändningen.</p></div>
        <div><h2 className="font-display text-lg font-semibold text-foreground mb-2">Rättigheter</h2><p>Du kan begära tillgång, rättelse, radering eller begränsning och invända mot behandling som grundas på berättigat intresse.</p><p className="mt-2"><strong>Du kan när som helst invända mot direktmarknadsföring.</strong> Då upphör behandlingen för det ändamålet. Mejla <a href="mailto:info@auroramedia.se" className="text-primary hover:underline">info@auroramedia.se</a>. Du kan också klaga hos IMY.</p></div>
        <div><p>Se även Updros <a href="/integritetspolicy" className="text-primary hover:underline">fullständiga integritetspolicy</a>.</p></div>
      </section>
    </article></main><Footer /></div>
  )
}

export default ProspectingPrivacyNoticePage
