# Updro – emergent branch

Den här branchen är **inte main** och ska inte mergas rakt in i `main` utan granskning.

Syftet med `emergent` är att samla de ändringar Emergent gjorde, färdigställa dem här och sedan välja ut vad som tryggt ska importeras till `main`.

## Vad Emergent gjorde i denna branch

- Flyttade React/Vite-appen till `frontend/`.
- Lade till SEO-prerendering vid build.
- Lade till dynamisk sitemap-generering.
- Lade till förbättrad cookie consent för GA4/Google Ads.
- Lade till en enkel FastAPI-backend-scaffold i `backend/`.
- Lade till ny frontend-dokumentation.

## Viktigt: main ska inte påverkas

Allt arbete ska ske i `emergent` tills branchen är verifierad.

Rekommenderat flöde:

1. Färdigställ och testa `emergent`.
2. Kör build och verifiera `frontend/dist`.
3. Granska diffen mot `main`.
4. Importera bara de ändringar som faktiskt ska med.
5. Mergas först när allt är kontrollerat.

## Projektstruktur

Den aktiva webbappen ligger i:

```bash
frontend/
```

Backend-logiken för den riktiga Updro-produkten ligger i Supabase och Supabase Edge Functions under:

```bash
frontend/supabase/
```

Mappen `backend/` är en Emergent/FastAPI-scaffold och är inte produktionsbackend för Updro i nuläget.

## Snabbstart från repo-roten

Root-kommandona skickar vidare till `frontend/`.

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
```

## Direkt i frontend-katalogen

```bash
cd frontend
npm install
npm run dev
npm run build
npm run preview
npm test
```

## Deployment-test av emergent

Om hostingen kör från repo-roten:

- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Publish directory:** `frontend/dist`

Om hostingen kör med `frontend/` som projektrot:

- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

## SEO/prerendering

`npm run build` i `frontend/` kör Vite-builden och den inbyggda SEO-prerender-pluginen. Den ska generera:

- route-specifika HTML-filer
- unika title/meta/canonical per SEO-sida
- JSON-LD/structured data
- `sitemap.xml`
- `sitemap-index.xml`
- sektionsbaserade sitemaps

Det här är avsett att fungera utan Chromium/Puppeteer i hostingmiljön.

## Kontrollista innan import till main

- [ ] `npm install` fungerar från repo-roten.
- [ ] `npm run build` fungerar från repo-roten.
- [ ] `frontend/dist/index.html` skapas.
- [ ] `frontend/dist/sitemap.xml` skapas.
- [ ] `frontend/dist/sitemap-index.xml` skapas.
- [ ] Minst en SEO-route får egen prerenderad HTML-fil, till exempel `frontend/dist/hitta-webbyra/index.html`.
- [ ] Startsidan fungerar visuellt.
- [ ] Publicera uppdrag-flödet fungerar.
- [ ] Login/register fungerar.
- [ ] Dashboard/admin skyddas korrekt.
- [ ] Cookie consent blockerar GA/Ads innan samtycke.
- [ ] Endast önskade filer importeras till `main`.

## Kontakt

[info@auroramedia.se](mailto:info@auroramedia.se)

Updro drivs av **Aurora Media AB**.
