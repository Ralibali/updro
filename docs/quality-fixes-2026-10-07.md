# Kategorier och kontoåterhämtning, 7 oktober 2026

Google Ads är nu en egen kategori i navigation, brief, publicering, byråfilter,
registrering, profil och servervalidering. Kategoriernas lagrade värden, namn,
slugs och alias kommer från `supabase/functions/_shared/categories.ts`.
Äldre databasvärden behålls så att befintliga matchningar fortsätter fungera.
Befintliga byråer kan lägga till Google Ads i sin profil. Historiska uppdrag
klassas inte om automatiskt eftersom deras ursprungliga avsikt inte är säker.

Support har fått hjälpinnehåll och kontaktväg. `/ux-webbdesign` omdirigeras till
`/webbdesign`. Webbplatsfältet för spamfiltrering är helt dolt. Kategorinamn,
Göteborg och erbjudandet ”5 gratis leads” visas konsekvent. Länken ”Läs om oss”
öppnas redan i ny flik; detta täcks nu av formulärtestet.

Inloggningen skiljer mellan fel uppgifter och obekräftad e-post.
Bekräftelsemejl kan skickas igen från inloggningen och efter misslyckad
registrering, med spärr mot upprepade klick. Signup-mejlets länk går till
`https://updro.se/bekrafta-epost`. Token ligger i URL-fragmentet, rensas från
adressfältet och förbrukas först när användaren trycker på bekräftelseknappen.
Verifieringen använder Supabase `verifyOtp` och skapar en vanlig session.
Utgångna länkar erbjuder inloggning och ny bekräftelse.

## Driftsättning

Ingen databasmigrering behövs. Git-synk till Lovable driftsätter inte ändrade
Edge Functions. Använd följande ordning:

1. Synka committen till Updros Lovable-projekt.
2. Driftsätt `create-account`, `submit-guest-lead`, `analyze-brief` och
   `improve-description`, inklusive den delade kategorifilen.
3. Publicera webbappen så att `/bekrafta-epost` finns på updro.se.
4. Driftsätt `auth-email-hook`, inklusive `confirmation-link.ts`.

## Verifiering

- 442 tester i 69 testfiler godkända, inklusive Google Ads genom formulär,
  lagringsanrop och byråregistrering samt felmeddelanden och nya bekräftelser.
- TypeScript, ESLint och produktionsbygge med prerendering godkända.
- Deno-kontroll av de två nya delade modulerna godkänd.
- Full Deno-kontroll av funktionerna kunde inte hämta externa beroenden i
  körmiljön. Produktionshanterarna för registrering och gästuppdrag testades
  med ersatta nätverksklienter.
- Lokal visuell kontroll i Chromium blockerades av körmiljöns socket-behörighet.
- Testerna använder simulerade konton och databasanrop. Inga verkliga
  bekräftelsemejl, konton eller uppdrag skapades.
