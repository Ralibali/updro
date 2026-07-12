# Updro

Sveriges marknadsplats för digitala uppdrag. Beställaren beskriver sitt projekt och kan få upp till tre relevanta offerter från digitala byråer.

**Live:** https://updro.se

## Produktflöde

1. Beställaren beskriver sitt uppdrag utan att behöva skapa konto.
2. Uppdraget sparas som väntande och granskas innan det öppnas för byråer.
3. Relevanta byråer kan låsa upp kontaktuppgifterna och lämna offert.
4. Högst tre byråer får lämna offert på samma uppdrag.
5. Gäster får e-post när en offert kommer och kan skapa konto med samma verifierade e-postadress för att följa processen.

## Affärsmodell

- **Beställare:** gratis att publicera uppdrag, jämföra offerter och välja byrå.
- **Byråer:** 119 kr per upplåst lead eller 1 995 kr/månad för obegränsad åtkomst.
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

Migrationerna ska appliceras i tidsordning. De senaste stabiliseringsmigrationerna är:

```text
20260712143000_production_hardening.sql
20260712180000_product_reliability.sql
20260712190000_pending_project_notifications.sql
20260712200000_allow_trusted_system_updates.sql
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
offer-reminder-cron
```

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
```

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

Kör `send-guest-offer-emails` varannan minut:

```text
POST https://opgjoevvlwhsddscqmpe.supabase.co/functions/v1/send-guest-offer-emails
Header: x-cron-secret: <GUEST_CRON_TOKEN>
```

Kör `offer-reminder-cron` en gång per dag:

```text
POST https://opgjoevvlwhsddscqmpe.supabase.co/functions/v1/offer-reminder-cron
Header: x-cron-secret: <CRON_SECRET>
```

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
2. Godkänn uppdraget i admin och kontrollera att det visas för byråer.
3. Lås upp ett lead med en provkredit.
4. Köp ett lead i Stripe testläge och kontrollera att exakt en kredit läggs till.
5. Starta och avsluta ett testabonnemang och kontrollera att planen växlar mellan `monthly` och `payg`.
6. Lämna en offert på ett gästuppdrag och kontrollera att offertmejlet skickas.
7. Testa registrering, e-postbekräftelse, inloggning och lösenordsåterställning.

## Kontakt

[info@auroramedia.se](mailto:info@auroramedia.se)

Updro drivs av **Aurora Media AB**.
