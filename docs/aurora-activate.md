# Aurora Activate v1 – leverantörsaktivering

Mål: fler nyregistrerade byråer ska faktiskt börja använda tjänsten. Implementerat 2026-10-19 som en utbyggnad av den befintliga `ActivationChecklist` på byråns översikt – inga nya routes, ingen ny onboarding, inga betalningsändringar.

## Implementerade steg

Stegen härleds i `src/lib/supplierActivation.ts` (`computeActivationSteps`) och hämtas via hooken `src/hooks/useSupplierActivation.ts`. Status kommer från verklig data:

| Steg | ID | Källa | Obligatoriskt |
|---|---|---|---|
| Välj tjänstekategorier | `categories` | `supplier_profiles.categories` | Ja |
| Komplett byråprofil | `profile` | kontaktnamn/full_name, bio ≥ 40 tecken, giltig kontaktmejl, org.nr ≥ 8 tecken | Ja |
| Titta på ett uppdrag | `view_project` | localStorage-flagga `updro:activation:viewed_project`, sätts i `ProjectUnlock` när en brief öppnas | Ja |
| Lås upp första lead | `unlock_lead` | antal rader i `unlocked_leads` för användaren | Frivilligt |
| Skicka första offert | `send_offer` | antal rader i `offers` för användaren | Frivilligt |

Frivilliga steg är markerade "(frivilligt)" i UI:t så att inget köp krävs för att de obligatoriska stegen ska gå i mål. Checklistan är alltid synlig: progress-bar, nästa steg med deep link, hopfällbar detaljlista, och diskret "Klart"-läge när allt är klart. Trial-/kreditstatus (från `useAuth`) visas längst ned utan nya prisclaims.

Databasåtkomst: två SELECT-frågor (`unlocked_leads`, `offers`) filtrerade på inloggad användares id, under befintlig RLS. Ingen service_role, inga nya policies, inga mutationer.

## Analytics

Events via befintliga `trackPlausibleEvent` (samtyckesstyrda, PII-sanerade):

- `Supplier Activation Viewed` – checklistan renderades (en gång per session)
- `Supplier Activation Step Completed` – ett steg blev klart, prop `step` = steg-ID (en gång per steg och session)
- `Supplier Activation Completed` – alla obligatoriska steg klara (en gång per session)

`step` är tillagd i Plausible-props-allowlistan (max 40 tecken, ingen PII). Inga personuppgifter i payloads.

## Mätning av konvertering

Följ i Plausible: andel byråer som når `Supplier Activation Completed` inom 7 dagar efter `Agency Signup Completed`, samt andel som når `Lead Unlocked`/`Offer Submitted`. Steg-ID:n visar var byråer fastnar.

## Tester

- `src/lib/__tests__/supplierActivation.test.ts` – statusberäkning: tom profil, delvis ifylld, klar, ändrade kategorier, inget lead, ogiltig mejl/kort bio, deep links.
- `src/components/supplier/ActivationChecklist.test.tsx` – rendering: tom profil, progress, frivilliga markeringar, kredit-/trialtext, klart-läge.

## Kända begränsningar

- `view_project`-steget bygger på en lokal flagga (ingen serversignal finns); en byrå som byter enhet ser steget som ogjort tills den öppnar ett uppdrag igen.
