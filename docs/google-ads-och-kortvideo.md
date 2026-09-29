# Google Ads och kortvideo – startpaket för beställarleads

Skapad 2026-09-29. Planeringsunderlag, inte en köporder eller budget. Inget i dokumentet
är publicerat eller aktiverat.

## Utgångsläge (verifierat 2026-09-28)

- `marketplace-stats`: 0 publicerade uppdrag, 0 offerter, 10 byråprofiler.
- Byråintäkten (99 kr/lead, 1 995 kr/mån, 19 950 kr/år) kräver först beställarförfrågningar.
  Därför är målet med paketet **kvalificerade inskickade förfrågningar**, inte klick eller visningar.
- Konvertering till Ads finns: `trackLeadSubmitted` skickar `conversion` till
  `AW-10941540384/FJsSCP7vrd0cEKDQquEo` (”Begär offert”) när marknadsföringssamtycke finns.
  Konverteringar utan samtycke syns inte i Ads – jämför med GA4 `generate_lead` och antalet
  uppdrag i admin.
- Okänt: sökvolymer, klickpriser och konverteringsgrad. Gissa inte – läs dem ur Keyword
  Planner och de första veckornas data.

## Landningssida

Alla annonser går till `/jamfor-offerter` (noindex). `?tjanst=` styr rubrik, byråord och
förvald kategori. `utm_term` förifyller briefen (olösta `{keyword}` filtreras bort).

| Annonsgrupp | Slutlig webbadress | Rubrik på sidan |
|---|---|---|
| Hemsida | `https://updro.se/jamfor-offerter?tjanst=hemsida` | Jämför offerter på ny hemsida |
| Webbshop | `https://updro.se/jamfor-offerter?tjanst=webbshop` | Jämför offerter på webbshop |
| SEO | `https://updro.se/jamfor-offerter?tjanst=seo` | Jämför offerter från SEO-byråer |
| Marknadsföring | `https://updro.se/jamfor-offerter?tjanst=marknadsforing` | Jämför offerter på digital marknadsföring |

Spårningsmall på kontonivå: `{lpurl}&utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}`

## Sökord att utvärdera (frasmatchning, kontrollera volym i Keyword Planner)

- Hemsida: ”webbyrå offert”, ”offert hemsida”, ”hitta webbyrå”, ”pris ny hemsida företag”
- Webbshop: ”e-handelsbyrå”, ”shopify byrå”, ”bygga webbshop pris”
- SEO: ”seo byrå offert”, ”hitta seo byrå”, ”seo pris”
- Marknadsföring: ”google ads byrå”, ”marknadsföringsbyrå offert”

Negativa sökord att börja med: jobb, lediga jobb, praktik, gratis mall, kurs, utbildning,
själv, wix, squarespace, login, logga in, partna login.

## Responsiva sökannonser (teckengränser kontrollerade: rubrik ≤ 30, beskrivning ≤ 90)

**Hemsida**
- Rubriker: Jämför offerter på hemsida · Max tre offerter – gratis · Få offert på ny hemsida ·
  Hitta rätt webbyrå · Briefen granskas först · Inget konto krävs · Gratis för dig som beställare ·
  Beskriv behovet på 2 minuter
- Beskrivningar: Beskriv din nya hemsida en gång. Högst tre relevanta webbyråer kan lämna offert. ·
  Gratis och utan köpkrav. Inga massutskick – dina uppgifter delas bara med valda byråer.

**Webbshop**
- Rubriker: Jämför offerter på webbshop · Offert på Shopify-butik · E-handelsbyrå – max 3 offerter ·
  Gratis för dig som beställare · Briefen granskas först · Inget konto krävs
- Beskrivningar: Beskriv din webbshop en gång. Högst tre relevanta e-handelsbyråer kan lämna offert. ·
  Jämför pris, upplägg och tidsplan. Gratis och utan förpliktelser.

**SEO**
- Rubriker: Jämför SEO-byråer · Offert från SEO-byrå · Max tre SEO-offerter – gratis ·
  Synas bättre på Google · Briefen granskas först · Inget konto krävs
- Beskrivningar: Beskriv era mål med SEO. Högst tre relevanta SEO-byråer kan lämna offert. ·
  Gratis för dig som beställare. Du väljer själv om du vill gå vidare.

**Marknadsföring**
- Rubriker: Offert på marknadsföring · Jämför Google Ads-byråer · Max tre offerter – gratis ·
  Briefen granskas först · Inget konto krävs
- Beskrivningar: Beskriv mål och budget för annonsering. Högst tre relevanta byråer kan lämna offert. ·
  Gratis och utan köpkrav. Jämför upplägg och pris i lugn och ro.

Påståenden som inte får användas (se `copyTruth.test.ts`): svarsgarantier, antal
kunder/offerter, omdömen, besparingsprocent, fler än tre offerter.

## Kortvideo – tre manus (B2B, skärmdemonstration)

Enligt AGENTS.md: verkliga produktflöden, ingen syntetisk ”kund”, inga påhittade resultat.
Spela in skärmen på updro.se i mobilformat (9:16), egen röst eller textskyltar, 20–30 s.

**1. ”Två minuter till en brief” (beställare)**
- Öppning (0–3 s): ”Behöver du en ny hemsida men orkar inte ringa runt till byråer?”
- Demonstration: skriv en mening i startsidans ruta → tryck ”Ny hemsida” → ”Få offerter gratis” →
  visa att texten och kategorin redan är ifyllda i formuläret.
- CTA: ”Beskriv ditt projekt gratis på updro.se – högst tre byråer får svara.”

**2. ”Tre offerter, inte sex säljsamtal” (beställare)**
- Öppning: ”Varför få sex offerter när du bara orkar läsa tre?”
- Demonstration: scrolla till jämförelsetabellen på startsidan – högst 3 byråer, 0 % provision,
  granskad brief.
- CTA: ”Jämför rätt byråer på updro.se.”

**3. ”Vad kostar en vunnen kund?” (byråer)**
- Öppning: ”Byrå? Räkna på vad provisionen kostar er.”
- Demonstration: dra i reglagen i kalkylatorn på `/for-byraer` (projektvärde, leads per affär)
  och visa skillnaden. Behåll fotnoten om publika listpriser i bild.
- CTA: ”Testa med fem gratis leads – updro.se/for-byraer.”

Testa en variabel i taget (öppningen först). Mät inskickade förfrågningar respektive
byråregistreringar per klipp via UTM (`utm_source=<kanal>&utm_content=manus1`), inte visningar.

## Mätplan

| Vad | Källa | Baslinje 2026-09-28 |
|---|---|---|
| Påbörjade förfrågningar per källa | GA4 `begin_lead` (`lead_source`) | okänd |
| Inskickade förfrågningar | GA4 `generate_lead`, Ads-konvertering | 0 publicerade uppdrag |
| Godkända uppdrag | admin / `marketplace-stats.projects` | 0 |
| Upplåsta leads och köp | GA4 köp-event, Stripe | okänd |
| Byråregistreringar | GA4 `supplier_signup_started` | 10 profiler |

Utvärdera efter minst två veckor eller när varje annonsgrupp har tillräckligt med klick för
att jämföra – inte efter enstaka dagar.
