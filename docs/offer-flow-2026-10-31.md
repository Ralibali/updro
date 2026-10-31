# Offertflödet – driftsättning 2026-10-31

## Vad som ändrats

- **Upplåsning reserverar en plats.** En byrå som låser upp får en av högst tre offertplatser i sju dagar. När alla platser är reserverade kan ingen fler byrå betala för upplåsning. Svarar en byrå inte inom sju dagar, eller får leadgarantin godkänd, frigörs platsen.
- **Chatten.** Bara beställaren och byråer som låst upp eller svarat på uppdraget kan skriva till varandra. Mottagaren får en notis (en per konversation tills den lästs) och ett mejl om notisen inte lästs inom tio minuter. Konversationslistan visar motpartens namn och antal olästa.
- **E-post efter offerten.** Ny offert, accepterad/avböjd offert, stängt uppdrag, avtalsändringar, påminnelser och chattmeddelanden mejlas via `send-notification-emails`. Flera händelser till samma person samlas i ett mejl.
- **Radering.** Ett uppdrag som byråer låst upp eller svarat på kan inte raderas av beställaren. Hen får i stället stänga det, och byråerna får besked – även de som låst upp men inte hunnit svara.
- **Påminnelser.** `offer-reminder-cron` påminner även när alla platser fyllts och uppdraget stängts, eftersom beslutet återstår där.
- **Omdömen.** Byrån får notis och mejl när beställaren lämnar omdöme. Notisen skapades tidigare i webbläsaren och stoppades av databasen, så den kom aldrig fram. Omdömeskortet visar nu byråns namn i stället för "byrån".
- **Gästmejl.** `send-guest-offer-emails` reserverar raden innan mejlet skickas (inga dubbletter vid överlappande körningar) och berättar hur många offerter gästen har.
- **Övervakning.** Admin → Edge-funktioner visar alla mejl- och påminnelsejobb och flaggar "Ingen körning" när ett schemalagt jobb är tyst.
- **Städning.** Junimigreringens extra debiteringstrigger tas bort, så en upplåsning kostar alltid exakt en kredit även om de gamla filerna körts.

Frontend fungerar även innan databasändringen är på plats (den faller tillbaka till det gamla beteendet), men driftsätt databasen först.

## Driftsättning

Ordning: databas → edge functions → schemalagda jobb → test → publicera frontend.

Klistra in i Lovable efter att PR:en är mergad:

```text
Gör exakt följande, i ordning, och ändra ingen annan kod:
1. Applicera migrationen supabase/migrations/20261031120000_marketplace_trust_and_notifications.sql precis som den står. Den är idempotent och får köras om.
2. Deploya edge functions send-notification-emails, send-guest-offer-emails, offer-reminder-cron och send-followup-reminders. Respektera supabase/config.toml (verify_jwt = false för dem).
3. Kör SQL:en i supabase/operations/offer-notification-runtime.sql mot databasen och visa resultatet av den sista SELECT-satsen (cron-jobben).
4. Kör de tre testfilerna supabase/tests/marketplace_trust_and_notifications.sql, supabase/tests/offer_agreement_flow.sql och supabase/tests/project_guard_and_lead_alerts.sql. De rullas alltid tillbaka och skapar inga riktiga data. Visa raden passed_checks för varje fil.
5. Regenerera src/integrations/supabase/types.ts från databasen.
```

Förväntat resultat i steg 4: 44, 59 och 12 godkända kontroller. Därefter: tryck **Publish** i Lovable.

## Kontroll efter driftsättning

1. Admin → Edge-funktioner: `send-notification-emails` och `send-guest-offer-emails` ska visa en senaste körning inom några minuter.
2. Lämna en testoffert på ett eget testuppdrag (inloggad beställare) och kontrollera att mejlet kommer fram.
3. Skriv i chatten från byråkontot och se att beställaren ser byråns namn och får en notis.
4. Försök låsa upp ett uppdrag där tre byråer redan låst upp: knappen ska vara borta och ingen kredit dras.

## Webbpush (valfritt)

Push kräver VAPID-nycklar (`npx web-push generate-vapid-keys`): `VAPID_PRIVATE_KEY` och `VAPID_PUBLIC_KEY` som Edge-hemligheter och samma publika nyckel som `VITE_VAPID_PUBLIC_KEY` i frontend. Utan dem går notiserna ändå ut i appen och via e-post.
