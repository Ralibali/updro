import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { trackLeadStarted } from "@/lib/analytics";
import { trackClick } from "@/hooks/usePageTracking";
import ExampleOffersSection from "./ExampleOffersSection";

export default function HeroSection() {
  const startProject = () => {
    trackLeadStarted("homepage_hero");
    trackClick("lead_started", "Hitta min byrå", { source: "homepage_hero" });
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
          Stora idéer. Rätt människor.
        </div>
        <h1 id="hero-title">
          Ditt nästa steg börjar
          <br />
          med <em>rätt digital byrå.</em>
        </h1>
        <p className="hero-description">
          En ny hemsida. Ett starkare varumärke. Mer tillväxt.
          <br className="desktop-break" /> Beskriv ditt projekt och jämför upp
          till tre relevanta offerter.
        </p>
        <div className="hero-actions">
          <Link className="button" to="/publicera" onClick={startProject}>
            Hitta min byrå <ArrowRight />
          </Link>
          <a className="text-link" href="#hur-det-fungerar">
            Så fungerar Updro{" "}
            <span className="play-icon" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
        <div className="reassurance">
          <span>
            <Check /> Gratis för beställare
          </span>
          <span>
            <Check /> Du väljer om du vill gå vidare
          </span>
        </div>
      </div>
      <ExampleOffersSection />
    </section>
  );
}
