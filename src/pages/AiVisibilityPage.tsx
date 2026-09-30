import { setSEOMeta } from "@/lib/seoHelpers";
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createQuestions, normalizeDomain } from '@/features/visibility/planning';

export default function AiVisibilityPage() {
  useEffect(() => { setSEOMeta({ title: "AI-synlighet – gratis svensk testplan | Updro", description: "Skapa 30 frågor för att undersöka hur ditt företag syns i AI-svar. Följ upp källor och konkreta åtgärder med Aurora Media.", canonical: "https://updro.se/ai-synlighet" }); }, []);
  const [domain, setDomain] = useState('');
  const [service, setService] = useState('');
  const [market, setMarket] = useState('Sverige');
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState('');
  return <><Navbar /><main className="container max-w-3xl space-y-6 py-16">
    <h1 className="font-display text-4xl font-bold">Syns ditt företag i AI-svaren?</h1>
    <p>Skapa en gratis testplan med 30 svenska frågor som potentiella kunder kan ställa. Testa frågorna i dina AI-tjänster och se vilka företag och källor som nämns.</p>
    <p className="text-sm text-muted-foreground">Detta är en testplan, inte en automatisk mätning av din synlighet. Formuläret skickar inga uppgifter till en AI-leverantör.</p>
    <form className="space-y-4 rounded-xl border p-6" onSubmit={e => { e.preventDefault(); try { normalizeDomain(domain); setQuestions(createQuestions(service, market)); setError(''); } catch (err) { setError(err instanceof Error ? err.message : 'Kontrollera uppgifterna.'); } }}>
      <div><Label htmlFor="audit-domain">Företagets domän</Label><Input id="audit-domain" required value={domain} onChange={e => setDomain(e.target.value)} placeholder="foretag.se" /></div>
      <div><Label htmlFor="audit-service">Vilken tjänst säljer ni?</Label><Input id="audit-service" required maxLength={120} value={service} onChange={e => setService(e.target.value)} placeholder="Redovisning" /></div>
      <div><Label htmlFor="audit-market">Marknad eller ort</Label><Input id="audit-market" required maxLength={120} value={market} onChange={e => setMarket(e.target.value)} /></div>
      <Button type="submit">Skapa min testplan</Button>
      {error && <p role="alert">{error}</p>}
    </form>
    {questions.length > 0 && <section className="space-y-4" aria-live="polite">
      <h2 className="text-2xl font-semibold">Dina 30 testfrågor</h2>
      <p>Spara datum, AI-tjänst, det exakta svaret och källorna. Ett enskilt svar är ett stickprov. Upprepa samma frågor nästa vecka för en jämförbar uppföljning.</p>
      <ol className="list-decimal space-y-2 pl-6">{questions.map(q => <li key={q}>{q}</li>)}</ol>
      <h2 className="text-2xl font-semibold">Vill du ha hjälp med analys och åtgärder?</h2>
      <p>Aurora Media kan hjälpa dig att granska svaren, prioritera faktasidor och följa upp förändringar. Omfattning och pris bestäms efter genomgång.</p>
      <div className="flex flex-wrap gap-3"><Button asChild><a href="https://auroramedia.se/kontakt">Prata med Aurora Media</a></Button><Button asChild variant="outline"><a href="/lokal-synlighet">Testa lokal synlighet</a></Button><Button asChild variant="outline"><Link to="/visibility-cloud">Se Visibility Cloud</Link></Button></div>
    </section>}
  </main><Footer /></>;
}
