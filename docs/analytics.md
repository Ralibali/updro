# Konverteringsmätning

Updro skickar följande händelser från frontend:

- `page_view` vid publika React Router-navigeringar
- `begin_lead` när en besökare startar leadflödet
- `generate_lead` först när ett uppdrag har sparats i databasen
- `sign_up` efter lyckad registrering
- `begin_checkout` innan Stripe Checkout skapas

## GA4

Google-taggen laddas med Consent Mode och nekad lagring som standard. Besökaren väljer statistik och marknadsföring separat.

1. Kontrollera att GA4-egendomen använder mät-ID:t som anges i `src/components/CookieConsent.tsx`.
2. Markera `generate_lead` som en nyckelhändelse i GA4.
3. Om samma lead även importeras från GA4 till Google Ads, kontrollera att det inte räknas dubbelt som primär konvertering tillsammans med den direkta Ads-händelsen nedan.

## Direkt Google Ads-konvertering

Den befintliga åtgärden **Begär offert** använder `AW-10941540384/FJsSCP7vrd0cEKDQquEo`. Destinationen verifierades i Google Ads installationsanvisningar den 8 september 2026 och används som standard i koden. Den tidigare publicerade versionen saknade destination när miljövariabeln inte var satt, och skickade därför ingen direkt Ads-konvertering.

`trackLeadSubmitted` skickar händelsen först efter att ett uppdrag har sparats och bara om besökaren har godkänt marknadsföringsmätning. Ett startat formulär, ett misslyckat inskick eller oläsbart samtycke skickar ingen sådan händelse. Ingen kontaktinformation eller intäkt läggs i konverteringshändelsens parametrar.

Destinationen kan ersättas via Lovable-miljön med hela värdet, inklusive konverteringsetiketten:

```env
VITE_GOOGLE_ADS_LEAD_SEND_TO=AW-XXXXXXXXXXX/XXXXXXXXXXXXXXX
```

Värdet finns i Google Ads under konverteringsåtgärdens installationsanvisningar. Enbart annonskontots ID räcker inte.

Vid byte av annonskonto behöver även Google-taggen i `index.html` och `VITE_GOOGLE_ADS_ID` i cookiekomponenten stämma med det nya kontot. Tom `VITE_GOOGLE_ADS_LEAD_SEND_TO` använder den verifierade destinationen ovan.

Mätningen gäller leads, inte intäkter. Google Ads-åtgärdens befintliga standardvärde på 1 kr är inte bekräftad omsättning. Åtgärden `Begär offert (1)` och kampanjernas mål- och budgetinställningar har inte ändrats. Google Ads mottagning och attribuering behöver följas upp efter verklig trafik med samtycke; skapa inte testuppdrag i produktion för att få en grön status.

## Integritet

Projektbeskrivningar kan finnas tillfälligt i frågeparametern `beskrivning`. Analytics-koden skickar därför bara sökvägen och aldrig query string till Google.
