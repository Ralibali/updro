# AI Visibility – leverans 2026-09-28

## Byggt och avgränsning

VERIFIED FACT (koden): `/ai-synlighet` skapar 30 svenska testfrågor från tjänst och marknad utan nätverksanrop till en AI-leverantör. Sidan är länkad i sidfoten och registrerad i befintlig sitemap/prerender. CTA går till Aurora Medias befintliga kontaktflöde. Detta är en gratis testplan, inte ett automatiskt synlighetsbetyg.

`/admin/ai-synlighet` bygger vidare på befintlig observations- och åtgärdskö med flera serverlagrade kundarbetsytor, revisionskontroll vid samtidig redigering, svenska frågor, sparad mäthistorik och nedladdningsbar rapport för de senaste sju dagarna. Äldre lokala utkast kan sparas som en ny kund. Rapporten skiljer saknade data från noll och använder observationernas datum. API-svar granskas manuellt före klassificering som omnämnande.

Valfri serveranslutning till Perplexity Sonar kör en sparad fråga per begäran. Bara Updro-admin kan köra. De första 30 frågorna i arbetsytan är valbara. Varje exakt fråga reserveras atomiskt per arbetsyta och UTC-dag innan det betalda anropet; parallella/dubbla anrop gör inte en ny beställning. Timeout eller leverantörsfel markeras som misslyckad mätning, aldrig som osynlighet. Försök efter timeout tillåts nästa UTC-dag för att undvika dubbel kostnad. En avbruten serverkörning kan förbli `running`; detta visas som ej slutförd, inte som framgång.

Alla Updro-administratörer delar åtkomst till arbetsytorna. Ingen kundinloggning eller flerpartsisolering mellan administratörer utlovas. Köpare/leverantörer/anon har ingen åtkomst. Gränssnittet har lokala utkast; använd en betrodd administratörswebbläsare. Spara och exportera innan arbetsyta byts.

## Driftsättning (ej utförd)

1. Applicera endast `20260928065603_ai_visibility_workspaces.sql` i Updros befintliga Supabase/Lovable-projekt.
2. Deploya `ai-visibility-check`; `verify_jwt = true` i config. Befintliga `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` används på servern. Ingen ändring av genererad klient eller typfil.
3. För betalda mätningar: spara `PERPLEXITY_API_KEY` som serversecret och sätt `AI_VISIBILITY_ENABLED=true`. Utan båda returneras 503. Ingen provider-nyckel får ha VITE-prefix. Sätt en separat spend-limit hos leverantören; spärren per fråga är inte en global månadsbudget (admin kan skapa/ändra frågor och arbetsytor).
4. Publicera frontend. Kontrollera admin-sparande/återläsning och att vanliga konton nekas. Gör därefter en uttryckligt budgeterad live-mätning. Inga betalda live-anrop gjordes under utvecklingen.
5. Rollback: stäng av `AI_VISIBILITY_ENABLED`, återställ frontend/funktion vid behov och behåll tabellerna för att skydda kunddata.

## Verifiering

`bun install --frozen-lockfile`; `bun run lint`; `bun run typecheck`; `bun run test --maxWorkers=2`; `bun run test:visibility-db`; `bun run verify:schema`; `bun run build`.

Deno: `deno check --node-modules-dir=none --no-lock supabase/functions/ai-visibility-check/index.ts`.

PostgreSQL-tester körs lokalt med PGlite och verkliga RLS-roller, inklusive nekad köparåtkomst, revisionskonflikt, dubbel reservation och skrivskyddade mätresultat. Handler-testet kör produktionskoden med simulerad databas/provider och verifierar adminspärr, aktiveringsspärr, promptval, dubbelanrop, lyckat svar och providerfel. Desktop/mobil testade med simulerade API-svar från kundskapande till rapportnedladdning; inga produktionskonton eller externa anrop.

## Licens, evidens och nästa gräns

Ny produktkod är egen implementation. Ingen Ansvisor-kod eller AGPL-kod har kopierats eller inkluderats. Detta är ett fristående lager i befintlig Updro-arkitektur, inte en Ansvisor-installation. Nytt testberoende `@electric-sql/pglite@0.5.8` är Apache-2.0, endast utvecklingsberoende. Ingen ny runtime-dependency.

Sonar-formatet följer leverantörens [API-dokumentation](https://docs.perplexity.ai/api-reference/sonar-post), kontrollerad 2026-09-28. API-svar motsvarar inte garanterat konsumentgränssnittets svar. Provideravtal och kostnader är separata från kodlicensen.

UNKNOWN: faktisk konvertering, betalningsvilja och live-providerresultat. HYPOTHESIS: testplan → kvalificerad kontakt → återkommande analys/åtgärder. Mät kvalificerade kontakter och tid till första levererad rapport före nya pris-/abonnemangssteg.

Ej byggt: automatisk konkurrentidentifiering, konsumenttjänsternas ChatGPT/Gemini/Claude-integrationer, nationell benchmark, kundkonton, automatiskt veckoutskick eller schemalagd AI-körning. Veckorapporten laddas ned manuellt och kräver verkliga observationer. Dessa saker marknadsförs inte som färdiga.

## Befintligt parallellt arbete

[Aurora Media PR #64](https://github.com/Ralibali/aurora-media-lead-generation/pull/64) innehåller en separat, ännu omergad Aurora Sight-kundvy med manuella observationer, konkurrentfält och prisplaner. Den granskades i denna leverans: den har ingen ansluten mätprovider. Updro-ändringen här utgår från Updros redan befintliga adminarbetsyta och tillför dess offentliga testplan, faktiska provideranslutning och rapportflöde. Ingen kopia av PR #64 läggs in i Aurora Media och dess priser antas inte vara beslutade.

De två backendprojekten synkroniseras inte automatiskt. Använd Updro-arbetsytan som källa för dessa mätningar; skapa inte samma kund parallellt i Aurora Sight utan ett separat beslut om gemensam datakälla. Exporterad JSON/veckorapport kan användas som överlämningsunderlag, men ingen automatisk import i PR #64 utlovas. PR #64 behöver inte mergas för att denna Updro-PR ska fungera.
