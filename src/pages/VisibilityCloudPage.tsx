import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, Check, MapPin, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { setSEOMeta } from "@/lib/seoHelpers";
import { VISIBILITY_PLANS, formatVisibilityCadence } from "@/features/visibility/plans";

export default function VisibilityCloudPage() {
  useEffect(() => {
    setSEOMeta({
      title: "Visibility Cloud – följ AI- och lokal synlighet | Updro",
      description:
        "Samla AI-observationer, lokal synlighetsaudit, mäthistorik och åtgärder i ett löpande Updro-flöde. Pilotpaket från 299 kr/mån.",
      canonical: "https://updro.se/visibility-cloud",
    });
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b bg-gradient-to-b from-primary/5 to-background">
          <div className="container max-w-5xl py-16 md:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Updro Visibility Cloud
              </p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">
                Följ vad kunder och AI faktiskt ser.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Visibility Cloud samlar Updros AI-synlighetsarbete, lokal audit, källor,
                mäthistorik och åtgärdskö i ett återkommande kundflöde. Du ser bevisen bakom
                varje fynd i stället för ett påhittat totalscore.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/ai-synlighet">
                    Testa AI-synlighet <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/lokal-synlighet">Gör lokal audit</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container max-w-5xl py-14">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: "AI-observationer",
                body: "Spara exakt fråga, leverantör, svar, källor och datum. Updro skiljer verifierade stickprov från generella påståenden.",
              },
              {
                icon: MapPin,
                title: "Lokal synlighet",
                body: "Kombinera AI-arbetet med Google-företagsprofil, recensioner, lokala sidor och konsekventa företagsuppgifter.",
              },
              {
                icon: ShieldCheck,
                title: "Åtgärder med bevis",
                body: "Varje fynd kan bli en faktasida, schemafix, intern länk, källrättning eller content brief i en spårbar kö.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border bg-card p-6">
                <item.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 font-display text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="container max-w-6xl py-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Pilotpaket
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">Enkel prissättning för löpande uppföljning</h2>
              <p className="mt-3 text-muted-foreground">
                Paketen styr arbetsyta, uppföljningsrytm och omfattning. Externa datakällor som kräver
                separat API eller leverantörsavtal aktiveras först när de är tekniskt verifierade.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {Object.values(VISIBILITY_PLANS).map((plan) => (
                <article
                  key={plan.key}
                  className={`rounded-2xl border bg-card p-6 ${plan.key === "growth" ? "border-primary shadow-sm" : ""}`}
                >
                  <p className="text-sm font-semibold">{plan.name}</p>
                  <p className="mt-3 font-display text-4xl font-bold tabular-nums">
                    {plan.priceSek.toLocaleString("sv-SE")} kr
                    <span className="text-sm font-medium text-muted-foreground">/mån</span>
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatVisibilityCadence(plan.cadence)}
                  </p>
                  <ul className="mt-5 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full" variant={plan.key === "growth" ? "default" : "outline"}>
                    <Link to="/publicera/seo">Starta via Updro</Link>
                  </Button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container max-w-4xl py-14">
          <h2 className="font-display text-3xl font-bold">Vad som är live – och vad som inte låtsas vara live</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border p-5">
              <h3 className="font-semibold">Live i arbetsflödet</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>AI-testplaner och verifierade observationer</li>
                <li>Mäthistorik för serveranslutna AI-kontroller</li>
                <li>Lokal självskattningsaudit</li>
                <li>Åtgärdskö och veckorapport</li>
                <li>Molnsparade kundarbetsytor för Updro-admin</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-5">
              <h3 className="font-semibold">Aktiveras först efter verifierad integration</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Automatisk Google Maps-grid</li>
                <li>Search Console-data</li>
                <li>Teknisk crawler som återkommande datakälla</li>
                <li>Automatisk publicering eller ändring av kundens webbplats</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
