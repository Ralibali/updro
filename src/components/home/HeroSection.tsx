import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { trackLeadStarted } from "@/lib/analytics";
import { trackClick } from "@/hooks/usePageTracking";
import ExampleOffersSection from "./ExampleOffersSection";

const QUICK_STARTS = [
  { label: "Ny hemsida", category: "Webbutveckling", seed: "Vi behöver en ny hemsida för vårt företag. " },
  { label: "Webbshop", category: "E-handel", seed: "Vi vill starta eller bygga om vår webbshop. " },
  { label: "Synas på Google", category: "SEO", seed: "Vi vill synas bättre på Google och få fler kunder via sök. " },
  { label: "Logga & varumärke", category: "Grafisk design/UX", seed: "Vi behöver en ny logga och grafisk profil. " },
  { label: "App", category: "App-utveckling", seed: "Vi vill ta fram en app för " },
  { label: "AI-lösning", category: "AI-utveckling", seed: "Vi vill använda AI för att " },
] as const;

const PLACEHOLDER =
  "T.ex. Vi är en byggfirma i Göteborg och behöver en ny hemsida som ger fler offertförfrågningar…";

export default function HeroSection() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const pickQuickStart = (item: (typeof QUICK_STARTS)[number]) => {
    setCategory(item.category);
    setDescription((current) => (current.trim() ? current : item.seed));
    trackClick("hero_quick_start", item.label, { category: item.category });
    document.getElementById("hero-brief")?.focus();
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const text = description.trim();
    const params = new URLSearchParams();
    if (category) params.set("kategori", category);
    if (text) params.set("beskrivning", text.slice(0, 2000));
    trackLeadStarted("homepage_hero");
    trackClick("lead_started", "Få offerter", {
      source: "homepage_hero",
      has_description: Boolean(text),
      category: category || "none",
    });
    const query = params.toString();
    navigate(query ? `/publicera?${query}` : "/publicera");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) submit();
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      {["left", "right"].map((side) => (
        <div key={side} className={`halo halo-${side}`} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
      ))}
      <div className="hero-content">
        <div className="eyebrow hero-eyebrow">
          <span className="tiny-mark" aria-hidden="true">
            ↗
          </span>{" "}
          Gratis för beställare · Max tre offerter
        </div>
        <h1 id="hero-title">
          Beskriv projektet.
          <br />
          <em>Få tre offerter från rätt byrå.</em>
        </h1>
        <p className="hero-description">
          Hemsida, webbshop, SEO eller AI – skriv med egna ord vad du behöver.
          <br className="desktop-break" /> Vi granskar briefen och högst tre
          relevanta byråer får lämna offert. Inga massutskick.
        </p>

        <form
          id="homepage-project-form"
          className="hero-brief"
          onSubmit={submit}
          aria-label="Starta din förfrågan"
        >
          <label htmlFor="hero-brief" className="sr-only">
            Beskriv ditt projekt
          </label>
          <textarea
            id="hero-brief"
            rows={3}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDER}
          />
          <div className="hero-brief-footer">
            <div className="hero-chips" role="group" aria-label="Snabbval">
              {QUICK_STARTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={category === item.category}
                  onClick={() => pickQuickStart(item)}
                  className="hero-chip"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button type="submit" className="button hero-submit">
              Få offerter gratis <ArrowRight />
            </button>
          </div>
        </form>

        <div className="reassurance">
          <span>
            <Check /> Inget konto krävs
          </span>
          <span>
            <Lock /> Dina uppgifter delas bara med byråer som väljer ditt uppdrag
          </span>
          <span>
            <ShieldCheck /> Du väljer själv om du går vidare
          </span>
        </div>
        <p className="hero-secondary">
          <Sparkles aria-hidden="true" /> Osäker på budget?{" "}
          <a href="#prisindikator">Se vad projekt brukar kosta</a> ·{" "}
          <Link to="/for-byraer">Är du byrå?</Link>
        </p>
      </div>
      <ExampleOffersSection />
    </section>
  );
}
