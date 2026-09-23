import { Link } from "react-router-dom";
import { ArrowRight, Check, Code2 } from "lucide-react";
const examples = [
  {
    name: "A",
    service: "Design & utveckling",
    price: "45 000",
    time: "4–6 veckor",
    items: ["Skräddarsydd design", "Enkel innehållshantering", "Teknisk SEO"],
    focus: "För en stark första känsla",
  },
  {
    name: "B",
    service: "Strategi & webb",
    price: "58 000",
    time: "6–8 veckor",
    items: ["Strategisk workshop", "Design & utveckling", "Innehållsstrategi"],
    focus: "För ett större helhetsgrepp",
  },
  {
    name: "C",
    service: "Webb & tillväxt",
    price: "49 000",
    time: "4–5 veckor",
    items: ["Konverteringsfokus", "Design & utveckling", "Analys & mätning"],
    focus: "För nästa steg i tillväxten",
  },
];
export default function ExampleOffersSection() {
  return (
    <div
      className="comparison-shell container"
      aria-label="Illustrativt exempel på offertjämförelse"
    >
      <div className="comparison-top">
        <div className="project-icon">
          <Code2 />
        </div>
        <div className="project-heading">
          <span>Ditt nästa projekt</span>
          <strong>En hemsida som tar företaget vidare</strong>
        </div>
        <span className="example-label">Illustrativt exempel</span>
      </div>
      <div className="comparison-body">
        <div className="comparison-intro">
          <div className="eyebrow">Färre offerter. Bättre överblick.</div>
          <h2>
            Tre perspektiv.
            <br />
            Ditt beslut.
          </h2>
          <p>
            Jämför pris, upplägg och kompetens. Hitta samarbetet som passar dig.
          </p>
          <Link to="/byraer" className="text-link">
            Utforska byråer <ArrowRight />
          </Link>
        </div>
        <div className="offer-grid">
          {examples.map((offer) => (
            <article
              key={offer.name}
              className={`offer-card ${offer.name === "B" ? "offer-featured" : ""}`}
            >
              <div className="offer-identity">
                <div className={`agency-icon icon-${offer.name.toLowerCase()}`}>
                  {offer.name}
                </div>
                <div>
                  <h3>Byrå {offer.name}</h3>
                  <span>{offer.service}</span>
                </div>
              </div>
              <div className="offer-price">
                {offer.price} <span>kr</span>
              </div>
              <p className="offer-time">Leveranstid · {offer.time}</p>
              <div className="offer-divider" />
              <ul>
                {offer.items.map((item) => (
                  <li key={item}>
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
              <span className="offer-specialty">{offer.focus}</span>
            </article>
          ))}
        </div>
      </div>
      <p className="example-note">
        Fiktiva byråer och priser visar hur en jämförelse kan se ut. Dina
        offerter beror på projektets omfattning.
      </p>
    </div>
  );
}
