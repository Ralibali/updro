import { Link } from "react-router-dom";
import {
  ArrowRight,
  Code2,
  ShoppingBag,
  ChartNoAxesCombined,
  Diamond,
} from "lucide-react";
const services = [
  {
    icon: Code2,
    title: "Webb & utveckling",
    description: "Från första hemsidan till nästa digitala tjänst.",
    link: "Hitta en webbyrå",
    href: "/webbutveckling",
  },
  {
    icon: ShoppingBag,
    title: "E-handel",
    description: "Gör det enklare för dina besökare att bli kunder.",
    link: "Hitta e-handelskompetens",
    href: "/ehandel",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Digital marknadsföring",
    description: "Nå rätt människor med SEO, annonser och innehåll.",
    link: "Hitta en tillväxtpartner",
    href: "/digital-marknadsforing",
  },
  {
    icon: Diamond,
    title: "Design & varumärke",
    description: "Skapa en identitet som känns och en upplevelse som fungerar.",
    link: "Hitta en designbyrå",
    href: "/grafisk-design",
  },
];
export default function CategoriesSection() {
  return (
    <section className="services container" aria-labelledby="services-title">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Kompetens för ditt nästa steg</div>
          <h2 id="services-title">Vad vill du få att hända?</h2>
        </div>
        <Link to="/byraer" className="text-link">
          Se alla kompetenser <ArrowRight />
        </Link>
      </div>
      <div className="service-grid">
        {services.map((service) => (
          <Link to={service.href} key={service.href} className="service-card">
            <service.icon className="service-icon" />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <span>
              {service.link}
              <ArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
