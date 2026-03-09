import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SITE_URL = "https://updro.se";

// All known routes - kept in sync with the app
const staticPages = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/publicera", changefreq: "weekly", priority: "0.9" },
  { loc: "/byraer", changefreq: "weekly", priority: "0.8" },
  { loc: "/priser", changefreq: "weekly", priority: "0.8" },
  { loc: "/om-oss", changefreq: "monthly", priority: "0.6" },
  { loc: "/registrera/byra", changefreq: "monthly", priority: "0.7" },
  { loc: "/guider", changefreq: "weekly", priority: "0.7" },
  { loc: "/artiklar", changefreq: "weekly", priority: "0.8" },
  { loc: "/verktyg", changefreq: "weekly", priority: "0.8" },
  { loc: "/stader", changefreq: "weekly", priority: "0.8" },
  { loc: "/jamfor", changefreq: "weekly", priority: "0.8" },
  { loc: "/integritetspolicy", changefreq: "monthly", priority: "0.3" },
  { loc: "/villkor", changefreq: "monthly", priority: "0.3" },
];

// Pillar pages
const pillars = [
  "webbutveckling", "ehandel", "digital-marknadsforing", "grafisk-design",
  "seo", "app-utveckling", "mjukvaruutveckling", "google-ads", "ux-ui-design",
  "ai-utveckling",
];

const subPages: Record<string, string[]> = {
  "webbutveckling": ["pris", "stockholm", "goteborg", "malmo", "uppsala", "byra", "startup", "react", "nextjs"],
  "ehandel": ["pris", "stockholm", "goteborg", "malmo", "byra"],
  "digital-marknadsforing": ["pris", "stockholm", "goteborg"],
  "grafisk-design": ["pris", "stockholm"],
  "seo": ["pris", "stockholm", "goteborg"],
  "app-utveckling": ["pris", "stockholm"],
};

const cities = [
  "stockholm", "goteborg", "malmo", "uppsala", "linkoping", "orebro",
  "vasteras", "helsingborg", "norrkoping", "jonkoping", "lund", "umea",
];

const articles = [
  "vad-kostar-en-hemsida-2026", "basta-cms-2026",
  "wordpress-vs-webflow", "seo-guide-nyborjare",
];

const tools = ["hemsida-pris-kalkylator", "kravspecifikation-mall"];

const comparisons = [
  "basta-seo-byran", "basta-webbyran", "basta-ehandel-byran", "basta-app-byran",
];

serve(async () => {
  const today = new Date().toISOString().split("T")[0];

  const urls: string[] = [];

  const addUrl = (loc: string, changefreq: string, priority: string) => {
    urls.push(
      `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    );
  };

  // Static pages
  for (const p of staticPages) addUrl(p.loc, p.changefreq, p.priority);

  // Pillar pages
  for (const slug of pillars) {
    addUrl(`/${slug}`, "weekly", "0.9");
    const subs = subPages[slug];
    if (subs) {
      for (const sub of subs) addUrl(`/${slug}/${sub}`, "monthly", "0.7");
    }
  }

  // Cities
  for (const city of cities) addUrl(`/stader/${city}`, "monthly", "0.7");

  // Articles
  for (const slug of articles) addUrl(`/artiklar/${slug}`, "monthly", "0.7");

  // Tools
  for (const slug of tools) addUrl(`/verktyg/${slug}`, "monthly", "0.7");

  // Comparisons
  for (const slug of comparisons) addUrl(`/${slug}`, "monthly", "0.8");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex",
    },
  });
});
