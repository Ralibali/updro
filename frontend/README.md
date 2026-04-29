# Updro

Sveriges marknadsplats för digitala uppdrag. Beskriv ditt projekt och få upp till fem offerter från kvalitetssäkrade digitala byråer inom 24 timmar.

**Live:** https://updro.se

## Tjänster

Updro matchar köpare och digitala byråer inom:

- Webbutveckling och hemsidor
- SEO och innehållsmarknadsföring
- Google Ads och Meta Ads
- E-handel (Shopify, WooCommerce, Centra)
- Apputveckling
- Digital marknadsföring
- Design och varumärke

## Affärsmodell

- **Köpare:** Helt gratis. Publicerar uppdrag, jämför offerter, väljer byrå.
- **Byråer:** 119 kr per upplåst lead, eller månadskort 1 995 kr/mån för obegränsad åtkomst. 7 dagars gratis premium-trial.

## Tech stack

- **Frontend:** React 18 + TypeScript, Vite 5, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (Supabase) – Postgres, Auth, Edge Functions, Storage
- **Betalningar:** Stripe (subscriptions + one-time leads)
- **E-post:** Resend via auth-email-hook Edge Function
- **AI:** Lovable AI Gateway (Gemini 2.5 / GPT-5) för artikelgenerering
- **Hosting:** Lovable

## SEO-strategi

Updro använder programmatisk SEO för att täcka kombinationer av tjänst × stad:

- ~25 städer × 10 tjänstekategorier = 250 city-category sidor
- Pillar pages + sub-pages för varje tjänst
- Artikelhubb med löpande publicering via AI-pipeline + redaktionell granskning
- Verktygssidor (priskalkylator, etc.)
- Jämförelsesidor (Wix vs Squarespace, etc.)

Alla publika sidor har:
- Unik `<title>` och `<meta description>`
- Självrefererande `<link rel="canonical">`
- `robots: index, follow, max-image-preview:large, max-snippet:-1`
- OG / Twitter-metadata
- JSON-LD structured data (Article, Service, BreadcrumbList, FAQPage, LocalBusiness)
- Genererad sitemap vid build

App-, konto- och admin-sidor har `noindex, nofollow` och är inte i sitemap.

### Prerendering

För att Google ska få full HTML utan att vänta på klient-JS finns react-snap konfigurerat:

```bash
npm run build
npm run prerender   # Kräver lokal Chromium / Puppeteer
```

Detta är ett valbart steg som körs lokalt eller i CI – inte i Lovable's hosting build.

## Utveckling

```bash
npm install
npm run dev
```

Kräver Node 20+. Miljövariabler för Supabase finns i `.env` och hanteras automatiskt av Lovable Cloud.

## Test

```bash
npm test
```

## Kontakt

[info@auroramedia.se](mailto:info@auroramedia.se)

Updro drivs av **Aurora Media AB**.
