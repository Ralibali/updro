import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, Search, Star, TriangleAlert } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSEOMeta } from "@/lib/seoHelpers";

type Answer = "yes" | "no" | "unknown";

type Check = {
  id: string;
  label: string;
  hint: string;
  weight: number;
  action: string;
};

const checks: Check[] = [
  {
    id: "verified",
    label: "Google-företagsprofilen är verifierad och går att administrera",
    hint: "Ni kan logga in, ändra information och se profilens statistik.",
    weight: 20,
    action: "Säkerställ ägarskap och verifiering av Google-företagsprofilen.",
  },
  {
    id: "category",
    label: "Primär kategori och tjänster beskriver vad ni faktiskt säljer",
    hint: "Rätt kategori är viktigare än att lägga in så många kategorier som möjligt.",
    weight: 10,
    action: "Granska primär kategori, sekundära kategorier och tjänstelistan.",
  },
  {
    id: "hours",
    label: "Öppettider, telefon, webbplats och adress är aktuella",
    hint: "Felaktiga basuppgifter skapar både tappade kunder och inkonsekventa signaler.",
    weight: 10,
    action: "Rätta öppettider och företagsuppgifter i profil och kataloger.",
  },
  {
    id: "fresh_reviews",
    label: "Ni har fått nya riktiga recensioner de senaste 90 dagarna",
    hint: "Färska recensioner visar att verksamheten är aktiv och ger kunder aktuellt beslutsunderlag.",
    weight: 20,
    action: "Skapa ett enkelt, återkommande flöde för att be nöjda kunder om recensioner.",
  },
  {
    id: "responses",
    label: "Ni svarar löpande på både positiva och negativa recensioner",
    hint: "Svar ska vara sakliga och mänskliga – inte massproducerade standardsvar.",
    weight: 10,
    action: "Inför en rutin för att besvara nya recensioner inom några arbetsdagar.",
  },
  {
    id: "local_page",
    label: "Webbplatsen har en tydlig sida för orten och tjänsterna ni erbjuder där",
    hint: "En riktig lokal sida ska ha eget innehåll och beskriva faktisk verksamhet på orten.",
    weight: 10,
    action: "Bygg eller förbättra en lokal landningssida som matchar verklig verksamhet.",
  },
  {
    id: "schema",
    label: "Webbplatsen har korrekt LocalBusiness/Organization-schema",
    hint: "Strukturerad data hjälper sökmotorer förstå företagets identitet och basuppgifter.",
    weight: 10,
    action: "Kontrollera strukturerad data och att namn, adress och kontaktuppgifter stämmer.",
  },
  {
    id: "consistent_nap",
    label: "Företagsnamn, adress och telefon är konsekventa på viktiga kataloger",
    hint: "Små skillnader är inte alltid kritiska, men gamla adresser och nummer bör bort.",
    weight: 10,
    action: "Inventera viktiga kataloger och rätta gamla eller motstridiga företagsuppgifter.",
  },
];

const scoreLabel = (score: number) => {
  if (score >= 85) return { title: "Stark grund", text: "Ni har det mesta på plats. Fokusera på kontinuitet, mätning och att slå lokala konkurrenter på kvalitet." };
  if (score >= 60) return { title: "Bra grund med tydliga luckor", text: "Ni har flera viktiga delar på plats, men missar sannolikt synlighet eller konvertering på några konkreta punkter." };
  if (score >= 35) return { title: "Stor förbättringspotential", text: "Flera grundsignaler saknas eller är osäkra. Börja med profil, recensioner och korrekta företagsuppgifter." };
  return { title: "Börja med grunden", text: "Den lokala närvaron behöver struktureras innan ni lägger pengar på mer avancerad lokal SEO." };
};

