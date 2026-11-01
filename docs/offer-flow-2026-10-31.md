# Offertflödet – driftsättning 2026-10-31

## Vad som ändrats

- **Upplåsning reserverar en plats.** En byrå som låser upp får en av högst tre offertplatser: sju dagar när en kredit dras, tre dagar med månadskort (gratis upplåsningar ska inte kunna blockera betalande byråer i en vecka). När alla platser är reserverade kan ingen fler byrå betala för upplåsning. Platsen frigörs när reservationen går ut eller när leadgarantin godkänns.
- **Varning innan platsen går ut.** Byrån får notis och mejl 48 timmar innan reservationen går ut, med sista tid för offerten och – om krediten dragits – hur länge leadgarantin gäller.
- **Befintliga upplåsningar.** Upplåsningar från de senaste 30 dagarna får en hel reservation från driftsättningen, så ingen som betalat enligt de gamla reglerna blir utelåst direkt. Äldre räknas som utgångna.
- **Provperiod.** Servern stoppar upplåsning när provperioden gått ut, även om det finns krediter kvar (tidigare kontrollerades det bara i webbläsaren).
- **Chatten.** Beställaren och byråer som svarat kan skriva till varandra. En byrå som bara låst upp kan skriva först, och beställaren kan svara. Mottagaren får en notis per konversation tills den lästs och ett mejl om notisen inte lästs inom tio minuter. Konversationslistan visar motpartens namn och antal olästa. Meddelanden räknas som lästa bara när sidan syns, och tid och lässtatus sätts av servern.
- **E-post efter offerten.** Ny offert, beslut, stängt uppdrag, avtalsändringar, påminnelser, omdömen, platsvarningar och chattmeddelanden mejlas via `send-notification-emails`. Flera händelser till samma person samlas i ett mejl. Länkarna fungerar även utloggad – efter inloggning hamnar man på rätt sida.
- **Radering.** Ett uppdrag som byråer låst upp eller svarat på kan inte raderas av beställaren. Hen kan stänga det (eller avsluta ett fullt uppdrag utan att välja), och byråerna får besked – även de som låst upp utan att svara, en gång per uppdrag.
- **Påminnelser.** Beställare påminns om obesvarade offerter efter fem dagar, högst var tredje dag och högst tre gånger per uppdrag – även när alla platser fyllts och uppdraget stängts.
- **Omdömen.** Bara beställaren kan lämna omdöme om byrån vars offert hen accepterat. Byrån får notis och mejl. Notisen skapades tidigare i webbläsaren och stoppades av databasen, så den kom aldrig fram.
- **Gästmejl.** `send-guest-offer-emails` reserverar raden innan mejlet skickas (inga dubbletter vid överlappande körningar) och berättar hur många offerter gästen har.
- **Övervakning.** Admin → Edge-funktioner räknar körningar på servern och flaggar "Ingen körning" när ett schemalagt jobb varit tyst längre än normalt. Mejlrader som fastnat på sista försöket markeras som misslyckade i stället för att ligga kvar.
- **Städning.** Junimigreringens extra debiteringstrigger tas bort, så en upplåsning kostar alltid exakt en kredit även om de gamla filerna körts.

Frontend fungerar även innan databasändringen är på plats (den faller tillbaka till det gamla beteendet), men driftsätt databasen först.

## Driftsättning

Ordning: databas → edge functions → schemalagda jobb → test → publicera frontend.

Klistra in i Lovable efter att PR:en är mergad:

```text
Gör exakt följande, i ordning, och ändra ingen annan kod:
1. Applicera migrationen supabase/migrations/20261031120000_marketplace_trust_and_notifications.sql precis som den står. Den är idempotent och får köras om.
2. Deploya edge functions send-notification-emails, send-guest-offer-emails, send-supplier-lead-alerts, offer-reminder-cron och send-followup-reminders. Respektera supabase/config.toml (verify_jwt = false för dem).
3. Kör SQL:en i supabase/operations/offer-notification-runtime.sql mot databasen och visa resultatet av den sista SELECT-satsen (cron-jobben).
4. Kör de tre testfilerna supabase/tests/marketplace_trust_and_notifications.sql, supabase/tests/offer_agreement_flow.sql och supabase/tests/project_guard_and_lead_alerts.sql. De rullas alltid tillbaka och skapar inga riktiga data. Visa raden passed_checks för varje fil.
5. Regenerera src/integrations/supabase/types.ts från databasen.
```

Förväntat resultat i steg 4: 68, 59 och 12 godkända kontroller. Därefter: tryck **Publish** i Lovable.

## Kontroll efter driftsättning

1. Admin → Edge-funktioner: `send-notification-emails` och `send-guest-offer-emails` ska visa en senaste körning inom några minuter.
2. Lämna en testoffert på ett eget testuppdrag (inloggad beställare) och kontrollera att mejlet kommer fram och att länken öppnar uppdraget efter inloggning.
3. Skriv i chatten från byråkontot och se att beställaren ser byråns namn och får en notis.
4. Försök låsa upp ett uppdrag där tre byråer redan låst upp: knappen ska vara borta och ingen kredit dras.

## Att justera vid behov

Reservationstiderna (sju respektive tre dagar) styrs av en enda funktion, `public.offer_slot_hold`. Varningen skickas 48 timmar innan och påminnelserna styrs av `notify_expiring_offer_slots` och `send_offer_decision_reminders`.

## Webbpush (valfritt)

Push kräver VAPID-nycklar (`npx web-push generate-vapid-keys`): `VAPID_PRIVATE_KEY` och `VAPID_PUBLIC_KEY` som Edge-hemligheter och samma publika nyckel som `VITE_VAPID_PUBLIC_KEY` i frontend. Utan dem går notiserna ändå ut i appen och via e-post.
