# Updro → Vercel

Målarkitektur:

- GitHub = source of truth
- Vercel = frontend preview + production
- Supabase/Lovable Cloud = befintlig databas, auth och Edge Functions
- Stripe/Resend = ligger kvar mot befintlig backend

Den här migrationen flyttar inte databasen eller Edge Functions.

## Build

Projektet är Vite + React och använder Bun 1.2.0 enligt `packageManager`.

- Install: `bun install --frozen-lockfile`
- Build: `bun run build`
- Output: `dist`
- Builden skapar även statisk SEO-HTML och sitemap-filer via `scripts/prerender.mjs` och Vite SEO-pluginen.
- Prerender skriver både `dist/<path>/index.html` och `dist/<path>.html`. `vercel.json` använder `cleanUrls` så Vercel hittar den route-specifika filen innan SPA-fallbacken (`/index`) körs. `/sitemap.xml` och `/robots.txt` har filändelse och fångas inte av den fallbacken.

## Miljö

Verifiera Preview och Production mot samma avsedda Supabase-projekt innan cutover.
Projektet har befintliga publika Vite/Supabase-konfigurationsvärden; skapa inte nya hemligheter i git.
Server-side secrets för Stripe, Resend och Supabase Edge Functions ligger fortsatt i backendens secrets och ska inte kopieras till frontend.

## Preview QA – måste passera före merge/cutover

1. `/` laddar Updro.
2. `/publicera` och `/publicera/webbutveckling` laddar direkt på URL, inte bara via intern navigation.
3. `/publicera` step 1 har en skrivyta och senaste 312→6-fixen finns med.
4. `/logga-in`, `/registrera/byra`, `/dashboard/*` och `/admin/*` fungerar som SPA-routes och privata routes är noindex.
5. Minst tre prerenderade publika SEO-routes ger korrekt route-specifik HTML/title/canonical, inte generisk SPA-HTML. Verifiera `/`, `/publicera` och `/webbutveckling`. `/publicera/webbutveckling` är en SPA-prefill och prerenderas inte — samma homepage-skal som på Lovable prod är förväntat.
6. `/sitemap.xml`, `/sitemap-index.xml`, sektions-sitemaps och `/robots.txt` returnerar rätt filer och Content-Type.
7. Befintliga 301-redirects i `public/_redirects` ger permanenta redirects även på Vercel.
8. Supabase auth och publik brief-submit fungerar mot befintlig backend.
9. Plausible laddar och den mergeade funnel-tracking-koden fungerar utan `/admin`-/`/dashboard` pageviews.
10. Ingen Stripe-livebetalning görs som test. Verifiera endast säkra checkout/callback-flöden enligt befintlig testpolicy.
11. Mobil och desktop saknar P0/P1-fel och browser console är ren i kärnflöden.

Om prerenderade routes fångas av SPA-fallbacken ska rewrite-konfigurationen korrigeras före merge; SEO får inte offras för migrationen. SPA-fallbacken ska bara gälla routes som saknar prerenderad HTML, t.ex. `/logga-in`, `/dashboard/*` och `/publicera/:kategori`.

## Production cutover

Först när Preview QA är grön:

1. Merge till `main`.
2. Bekräfta automatisk production deployment i Vercel.
3. Lägg till `updro.se` och `www.updro.se` på rätt Vercel-projekt.
4. Använd exakt DNS-konfiguration som Vercel visar för projektet.
5. Behåll tidigare hosting som rollback tills auth, brief-submit, tracking, SEO och kritiska routes är verifierade på custom domain.
6. Markera inte migrationen DONE förrän manuell Lovable Publish inte längre behövs.
