import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
export default function CTASection() {
  return (
    <section className="final-cta container" aria-labelledby="slut-cta-rubrik">
      <div className="cta-orbit" aria-hidden="true" />
      <div className="eyebrow">Från ”vi borde” till ”nu kör vi”</div>
      <h2 id="slut-cta-rubrik">
        Ge din nästa idé
        <br />
        rätt förutsättningar.
      </h2>
      <Link className="button button-white" to="/publicera">
        Beskriv ditt projekt gratis <ArrowRight />
      </Link>
      <p>En förfrågan. Upp till tre offerter. Ditt val.</p>
    </section>
  );
}
