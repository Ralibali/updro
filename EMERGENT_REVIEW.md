# Emergent review – vad ska göras klart innan import till main

Den här filen finns för att skydda `main`. `emergent` ska granskas, färdigställas och testas innan något importeras.

## Status

`emergent` innehåller stora ändringar från Emergent:

- frontend flyttad till `frontend/`
- SEO-prerendering vid build
- sitemap-generering vid build
- cookie consent/GA4/Google Ads-ändringar
- enkel FastAPI-scaffold i `backend/`
- root-skript för att kunna köra appen från repo-roten

## Viktigt beslut

Importera inte hela branchen rakt in i `main`.

Rekommenderat är att antingen:

1. cherry-picka specifika commits/ändringar, eller
2. skapa en separat PR där varje filgrupp granskas, eller
3. manuellt föra över bara de delar som ska med.

## Vad som sannolikt ska importeras till main

### Bör granskas för import

- `frontend/vite.config.ts` – SEO-prerender och sitemap-plugin
- `frontend/src/prerender/prerender.ts` – route-specifik HTML för SEO
- `frontend/src/main.tsx` – hantering av SEO-prerender-shell före React mount
- `frontend/src/components/CookieConsent.tsx` – consent-gated GA4/Ads
- `frontend/package.json` – städade scripts och buildflöde
- `README.md` eller motsvarande dokumentation, om projektet även ska ligga i `frontend/`

### Bör troligen inte importeras till main utan separat beslut

- `backend/` – detta är bara en Emergent/FastAPI-scaffold, inte Updros riktiga backend
- `.emergent/`
- `memory/`
- `test_reports/`
- `test_result.md`
- `.gitconfig`

### Kräver extra försiktighet

- Flytten av hela appen från repo-roten till `frontend/`
- Borttagning av gamla statiska sitemap-filer i `public/`
- `frontend/package-lock.json`, eftersom lockfilen bör regenereras lokalt efter ändringar i beroenden

## Kontroll före teknisk import

Kör från repo-roten på `emergent`:

```bash
npm install
npm run lint
npm test
npm run build
```

Verifiera att följande filer skapas:

```bash
frontend/dist/index.html
frontend/dist/sitemap.xml
frontend/dist/sitemap-index.xml
frontend/dist/hitta-webbyra/index.html
frontend/dist/artiklar/index.html
frontend/dist/verktyg/index.html
```

Kontrollera även att prerenderad SEO-sida innehåller unik metadata:

```bash
grep -i "<title" frontend/dist/hitta-webbyra/index.html
grep -i "canonical" frontend/dist/hitta-webbyra/index.html
grep -i "application/ld+json" frontend/dist/hitta-webbyra/index.html
```

## Manuell QA före import

- [ ] Startsidan laddar korrekt.
- [ ] `/publicera` fungerar.
- [ ] `/byraer` fungerar.
- [ ] `/hitta-webbyra` fungerar.
- [ ] `/hitta-seo-byra` fungerar.
- [ ] `/artiklar` fungerar.
- [ ] `/verktyg` fungerar.
- [ ] `/stader` fungerar.
- [ ] Login fungerar.
- [ ] Registrering fungerar.
- [ ] Buyer dashboard är skyddad.
- [ ] Supplier dashboard är skyddad.
- [ ] Admin är skyddad.
- [ ] Cookie-banner visas för ny besökare.
- [ ] GA/Ads laddas inte före samtycke.
- [ ] GA/Ads laddas efter “Acceptera alla”.

## Importstrategi till main

När `emergent` är verifierad:

1. Skapa en ny branch från `main`, till exempel `import/emergent-seo-prerender`.
2. Importera endast de filer som behövs.
3. Kör `npm install`, `npm test`, `npm run build`.
4. Skapa PR mot `main`.
5. Granska diffen fil för fil.
6. Mergas först när produkten fungerar.

## Rekommenderad första import

Första PR:n bör helst bara handla om SEO/prerender:

- Vite-plugin för sitemap/prerender
- `src/prerender/prerender.ts`
- eventuell justering i `src/main.tsx`
- dokumentation

Ta inte med `backend/` i första importen.
