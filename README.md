# Updro

Sveriges marknadsplats för digitala uppdrag. Beställaren beskriver sitt projekt och kan få upp till tre relevanta offerter från digitala byråer.

**Live:** https://updro.se

## Produktflöde

1. Beställaren beskriver sitt uppdrag utan att behöva skapa konto.
2. Uppdraget sparas som väntande och granskas innan det öppnas för byråer.
3. Relevanta byråer kan låsa upp kontaktuppgifterna och lämna offert. En upplåsning reserverar en av högst tre offertplatser i sju dagar, så en betalande byrå alltid hinner svara.
4. Högst tre byråer får lämna offert på samma uppdrag.
5. Gäster får e-post när en offert kommer och kan skapa konto med samma verifierade e-postadress för att följa processen.
6. Inloggade beställare och byråer får notis och e-post om nya offerter, beslut, avtal, påminnelser och chattmeddelanden. Chatten är öppen mellan beställaren och byråer som låst upp eller svarat på uppdraget.
7. Ett uppdrag som byråer redan låst upp eller svarat på kan inte raderas av beställaren – det stängs i stället och byråerna får besked.

## Affärsmodell

- **Beställare:** gratis att publicera uppdrag, jämföra offerter och välja byrå.
- **Byråer:** 99 kr per upplåst lead eller 1 995 kr/månad för obegränsad åtkomst.
- **Provperiod:** fem lead-krediter under sju dagar, utan krav på kortuppgifter.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS och shadcn/ui
- **Backend:** Lovable Cloud/Supabase med Postgres, Auth, Edge Functions och Storage
- **Betalningar:** Stripe Checkout, Billing Portal och signerad webhook
- **E-post:** Resend via Lovable-anslutningen
- **AI:** Lovable AI Gateway för projektbrief och innehåll
- **Paketmanager:** Bun 1.2

## Utveckling

```bash
bun install
bun run dev
```

## Kvalitetskontroller

```bash
bun run lint
bun run test
bun run build
```

GitHub Actions kör samma kontroller automatiskt vid push och pull request mot `main`.

## SEO

`bun run build` kör Vite och därefter `scripts/prerender.mjs`. Bygget skapar statisk HTML, canonical, robots, social metadata, JSON-LD och sitemaps för indexerbara publika sidor.

Privata sidor under `/admin`, `/dashboard`, registrering, inloggning och lösenordsåterställning får `noindex`.

## Produktionsdrift i Lovable/Supabase

### Migrationer

Produktionen får sina migrationer via Lovable Cloud. Senaste migrationen för offertflödet är:

```text
20261031120000_marketplace_trust_and_notifications.sql
```

Handskrivna filer daterade före 2026-07-08 (till exempel `2026042600xx_*`, `2026062*_*` och `20260702*_*`) är utkast som enligt de genererade typerna aldrig nådde produktion. Kör inte hela mappen i ordning mot en ny databas utan att granska dem. Migrationen ovan tar bort den dubbla debiteringstriggern från junifilerna om de ändå har körts.

Databastester körs mot produktionen och rullas alltid tillbaka:

```text
supabase/tests/offer_agreement_flow.sql
supabase/tests/project_guard_and_lead_alerts.sql
supabase/tests/marketplace_trust_and_notifications.sql
```

### Edge Functions som ska vara deployade

```text
create-account
submit-guest-lead
analyze-brief
improve-description
create-checkout
confirm-checkout
check-subscription
customer-portal
stripe-webhook
send-guest-offer-emails
send-notification-emails
send-supplier-lead-alerts
send-followup-reminders
offer-reminder-cron
send-push
```

`send-transactional-email` är intern och tar bara emot anrop med service-role-nyckeln. Används den inte kan den tas bort helt i Supabase.

### Secrets

Följande secrets ska finnas i Lovable Cloud/Supabase:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_MONTHLY_PRICE_ID
STRIPE_LEAD_PRICE_ID
LOVABLE_API_KEY
RESEND_API_KEY
CRON_SECRET
GUEST_CRON_TOKEN
RATE_LIMIT_SALT
UPDRO_ADMIN_EMAIL
PUSH_WEBHOOK_SECRET
```

`PUSH_WEBHOOK_SECRET` är en slumpmässig hemlighet som database-webhooken för `send-push` skickar i headern `x-webhook-secret`. Utan den avvisas alla push-anrop som inte bär service-role-nyckeln.

`UPDRO_ADMIN_EMAIL` bör vara `info@auroramedia.se`. `RATE_LIMIT_SALT` ska vara en slumpmässig hemlig sträng. `GUEST_CRON_TOKEN` kan vara en separat slumpmässig hemlighet eller samma värde som `CRON_SECRET`.

### Stripe-webhook

Webhook-adress:

```text
https://opgjoevvlwhsddscqmpe.supabase.co/functions/v1/stripe-webhook
```

Registrera dessa händelser:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

### Schemalagda jobb

Kör `supabase/operations/offer-notification-runtime.sql` en gång efter deployment. Skriptet skapar de jobb som saknas och låter befintliga vara:

| Funktion | Schema |
|---|---|
| `send-notification-emails` | varannan minut |
| `send-guest-offer-emails` | varannan minut |
| `offer-reminder-cron` | dagligen |
| `send-followup-reminders` | dagligen |

`send-supplier-lead-alerts` schemaläggs av `supabase/operations/notification-runtime.sql` (var femte minut). Alla jobb skickar Vault-hemligheten `lead_alert_cron_secret`, som ska ha samma värde som Edge-hemligheten `LEAD_ALERT_CRON_SECRET`. Under **Admin → Edge-funktioner** syns senaste körning per jobb; "Ingen körning" betyder att jobbet eller hemligheten saknas.

### Webbpush (valfritt)

Push kräver ett VAPID-nyckelpar: `VAPID_PRIVATE_KEY` och `VAPID_PUBLIC_KEY` som Edge-hemligheter och samma publika nyckel som `VITE_VAPID_PUBLIC_KEY` i frontend. Generera med `npx web-push generate-vapid-keys`. Utan nycklarna går notiserna fortfarande ut i appen och via e-post.

### Auth-inställningar

E-postbekräftelse ska vara aktiverad. Tillåt minst följande redirect-adresser:

```text
https://updro.se/logga-in
https://updro.se/aterstall-losenord
https://www.updro.se/logga-in
https://www.updro.se/aterstall-losenord
```

Lovable-previewdomäner kan läggas till separat under utveckling.

## Kontroll efter deployment

1. Skicka ett gästuppdrag och verifiera att både beställaren och administratören får e-post.
2. Godkänn uppdraget i admin och kontrollera att det visas för byråer och att matchande byråer får notis och mejl (`supplier_lead_alert_queue` ska visa `sent`).
3. Lås upp ett lead med en provkredit.
4. Köp ett lead i Stripe testläge och kontrollera att exakt en kredit läggs till.
5. Starta och avsluta ett testabonnemang och kontrollera att planen växlar mellan `monthly` och `payg`.
6. Lämna en offert på ett gästuppdrag och kontrollera att offertmejlet skickas.
7. Lämna en offert på ett uppdrag från en inloggad beställare och kontrollera att `notification_email_queue` visar `sent` inom några minuter.
8. Skriv i chatten från byrån och kontrollera att beställaren ser byråns namn, får en notis och – om den inte läses inom tio minuter – ett mejl.
9. Testa registrering, e-postbekräftelse, inloggning och lösenordsåterställning.

## Kontakt

[info@auroramedia.se](mailto:info@auroramedia.se)

Updro drivs av **Aurora Media AB**.
