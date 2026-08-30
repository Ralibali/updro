import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Sitemap edge function.
 *
 * STATUS: Effektivt oanvänd. robots.txt pekar på den statiska
 * https://updro.se/sitemap-index.xml som genereras vid build
 * (vite.config.ts + src/lib/seoStatic.ts, sektioner: main, cities,
 * articles, tools, comparisons). Ingen publik länk refererar denna
 * edge function.
 *
 * Tidigare version pekade på /sitemap-artiklar.xml och /sitemap-stader.xml
 * (båda 404) och listade legacy-URL:er (/guider, /kunskapsbank,
 * /registrera/byra). För att undvika att någon råkar använda gammal data
 * svarar funktionen nu med redirects till de kanoniska statiska
 * sitemap-filerna istället för egen, efterhängsen XML.
 */

const SITE_URL = "https://updro.se";

// Måste matcha SITEMAP_SECTIONS i src/lib/seoStatic.ts.
const SECTIONS = ["main", "cities", "articles", "tools", "comparisons"];

const headers = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
  "X-Robots-Tag": "noindex",
};

const redirect = (location: string) =>
  new Response(null, {
    status: 301,
    headers: { ...headers, Location: location },
  });

serve(async (req) => {
  const path = new URL(req.url).pathname;

  // /sitemap.xml och /sitemap-index.xml -> statiskt index
  if (path.endsWith("/sitemap.xml") || path.endsWith("/sitemap-index.xml")) {
    return redirect(`${SITE_URL}/sitemap-index.xml`);
  }

  // /sitemap-<sektion>.xml -> motsvarande statiska sektionsfil
  const sectionMatch = path.match(/\/sitemap-([a-z]+)\.xml$/);
  if (sectionMatch && SECTIONS.includes(sectionMatch[1])) {
    return redirect(`${SITE_URL}/sitemap-${sectionMatch[1]}.xml`);
  }

  // Okända (bl.a. gamla /sitemap-artiklar.xml och /sitemap-stader.xml) -> index
  return redirect(`${SITE_URL}/sitemap-index.xml`);
});
