# Konverteringsmätning

Updro skickar följande händelser från frontend:

- `page_view` vid publika React Router-navigeringar
- `begin_lead` när en besökare startar leadflödet
- `generate_lead` först när ett uppdrag har sparats i databasen
- `sign_up` efter lyckad registrering
- `begin_checkout` innan Stripe Checkout skapas

## GA4

Google Analytics laddas först efter att besökaren har accepterat statistik- och marknadsföringscookies.

1. Kontrollera att GA4-egendomen använder mät-ID:t som anges i `src/components/CookieConsent.tsx`.
2. Markera `generate_lead` som en nyckelhändelse i GA4.
3. Importera vid behov GA4-händelsen till Google Ads.

## Direkt Google Ads-konvertering

För direkt Google Ads-mätning ska Lovable-miljön innehålla hela destinationen, inklusive konverteringsetiketten:

```env
VITE_GOOGLE_ADS_LEAD_SEND_TO=AW-XXXXXXXXXXX/XXXXXXXXXXXXXXX
```

Värdet finns i Google Ads under konverteringsåtgärdens installationsanvisningar. Enbart annonskontots ID räcker inte.

Lämnas variabeln tom skickas fortfarande GA4-händelsen `generate_lead`, men ingen separat Google Ads-`conversion`-händelse.

## Integritet

Projektbeskrivningar kan finnas tillfälligt i frågeparametern `beskrivning`. Analytics-koden skickar därför bara sökvägen och aldrig query string till Google.
