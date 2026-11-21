# Egen redaktion för https://updro.se

Ägarmandat: Christoffer bad den 7 september 2026 om egna nischartiklar som riktiga blogginlägg. Kod, innehåll, tester, merge och publicering ingår. Artikeldata i `src/content/editorial/articles.json` läses av både webbplatsen och byggets HTML/webbplatskarta. En ny artikel läggs överst i denna array. Gamla artiklar får inte tappas bort eller skrivas över när nästa läggs till.

Nisch: Köp av digitala tjänster: byråval, krav, offerter, genomförande och leveranskontroll.
Publiceringsadress: `https://updro.se/artiklar/<slug>`.
Redaktionen ägs av Codex-uppgift `01a07855-4957-73c2-85a1-3c1980378daf`. Använd dess befintliga redaktionsautomation och skapa inga dubbla publiceringsjobb. Daglig kontroll kl. 09.00 Europe/Stockholm; högst en ny originalartikel varannan kalenderdag per sajt. Läs aktuell automationskonfiguration eftersom namnet kan utökas när fler projekt ansluts.

## Vid varje publicering

1. Läs senaste main och hela artikelinventeringen, inklusive databasartiklar där sådana finns. Välj egen sökintention med användbart beslutsstöd och kontrollera att den inte redan täcks.
2. Kontrollera aktuellt erbjudande, källor och interna länkar. Källor för regler, priser, säkerhet och produktfunktioner måste vara aktuella förstahandskällor. Fabricera inte erfarenheter, kundresultat, antal kunder, lokala kontor eller funktioner.
3. Skriv ett original med relevanta nästa steg. AI-medverkan ska vara tydlig och ingen mänsklig granskning får påstås utan belägg. Fyll i verkligt publiceringsdatum och `editorial.publishedAt`, `sourceCheckedAt`, `sourceUrls` samt sökintention.
4. Kör `npm run editorial:check` och relevanta repo-kontroller. Öppna PR, kontrollera CI och aktuell main. Merge och publicera via projektets befintliga Lovable-projekt efter att dess SHA matchar den mergade versionen.
5. Kontrollera artikelns plats i listan, full text i HTML, en H1, korrekt canonical, indexerbarhet, fungerande produkt-/källänkar och sitemap. Om något fallerar: rätta eller avbryt nästa publicering på just sajten. Skriv inte samma text under en ny slug vid återförsök.
6. Logga URL, publiceringsdatum, commit, innehållshash och kontrollresultat. Kontrollera kalenderavstånd och dubbletter igen omedelbart före nästa publicering. Följ kvalificerade förfrågningar när tillförlitlig mätning finns; inga effekter antas från enbart publicering.

Första artikeln i den egna kön publiceras den 7 september 2026. Nästa nya artikel får därför publiceras tidigast den 9 september, efter verifierad livekontroll. Den faktiska publiceringsloggen är styrande om lanseringen försenas.

De äldre cron-jobben `process-article-queue-6h` (2) och `process-article-queue-weekly` (5) pausades och lästes tillbaka 7 september. De ska inte återaktiveras parallellt med denna redaktion. Kundernas mejl- och offertjobb är oförändrade. Den gamla processfunktionen publicerar direkt trots kommentaren om utkast; den används inte av den nya publiceringsvägen.

## Publicerad databasinventering i bygget

`src/content/editorial/database-published.json` är en explicit export av de publika artikelkolumnerna från `public.articles` där `status = 'published'`. Den används tillsammans med den befintliga statiska samlingen av listan, HTML-bygget och samtliga webbplatskartor. Databasversionen har samma företräde vid slugkollision som den befintliga läsaren. Publicerings- och ändringsdatum bevaras vid export; flytten räknas inte som en ny originalartikel.

Före varje publicering: läs hela publicerade databaslistan via projektets autentiserade anslutning, jämför slug, titel, text och datum med exporten och uppdatera endast den publika artikelkopian. Exportera aldrig författarkonton, kontaktuppgifter, nycklar eller utkast. Rader som har avpublicerats ska också tas bort ur den publika byggkopian. Cron-jobb 2 och 5 förblir pausade. Kontrollera både sid-HTML och artikelwebbplatskartan efter bygget.

Ögonblicksbilden från 21 november 2026 har 15 artiklar. Den är en teknisk återgivning av redan publicerat innehåll, inte ett intyg om faktagranskning. Inlägget `case-study-ehandel-seo-malmo-200-procent` innehåller ett ej styrkt kundresultat och ska granskas eller rättas före publicering av denna ändring. Den äldre texten bevaras i PR:n för jämförelse.