export default function LocalVisibilityPage() {
  useEffect(() => {
    setSEOMeta({
      title: "Gratis lokal synlighetsaudit – Google Maps & recensioner | Updro",
      description: "Gör en snabb självskattning av Google-företagsprofil, recensioner, lokala sidor och företagsuppgifter. Få en prioriterad åtgärdslista direkt.",
      canonical: "https://updro.se/lokal-synlighet",
    });
  }, []);

  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const answered = checks.filter((check) => answers[check.id]);
    const earned = checks.reduce((sum, check) => sum + (answers[check.id] === "yes" ? check.weight : 0), 0);
    const unknownWeight = checks.reduce((sum, check) => sum + (answers[check.id] === "unknown" ? check.weight : 0), 0);
    const missing = checks.filter((check) => answers[check.id] !== "yes").sort((a, b) => b.weight - a.weight);
    return {
      score: earned,
      answered: answered.length,
      unknownWeight,
      missing,
      label: scoreLabel(earned),
    };
  }, [answers]);

  const complete = checks.every((check) => Boolean(answers[check.id]));

  return (
    <>
      <Navbar />
      <main className="container max-w-4xl py-14 md:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="h-6 w-6" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Hur stark är din lokala synlighet?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Gör en snabb självskattning av Google-företagsprofil, recensioner, lokala sidor och företagsuppgifter.
            Du får en prioriterad åtgärdslista direkt.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Ingen extern Google-data hämtas i detta test. Resultatet bygger på dina svar och är en nulägescheck – inte en rankingmätning.
          </p>
        </section>

        <section className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-card p-5 shadow-sm md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="local-business">Företag</Label>
              <Input id="local-business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Företag AB" maxLength={120} />
            </div>
            <div>
              <Label htmlFor="local-city">Viktigaste ort</Label>
              <Input id="local-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Linköping" maxLength={120} />
            </div>
          </div>

          <div className="mt-7 space-y-4">
            {checks.map((check, index) => (
              <fieldset key={check.id} className="rounded-xl border p-4">
                <legend className="px-1 text-sm font-semibold">{index + 1}. {check.label}</legend>
                <p className="mt-1 text-sm text-muted-foreground">{check.hint}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {([
                    ["yes", "Ja"],
                    ["no", "Nej"],
                    ["unknown", "Vet inte"],
                  ] as const).map(([value, label]) => {
                    const active = answers[check.id] === value;
                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => {
                          setAnswers((current) => ({ ...current, [check.id]: value }));
                          setShowResult(false);
                        }}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                        aria-pressed={active}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={() => setShowResult(true)} disabled={!complete}>
              <Search className="mr-2 h-4 w-4" /> Visa min audit
            </Button>
            <span className="text-sm text-muted-foreground">{result.answered}/{checks.length} frågor besvarade</span>
          </div>
        </section>

        {showResult && complete && (
          <section className="mx-auto mt-8 max-w-3xl space-y-6" aria-live="polite">
            <div className="rounded-2xl border bg-card p-6 md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {business.trim() || "Företaget"}{city.trim() ? ` · ${city.trim()}` : ""}
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold">{result.label.title}</h2>
                  <p className="mt-2 max-w-2xl text-muted-foreground">{result.label.text}</p>
                </div>
                <div className="shrink-0 rounded-2xl border bg-background px-6 py-4 text-center">
                  <div className="font-display text-4xl font-bold tabular-nums">{result.score}</div>
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">av 100</div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${result.score}%` }} />
              </div>
              {result.unknownWeight > 0 && (
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {result.unknownWeight} poäng ligger på sådant ni svarade "vet inte" på. Verifiera dem innan ni drar slutsatser.
                </p>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-6 md:p-8">
              <h2 className="font-display text-2xl font-bold">Prioriterade nästa steg</h2>
              <p className="mt-2 text-sm text-muted-foreground">Högst vikt först. Gör grunden innan ni lägger tid på finlir.</p>
              <div className="mt-5 space-y-3">
                {result.missing.length ? result.missing.map((check, index) => (
                  <div key={check.id} className="flex gap-3 rounded-xl border p-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</div>
                    <div>
                      <p className="font-medium">{check.action}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Status: {answers[check.id] === "unknown" ? "behöver verifieras" : "saknas enligt ditt svar"} · vikt {check.weight}/100
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="flex gap-3 rounded-xl border p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <p>Alla grundkontroller är markerade som klara. Nästa steg är riktig konkurrens- och rankingmätning.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-primary p-6 text-primary-foreground md:p-8">
              <div className="flex items-start gap-3">
                <Star className="mt-1 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="font-display text-2xl font-bold">Vill du att en byrå gör jobbet?</h2>
                  <p className="mt-2 max-w-2xl text-primary-foreground/85">
                    Beskriv vad du vill förbättra. Updro matchar uppdraget med relevanta digitala byråer och högst tre kan lämna offert.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button asChild variant="secondary">
                      <Link to="/publicera/seo">Beskriv projektet</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      <Link to="/ai-synlighet">Testa även AI-synlighet</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      <Link to="/visibility-cloud">Se Visibility Cloud</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
