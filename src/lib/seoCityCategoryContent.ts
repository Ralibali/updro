// Djupinnehåll för prioriterade stad×kategori-sidor (/byraer/:stad/:kategori)
// Dessa combos valda utifrån konkurrentdata (Partna) – hög sökvolym, låg KD, svag konkurrent.
// När en combo finns här ersätter den generiskt titel/intro/FAQ på AgencyCityCategoryPage.

export interface CityCategoryDeepContent {
  /** Exakt <title> optimerad mot målsökordet */
  title: string
  metaDesc: string
  h1: string
  /** Unik ingress, 2–4 meningar */
  intro: string
  /** Unika lokala sektioner som renderas som löpande prosa */
  sections: { heading: string; paragraphs: string[] }[]
  /** Lokalt anpassade FAQ (ersätter standard-FAQ) */
  faq: { q: string; a: string }[]
}

export const CITY_CATEGORY_DEEP: Record<string, CityCategoryDeepContent> = {
  'malmo/digital-marknadsforing': {
    title: 'Digital marknadsföringsbyrå Malmö – jämför offerter | Updro',
    metaDesc: 'Hitta digital marknadsföringsbyrå i Malmö. Jämför offerter från upp till tre granskade byråer – kostnadsfritt och utan förpliktelser.',
    h1: 'Digital marknadsföringsbyrå i Malmö',
    intro: 'Malmö är Skånes digitala centrum och en av norra Europas tätaste byråmarknader. Här konkurrerar kreativa studios kring Media Evolution City med vassare performance-byråer om samma uppdrag – vilket pressar priserna till din fördel. En digital marknadsföringsbyrå i Malmö kostar dessutom ofta 15–25 procent mindre än motsvarande byrå i Stockholm, utan att kompetensen är sämre.',
    sections: [
      {
        heading: 'Så ser marknaden ut i Malmö',
        paragraphs: [
          'Malmös näringsliv präglas av Öresundsregionens dynamik: spelbolag, e-handlare, mat- och livsmedelsföretag och ett tätt startup-ekosystem. Det har skapat en byråmarknad med två tydliga läger. Dels de kreativa fullservicebyråerna med stark varumärkeskompetens, dels renodlade specialistbyråer inom SEO, Google Ads och sociala medier som arbetar datadrivet mot mätbara mål.',
          'Närheten till Köpenhamn gör att flera Malmöbyråer också arbetar gränsöverskridande – praktiskt om du säljer i både Sverige och Danmark. Samtidigt är den lokala konkurrensen hård, så byråerna är vana vid att pitcha. Utnyttja det: begär alltid in flera offerter innan du bestämmer dig.',
        ],
      },
      {
        heading: 'Vad kostar en marknadsföringsbyrå i Malmö?',
        paragraphs: [
          'Priserna varierar kraftigt beroende på omfattning. Löpande SEO-arbete ligger typiskt på 8 000–20 000 kr i månaden för ett mindre eller medelstort företag. Förvaltning av Google Ads kostar ofta 3 000–8 000 kr i månaden utöver själva annonsbudgeten, och ett sociala medier-upplägg brukar landa på 5 000–15 000 kr i månaden. Timpriser för seniora specialister i Malmö ligger runt 900–1 300 kr.',
          'Var skeptisk mot byråer som inte kan specificera vad som ingår. En seriös offert bryter ner kostnaden per aktivitet och visar vilken effekt du kan förvänta dig.',
        ],
      },
      {
        heading: 'Så väljer du rätt byrå i Malmö',
        paragraphs: [
          'Be om case från din bransch – inte bara snygga logotyper utan siffror: vad hände med trafiken, försäljningen eller kostnaden per kund? Fråga vem som faktiskt gör arbetet. På större byråer säljer seniorerna och juniorenheterna levererar; på mindre byråer får du ofta specialisten hela vägen.',
          'Säkerställ slutligen att du äger dina egna annonskonton och din spårning. Om förhållandet tar slut ska all historik och all data finnas kvar hos dig – inte hos byrån.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en digital marknadsföringsbyrå i Malmö?', a: 'För löpande arbete ligger de flesta upplägg på 8 000–25 000 kr i månaden beroende på kanalmix. Enskilda insatser som en SEO-genomlysning eller en kampanjstart kostar ofta 10 000–30 000 kr. Malmö ligger generellt 15–25 procent under Stockholmspriserna. Jämför minst tre offerter för att se var din nivå hamnar.' },
      { q: 'Ska jag satsa på SEO eller annonsering först?', a: 'Annonsering ger trafik direkt men slutar fungera den dag du slutar betala. SEO tar tre till sex månader att bygga men ger sedan trafik utan kostnad per klick. De flesta Malmöföretag med begränsad budget börjar med annonsering för omedelbara kunder och bygger SEO parallellt.' },
      { q: 'Måste byrån ligga i Malmö?', a: 'Nej. Digital marknadsföring levereras lika bra på distans – det som spelar roll är kompetens, uppföljning och kommunikation. Många Malmöföretag arbetar med byråer i Lund, Helsingborg eller helt utanför Skåne. Välj lokalt om du värdesätter fysiska möten, annars öppna upp för hela landet.' },
      { q: 'Hur snabbt ser man resultat av digital marknadsföring?', a: 'Betald annonsering kan ge effekt inom dagar. Räkna med en till två månader innan kampanjerna är optimerade. SEO och content tar normalt tre till sex månader innan du ser tydlig effekt på trafik och leads. En byrå som lovar topplaceringar på några veckor bör du undvika.' },
    ],
  },

  'norrkoping/digital-marknadsforing': {
    title: 'Digital marknadsföring Norrköping – jämför byråer | Updro',
    metaDesc: 'Hitta byrå för digital marknadsföring i Norrköping. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Digital marknadsföring i Norrköping',
    intro: 'Norrköping har på tjugo år förvandlats från industristad till kunskapsstad, med Campus Norrköping och ett starkt kluster inom visualisering och medieteknik. För dig som köpare betyder det en byråmarknad med hög kompetens men prisnivåer tydligt under storstädernas – ofta 20–30 procent lägre än Stockholm för samma arbete.',
    sections: [
      {
        heading: 'Marknaden för digital marknadsföring i Norrköping',
        paragraphs: [
          'Norrköpings byråscen är präglad av stadens teknikarv. Med Visualiseringscenter C, Norrköping Science Park och Linköpings universitets campus i stan finns en ovanlig täthet av kompetens inom data, visualisering och digital kommunikation. Det märks i byråutbudet: många mindre och medelstora byråer med teknisk spets, ofta grundade av personer med bakgrund från universitetet eller stadens teknikbolag.',
          'Näringslivet domineras av handel, tillverkning och logistik – branscher där digital marknadsföring ofta handlar om att synas lokalt i Google och att bygga stabila flöden av förfrågningar. En byrå i Norrköping förstår den verkligheten bättre än en Stockholmsbyrå som mest arbetar med konsumentvarumärken.',
        ],
      },
      {
        heading: 'Vad kostar det i Norrköping?',
        paragraphs: [
          'Prisnivån är en av Norrköpings starkaste fördelar. Löpande SEO-arbete ligger typiskt på 7 000–15 000 kr i månaden, Google Ads-förvaltning på 3 000–6 000 kr i månaden utöver annonsbudgeten, och timpriserna för seniora specialister rör sig kring 800–1 100 kr – märkbart lägre än i Stockholm eller Göteborg.',
          'Många Norrköpingsbyråer tar även uppdrag åt kunder i Linköping, Stockholm och hela Östergötland, så konkurrensen om uppdragen är på riktigt. Det gör att du som köpare har ett starkt förhandlingsläge – använd det.',
        ],
      },
      {
        heading: 'Vanliga misstag när företag i Norrköping anlitar byrå',
        paragraphs: [
          'Det vanligaste misstaget är att köpa enbart på pris utan att fråga hur byrån mäter effekt. Den näst vanligaste är att teckna långa löpande avtal utan tydliga delmål. Be i stället om en pilotperiod på tre månader med konkreta nyckeltal: kostnad per lead, organisk trafikutveckling eller försäljning per annonskrona.',
          'Fråga också alltid vem som ska arbeta med ditt konto och hur ofta ni ses. I en mindre stad är det fullt rimligt att kräva fysiska avstämningsmöten – det är en av fördelarna med en lokal byrå.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar digital marknadsföring i Norrköping?', a: 'Räkna med 7 000–18 000 kr i månaden för ett löpande upplägg med SEO och annonsering, beroende på omfattning. Norrköping ligger ofta 20–30 procent under Stockholmspriserna. Enskilda projekt som en teknisk SEO-genomlysning kostar typiskt 10 000–25 000 kr.' },
      { q: 'Finns det bra marknadsföringsbyråer i Norrköping?', a: 'Ja. Staden har ett ovanligt starkt kluster inom visualisering, medieteknik och data tack vare Campus Norrköping och stadens teknikhistoria. Utbudet är mindre än i storstäderna men kompetensen per byrå är hög – och priserna lägre.' },
      { q: 'Bör jag välja en byrå i Norrköping eller Linköping?', a: 'Städerna ligger en halvtimme från varandra och byråerna konkurrerar om samma kunder, så öppna gärna upp för båda. Det ger dig fler offerter att jämföra och ett bättre prisläge. Via Updro kan du få offerter från byråer i hela Östergötland.' },
      { q: 'Hur lång uppstartssträcka ska jag räkna med?', a: 'En seriös byrå behöver två till fyra veckor på att sätta strategi, spårning och kampanjstruktur innan det löpande arbetet drar igång. Betald annonsering kan ge kunder från dag ett, medan SEO tar tre till sex månader att visa effekt.' },
    ],
  },

  'orebro/digital-marknadsforing': {
    title: 'Digital marknadsföringsbyrå Örebro – jämför gratis | Updro',
    metaDesc: 'Hitta digital marknadsföringsbyrå i Örebro. Jämför offerter från upp till tre granskade byråer – helt gratis och utan förpliktelser.',
    h1: 'Digital marknadsföringsbyrå i Örebro',
    intro: 'Örebro ligger mitt i Sveriges logistiska centrum och har ett näringsliv dominerat av handel, transport och tillverkning. Det gör att stadens marknadsföringsbyråer är vana vid konkreta, mätbara uppdrag – mindre varumärkesflum, mer leads och försäljning. För dig som köpare är det en hälsosam utgångspunkt.',
    sections: [
      {
        heading: 'Byråmarknaden i Örebro',
        paragraphs: [
          'Örebros läge som logistiknav – med stora distributionscentraler och ett tätt e-handelsnärande – har format en byråscen med stark kompetens inom just e-handelsmarknadsföring: Google Shopping, produktflöden, konverteringsoptimering och e-postautomation. Runt Örebro universitet växer dessutom nya digitala bolag fram i rask takt.',
          'Marknaden är lagom stor: tillräckligt många byråer för att du ska kunna jämföra, tillräckligt få för att de slåss om uppdragen. Det håller både priserna och servicenivån på en bra nivå för dig som kund.',
        ],
      },
      {
        heading: 'Prisnivåer i Örebro',
        paragraphs: [
          'Löpande SEO-arbete i Örebro kostar typiskt 7 000–16 000 kr i månaden för små och medelstora företag. Förvaltning av Google Ads ligger ofta på 3 000–7 000 kr i månaden utöver annonsbudgeten. Timpriser för seniora specialister brukar landa på 850–1 150 kr – klart under Stockholmsnivå.',
          'Eftersom många Örebroföretag driver e-handel eller återförsäljarhandel är det vanligt att byråer erbjuder paketpriser kopplade till försäljningsmål. Det kan vara ett bra upplägg – men se till att nyckeltalen definieras skriftligt innan du skriver på.',
        ],
      },
      {
        heading: 'Det här bör du ställa krav på',
        paragraphs: [
          'Krav nummer ett: transparent rapportering. Du ska kunna logga in i dina egna verktyg när som helst och se exakt vad pengarna gör. Krav nummer två: ägarskap. Annonskonton, spårningskoder och material ska ligga på dig – aldrig hos byrån.',
          'Fråga också om byråns erfarenhet av din bransch. En byrå som drivit e-handel i tio år är inte automatiskt rätt val för ett konsultbolag som behöver B2B-leads – och tvärtom. De bästa byråerna i Örebro är ärliga med var deras spets ligger.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en digital marknadsföringsbyrå i Örebro?', a: 'För löpande arbete ligger de flesta upplägg på 7 000–18 000 kr i månaden. Projekt som kampanjstarter eller SEO-genomlysningar kostar ofta 10 000–25 000 kr. Örebro är generellt 15–25 procent billigare än Stockholm för samma tjänster.' },
      { q: 'Vilken typ av marknadsföring passar mitt företag?', a: 'Det beror på var dina kunder finns. E-handlare i Örebro får oftast mest ut av Google Ads och SEO. Lokala tjänsteföretag bör prioritera lokal synlighet i Google Maps och sök. B2B-bolag bör satsa på LinkedIn-innehåll och sökannonsering. En bra byrå hjälper dig prioritera utifrån data, inte magkänsla.' },
      { q: 'Hur vet jag att byrån levererar?', a: 'Ställ krav på månadsrapporter med tre siffror: vad som gjordes, vad det kostade och vad det gav. Om byrån inte kan koppla sitt arbete till förfrågningar, trafik eller försäljning ska du byta. All spårning ska ligga i verktyg som du äger och kan granska själv.' },
      { q: 'Kan en Örebrobyrå hantera kunder utanför regionen?', a: 'Absolut – digital marknadsföring är distansarbete till sin natur. Många Örebrobyråer har kunder i hela landet. Det viktiga är upplägg, kommunikation och mätbarhet, inte postnummer.' },
    ],
  },

  'helsingborg/digital-marknadsforing': {
    title: 'Digital marknadsföring Helsingborg – jämför byråer | Updro',
    metaDesc: 'Hitta byrå för digital marknadsföring i Helsingborg. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Digital marknadsföring i Helsingborg',
    intro: 'Helsingborg kombinerar en av landets starkaste handels- och logistiktraditioner med närheten till både Malmö och Danmark. Byråmarknaden är kreativ, entreprenöriell och prispressad – och med Campus Helsingborg i stan tillkommer ständigt ny kompetens. Ett bra ställe att köpa digital marknadsföring på.',
    sections: [
      {
        heading: 'Så ser byråscenen ut i Helsingborg',
        paragraphs: [
          'Helsingborgs näringsliv vilar på handel, logistik och livsmedel, och det har gett en byråmarknad med stark kompetens inom e-handel, retail-marknadsföring och varumärkesarbete. Runt Oceanhamnen och Campus Helsingborg – en del av Lunds universitet – växer nya digitala byråer fram, ofta med unga specialister inom sociala medier och content.',
          'Många Helsingborgsbyråer arbetar också gränsöverskridande mot Danmark, vilket är värdefullt om du säljer utanför Sverige. Samtidigt gör närheten till Malmö och Lund att du kan räkna hela Skåne som din byråmarknad – konkurrensen om ditt uppdrag är stor.',
        ],
      },
      {
        heading: 'Vad kostar det i Helsingborg?',
        paragraphs: [
          'Löpande SEO-arbete ligger typiskt på 7 000–18 000 kr i månaden, Google Ads-förvaltning på 3 000–7 000 kr i månaden utöver annonsbudget, och sociala medier-upplägg på 5 000–15 000 kr i månaden. Timpriserna rör sig kring 850–1 200 kr för seniora specialister.',
          'Helsingborg ligger generellt 10–20 procent under Stockholm i pris. Eftersom byråtätheten är hög i Skåne lönar det sig alltid att låta flera byråer konkurrera om samma uppdrag innan du väljer.',
        ],
      },
      {
        heading: 'Tre frågor att ställa innan du väljer byrå',
        paragraphs: [
          'Fråga ett: kan ni visa ett case med siffror från ett företag som liknar mitt? Ni ska få höra vad som hände med trafik, leads eller försäljning – inte bara se snygga presentationer.',
          'Fråga två: vem arbetar med mitt konto efter att ni vunnit uppdraget? Fråga tre: hur avslutar vi samarbetet om det inte fungerar – vad händer med konton, material och data? En seriös Helsingborgsbyrå har tydliga svar på alla tre.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar digital marknadsföring i Helsingborg?', a: 'Räkna med 7 000–18 000 kr i månaden för ett löpande upplägg beroende på kanaler och ambition. Helsingborg ligger 10–20 procent under Stockholmspriserna. Jämför minst tre offerter – byråtätheten i Skåne gör att spannet ofta är stort.' },
      { q: 'Ska jag välja en byrå i Helsingborg, Malmö eller Lund?', a: 'Öppna upp för hela Skåne. Avstånden är korta, byråerna arbetar ofta över stadsgränserna och du får fler offerter att jämföra. Välj bara lokalt om du värdesätter frekventa fysiska möten högt.' },
      { q: 'Kan en Helsingborgsbyrå hjälpa mig mot den danska marknaden?', a: 'Ja, flera byråer i Helsingborg arbetar regelbundet mot Danmark och kan hantera danskspråkigt innehåll och danska annonsplattformar. Fråga specifikt om deras danska erfarenhet och be om referenser.' },
      { q: 'Hur snabbt får jag effekt av insatsen?', a: 'Betald annonsering kan ge kunder från första veckan men behöver en till två månaders optimering. SEO och content tar tre till sex månader innan effekten syns tydligt. Se upp med byråer som lovar snabba SEO-resultat – det finns inga genvägar.' },
    ],
  },

  'boras/digital-marknadsforing': {
    title: 'Digital marknadsföringsbyrå Borås – jämför offerter | Updro',
    metaDesc: 'Hitta digital marknadsföringsbyrå i Borås. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Digital marknadsföringsbyrå i Borås',
    intro: 'Borås är Sveriges e-handelshuvudstad. Här växte Ellos-gruppen, Nelly och flera av landets största textil- och modehandlar fram, och Textilhögskolan fyller ständigt på med ny kompetens. Få svenska städer har en så koncentrerad kunskap om digital försäljning – det märks i byråutbudet.',
    sections: [
      {
        heading: 'Marknaden i Borås – e-handel i ryggmärgen',
        paragraphs: [
          'Borås byråscen är unik i Sverige eftersom den vuxit fram ur e-handeln snarare än ur reklambranschen. Många av stadens byråer och konsulter har sin bakgrund direkt från de stora e-handelsbolagen, vilket ger en praktisk, försäljningsnära kompetens: produktflöden, Google Shopping, konverteringsoptimering, e-postautomation och lagerstyrd annonsering.',
          'För dig som driver webbutik är Borås därför ett av landets bästa ställen att leta byrå på. För dig i en annan bransch finns samtidigt ett gott utbud av byråer med bredare kompetens – och priserna ligger klart under Göteborgs, bara 45 minuter bort.',
        ],
      },
      {
        heading: 'Prisnivåer i Borås',
        paragraphs: [
          'Löpande SEO-arbete kostar typiskt 7 000–16 000 kr i månaden. Google Ads-förvaltning ligger på 3 000–7 000 kr i månaden utöver annonsbudgeten, och e-handelsfokuserade upplägg med flöden och feedoptimering börjar ofta runt 10 000 kr i månaden. Timpriser för seniora specialister: 850–1 150 kr.',
          'Räkna med att Borås ligger 15–25 procent under Göteborg i pris – och en hel del under Stockholm. Det gör att många företag i hela Västsverige väljer Boråsbyråer för e-handelsarbete.',
        ],
      },
      {
        heading: 'Så väljer du rätt e-handelsbyrå i Borås',
        paragraphs: [
          'Be byrån beskriva hur de arbetar med produktflöden och Shopping-annonser – det är grundbulten i e-handelsmarknadsföring och skiljer specialisten från generalisten. Fråga också hur de förhåller sig till marginaler: en duktig e-handelsmarknadsförare pratar om lönsamhet per order, inte bara klickpriser.',
          'Kontrollera slutligen att byrån har erfarenhet av din plattform – Shopify, WooCommerce, Centra eller något annat. Plattformskunskap sparar både tid och pengar i uppstarten.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en digital marknadsföringsbyrå i Borås?', a: 'För löpande arbete ligger de flesta upplägg på 7 000–18 000 kr i månaden. E-handelsupplägg med flödeshantering och Shopping-annonsering börjar ofta runt 10 000 kr i månaden. Borås ligger generellt 15–25 procent under Göteborgspriserna.' },
      { q: 'Är Borås verkligen bättre på e-handel än andra städer?', a: 'Kompetensen är ovanligt koncentrerad: stadens textil- och e-handelshistoria innebär att många byråer och konsulter har drivit digital försäljning i stor skala. För e-handlare är utbudet i Borås därför starkare än i många större städer.' },
      { q: 'Hjälper byråer i Borås även företag utanför modebranschen?', a: 'Ja. E-handelskompetensen i Borås har breddats till många branscher – hem och trädgård, fritid, B2B-handel och mer. Fråga om branschspecifika case, men utgå från att grundkompetensen i digital försäljning är hög oavsett sektor.' },
      { q: 'Behöver jag träffa byrån fysiskt?', a: 'Nej, men närheten är en bonus. Borås ligger 45 minuter från Göteborg och byråerna är vana vid distansarbete med kunder i hela landet. Kombinera gärna ett fysiskt uppstartsmöte med digitala avstämningar därefter.' },
    ],
  },

  'lund/digital-marknadsforing': {
    title: 'Digital marknadsföringsbyrå Lund – jämför offerter | Updro',
    metaDesc: 'Hitta digital marknadsföringsbyrå i Lund. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Digital marknadsföringsbyrå i Lund',
    intro: 'Lund är en av Sveriges mest kunskapstäta städer. Med Lunds universitet, Ideon Science Park och forskningsanläggningarna MAX IV och ESS finns här ett ovanligt stort utbud av tekniknära byråer – ofta med spets inom B2B, deep tech och internationell marknadsföring.',
    sections: [
      {
        heading: 'Byråmarknaden i Lund',
        paragraphs: [
          'Lunds näringsliv domineras av forskning, life science och teknik – bolag som Axis Communications och en lång rad universitetsspinoffs har skapat efterfrågan på marknadsföring som klarar komplexa budskap och långa säljcykler. Det har format byråerna: analytiska, innehållsdrivna och vana vid krävande kunder.',
          'Samtidigt ligger Lund mitt i den skånska byråtriangeln med Malmö och Helsingborg, vilket håller konkurrensen hög och priserna rimliga. Många Lundsbyråer har kunder i hela Öresundsregionen, inklusive Köpenhamn.',
        ],
      },
      {
        heading: 'Prisnivåer i Lund',
        paragraphs: [
          'Löpande SEO-arbete kostar typiskt 8 000–18 000 kr i månaden. Google Ads-förvaltning ligger på 3 000–8 000 kr i månaden utöver annonsbudgeten, och content- eller leadsgenereringsupplägg för B2B börjar ofta runt 15 000 kr i månaden. Seniora timpriser: 900–1 300 kr.',
          'Lund ligger något under Malmö och tydligt under Stockholm i pris. Byråer med spets inom life science och teknik kan dock ta högre arvoden – kompetensen inom dessa nischer är efterfrågad.',
        ],
      },
      {
        heading: 'Välja byrå i Lund – det här avgör',
        paragraphs: [
          'Om du säljer något komplext – teknik, forskningsnära tjänster, B2B – prioritera byråer som visar att de kan ämnet. Be dem förklara din produkt tillbaka till dig efter första mötet. Om de inte förstår vad du säljer kommer marknadsföringen aldrig att träffa.',
          'Säljer du däremot till konsumenter eller driver lokal handel finns billigare och lika duktiga alternativ både i Lund och i resten av Skåne. Matcha byråns spets mot din verklighet, inte mot deras snyggaste case.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en digital marknadsföringsbyrå i Lund?', a: 'Räkna med 8 000–20 000 kr i månaden för löpande arbete. B2B- och teknikspecialister kan ligga högre, medan bredare konsumentinriktade byråer ofta är billigare. Lund ligger något under Malmö och klart under Stockholm i pris.' },
      { q: 'Finns byråer i Lund som kan B2B och teknik?', a: 'Ja, det är Lunds starkaste kort. Universitetet, Ideon och stadens teknikbolag har skapat en byråmarknad med ovanligt god förståelse för komplexa produkter, långa beslutsprocesser och internationella marknader.' },
      { q: 'Kan en Lundsbyrå hjälpa mig internationellt?', a: 'Många kan. Öresundsregionens byråer arbetar ofta på engelska och ibland danska, och flera har erfarenhet av att driva kampanjer i hela Norden och Europa. Fråga specifikt om vilka marknader de arbetat mot tidigare.' },
      { q: 'Hur lång är en normal uppstart?', a: 'Räkna med två till fyra veckor för strategi, spårning och kampanjuppsättning. Betald annonsering kan ge effekt direkt efteråt, medan SEO och innehållsarbete tar tre till sex månader att ge tydliga resultat.' },
    ],
  },

  'kalmar/digital-marknadsforing': {
    title: 'Digital marknadsföring Kalmar – jämför byråer gratis | Updro',
    metaDesc: 'Hitta byrå för digital marknadsföring i Kalmar. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Digital marknadsföring i Kalmar',
    intro: 'Kalmar är en liten men slagkraftig byråmarknad. Staden har fostrat flera framgångsrika e-handelsbolag, Linnéuniversitetet levererar ny kompetens varje år, och närheten till Öland ger ett starkt inslag av turismnäring. Konkurrensen om de lokala uppdragen är begränsad – vilket gör det extra viktigt att jämföra innan du väljer.',
    sections: [
      {
        heading: 'Marknaden i Kalmar',
        paragraphs: [
          'Kalmars byråscen består till största delen av mindre och medelstora byråer med bred kompetens snarare än smal spets. Det passar stadens näringsliv väl: lokala handlare, tillverkande småföretag, turismaktörer och ett växande antal e-handlare som säljer till hela landet.',
          'För lokal synlighet – Google Maps, lokala sökord, recensioner – räcker ofta en mindre insats långt i en stad av Kalmars storlek. Konkurrensen i sökresultaten är betydligt svagare än i storstäderna, så väl genomfört arbete syns snabbt.',
        ],
      },
      {
        heading: 'Prisnivåer i Kalmar',
        paragraphs: [
          'Kalmar har några av landets mest fördelaktiga priser på digital marknadsföring. Löpande SEO-arbete kostar typiskt 6 000–14 000 kr i månaden, Google Ads-förvaltning 2 500–6 000 kr i månaden utöver annonsbudgeten, och timpriser för seniora specialister ligger runt 800–1 100 kr.',
          'Eftersom utbudet av byråer i stan är begränsat kan det löna sig att även ta in offerter från byråer i Växjö, Karlskrona eller på distans. Via Updro får du upp till tre offerter och kan jämföra nivåerna direkt.',
        ],
      },
      {
        heading: 'Tips för dig som anlitar byrå i Kalmar',
        paragraphs: [
          'I en mindre stad är rykte allt – be om referenser från andra lokala företag och ring dem. Det är det snabbaste sättet att skilja seriösa aktörer från pratglada säljare.',
          'Fundera också på vad du faktiskt behöver. Många Kalmarföretag klarar sig långt på lokal SEO, en fungerande Google Business-profil och riktad annonsering i regionen – för en bråkdel av vad en stor Stockholmsbyrå skulle ta betalt för samma sak.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar digital marknadsföring i Kalmar?', a: 'Kalmar är en av de billigaste byråmarknaderna i landet. Räkna med 6 000–14 000 kr i månaden för löpande arbete och 2 500–6 000 kr i månaden för Ads-förvaltning utöver annonsbudgeten. Jämför gärna mot byråer i Växjö och Karlskrona för att pressa priset ytterligare.' },
      { q: 'Finns det tillräckligt många byråer att välja mellan i Kalmar?', a: 'Utbudet är mindre än i storstäderna men tillräckligt för att du ska kunna jämföra – särskilt om du även tar in byråer från resten av Småland och Kronoberg. För lokala tjänster som SEO och annonsering spelar distansarbete dessutom ingen roll.' },
      { q: 'Vad ger mest effekt för ett lokalt företag i Kalmar?', a: 'Lokal SEO och en välskött Google Business-profil ger oftast snabbast avkastning – konkurrensen i lokala sökresultat är svag och väl genomfört arbete syns inom några månader. Komplettera med riktade annonser mot Kalmarregionen vid säsongstoppar.' },
      { q: 'Kan en Kalmarbyrå hjälpa min e-handel som säljer i hela Sverige?', a: 'Ja. Kalmar har en stark e-handelstradition och flera byråer med erfarenhet av rikstäckande försäljning. Be om case med siffror – trafik, konverteringsgrad och intäkt per annonskrona – innan du väljer.' },
    ],
  },

  'jonkoping/digital-marknadsforing': {
    title: 'Marknadsföringsbyrå Jönköping – jämför offerter | Updro',
    metaDesc: 'Hitta marknadsföringsbyrå i Jönköping. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Marknadsföringsbyrå i Jönköping',
    intro: 'Jönköping är entreprenörsstaden mitt i Småland – med ett av landets starkaste logistiklägen, internationellt kända mässor på Elmia och en företagartradition som genomsyrar hela regionen. Byråmarknaden är praktisk, prismedveten och van vid tillverkande företag som vill se konkreta resultat.',
    sections: [
      {
        heading: 'Marknaden i Jönköping',
        paragraphs: [
          'Jönköpings näringsliv präglas av logistik, handel och tillverkning – många av landets största e-handelslager ligger här tack vare läget där E4:an möter riksvägarna mot hela södra Sverige. Det har gett en byråscen med stark kompetens inom e-handelsmarknadsföring, B2B-leadsgenerering och mässrelaterade kampanjer.',
          'Jönköping International Business School fyller ständigt på med ung kompetens, vilket håller byråerna på tårna och priserna konkurrenskraftiga. Räkna med 15–25 procent lägre priser än i Stockholm för motsvarande arbete.',
        ],
      },
      {
        heading: 'Prisnivåer i Jönköping',
        paragraphs: [
          'Löpande SEO-arbete kostar typiskt 7 000–15 000 kr i månaden för små och medelstora företag. Google Ads-förvaltning ligger på 3 000–6 000 kr i månaden utöver annonsbudgeten, och timpriser för seniora specialister rör sig kring 850–1 150 kr.',
          'Många Jönköpingsbyråer arbetar med kunder i hela Småland och Västra Götaland, så konkurrensen om uppdragen är stor – till din fördel som köpare.',
        ],
      },
      {
        heading: 'Så väljer du rätt i Jönköping',
        paragraphs: [
          'Småländsk företagsamhet betyder ofta att budgetdisciplinen är hög – se till att byrån matchar den. Be om ett upplägg med tydliga delmål per kvartal och möjlighet att pausa utan långa uppsägningstider.',
          'Fråga också om erfarenhet från din bransch. En byrå som drivit leads åt tillverkande B2B-bolag har en helt annan verktygslåda än en som jobbar med konsumentkampanjer i sociala medier. Båda finns i Jönköping – välj medvetet.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en marknadsföringsbyrå i Jönköping?', a: 'Räkna med 7 000–16 000 kr i månaden för löpande arbete beroende på kanalmix och ambition. Jönköping ligger 15–25 procent under Stockholmspriserna. Jämför minst tre offerter – spannet mellan byråerna är ofta stort.' },
      { q: 'Vilken marknadsföring fungerar bäst för tillverkande företag?', a: 'För B2B-tillverkare i Jönköpingsregionen ger sökannonsering mot specifika yrkesroller och branschtermer ofta bäst kostnad per lead, kombinerat med innehåll som bygger förtroende under långa beslutsprocesser. LinkedIn är värt att testa för nischade tjänster.' },
      { q: 'Behöver jag en byrå som kan mässmarknadsföring?', a: 'Om du ställer ut på Elmia eller andra mässor – ja, välj en byrå med dokumenterad erfarenhet av kampanjer före, under och efter mässor. Det är en egen disciplin där timing och uppföljning avgör mer än budget.' },
      { q: 'Kan jag anlita en byrå utanför Jönköping?', a: 'Absolut. Digital marknadsföring levereras lika bra på distans, och många byråer i Göteborg, Stockholm och Malmö har kunder i Jönköping. Öppna upp för fler städer om du vill maximera urvalet – välj lokalt om du värdesätter fysiska möten.' },
    ],
  },

  'boras/seo': {
    title: 'SEO-byrå Borås – jämför offerter från experter | Updro',
    metaDesc: 'Hitta SEO-byrå i Borås. Jämför offerter från upp till tre granskade SEO-experter – gratis och utan förpliktelser.',
    h1: 'SEO-byrå i Borås',
    intro: 'I e-handelsstaden Borås är SEO inte en teknisk detalj – det är kärnverksamhet. Stadens textil- och e-handelsarv har skapat en ovanligt stark kompetens inom just e-handels-SEO: kategorisidor, produktflöden och struktur som rankar. För dig som säljer online är Borås ett av landets bästa ställen att leta SEO-byrå på.',
    sections: [
      {
        heading: 'SEO-marknaden i Borås',
        paragraphs: [
          'Borås byråer har vuxit fram tillsammans med några av Sveriges största e-handlare. Det betyder att SEO-kompetensen här ofta är djupt praktisk: teknisk SEO för stora produktkataloger, sökmotoroptimering av kategori- och filtersidor, och innehållsstrategier som driver försäljning – inte bara trafik.',
          'Även för dig utanför e-handeln finns goda alternativ. Lokala tjänsteföretag i Borås har relativt svag konkurrens i sökresultaten, så väl genomförd lokal SEO ger snabb effekt här jämfört med Göteborg eller Stockholm.',
        ],
      },
      {
        heading: 'Vad kostar SEO i Borås?',
        paragraphs: [
          'Löpande SEO-arbete kostar typiskt 7 000–16 000 kr i månaden beroende på omfattning. En teknisk genomlysning av en webbutik ligger ofta på 15 000–35 000 kr som engångskostnad. Timpriser för seniora SEO-specialister: 850–1 200 kr.',
          'Borås ligger generellt 15–25 procent under Göteborg i pris, och flera av stadens byråer tar kunder i hela Västsverige. Jämför alltid minst tre offerter – uppläggen skiljer sig mer än du tror.',
        ],
      },
      {
        heading: 'Tre frågor till SEO-byrån innan du väljer',
        paragraphs: [
          'Fråga ett: vad gör ni månad ett, två och tre – konkret? Ett seriöst svar innehåller teknisk genomlysning, sökordsanalys och en innehållsplan, inte bara "optimering". Fråga två: hur rapporterar ni? Du ska få se placeringar, trafik och konverteringar – inte bara aktiviteter.',
          'Fråga tre: vad händer om vi avslutar samarbetet? Allt material, alla texter och all åtkomst ska vara din. Undvik byråer som bygger ditt innehåll på deras plattformar eller vägrar lämna ut inloggningar.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en SEO-byrå i Borås?', a: 'Räkna med 7 000–16 000 kr i månaden för löpande arbete och 15 000–35 000 kr för en teknisk genomlysning som engångsinsats. Borås är generellt 15–25 procent billigare än Göteborg för samma kompetens.' },
      { q: 'Hur lång tid tar det innan SEO ger resultat?', a: 'Räkna med tre till sex månader för tydlig effekt på trafik och placeringar. I Borås, där konkurrensen i många lokala sök är svag, kan det gå snabbare. En byrå som lovar resultat på några veckor använder antagligen metoder som kan skada dig långsiktigt.' },
      { q: 'Är Boråsbyråer verkligen bättre på e-handels-SEO?', a: 'Kompetensen är ovanligt koncentrerad här eftersom byråerna vuxit fram tillsammans med stadens stora e-handlare. Om du driver webbutik – särskilt med många produkter – är Borås en av landets starkaste marknader för e-handels-SEO.' },
      { q: 'Vad ingår i ett normalt SEO-upplägg?', a: 'En seriös start innehåller teknisk genomlysning, sökordsanalys, åtgärdslista prioriterad efter effekt, samt löpande arbete med innehåll och länkar. Du ska få en månadsrapport som visar placeringar, trafik och vad som gjorts.' },
    ],
  },

  'karlstad/seo': {
    title: 'SEO-byrå Karlstad – jämför offerter gratis | Updro',
    metaDesc: 'Hitta SEO-byrå i Karlstad. Jämför offerter från upp till tre granskade SEO-byråer – gratis och utan förpliktelser.',
    h1: 'SEO-byrå i Karlstad',
    intro: 'Karlstad är Värmlands centrum med ett näringsliv som spänner från pappers- och förpackningsindustri till turism och tjänsteföretag. Konkurrensen i de lokala sökresultaten är fortfarande låg – vilket gör SEO till en av de mest kostnadseffektiva investeringarna för ett Karlstadsföretag just nu.',
    sections: [
      {
        heading: 'SEO-marknaden i Karlstad',
        paragraphs: [
          'Karlstads byråscen är liten men kompetent, med rötter i Karlstads universitet och stadens starka serviceforskning. Byråerna här är vana vid blandade uppdrag: lokala tjänsteföretag som behöver synas i Maps, B2B-bolag kopplade till industriklustren, och turismaktörer med säsongstoppar.',
          'Det som gör Karlstad intressant ur SEO-perspektiv är den svaga konkurrensen. I många lokala sökningar rankar gamla, dåligt optimerade sidor högt – vilket betyder att ett strukturerat SEO-arbete kan ge toppplaceringar inom några månader snarare än år.',
        ],
      },
      {
        heading: 'Prisnivåer i Karlstad',
        paragraphs: [
          'Löpande SEO-arbete i Karlstad kostar typiskt 6 000–14 000 kr i månaden för små och medelstora företag. En teknisk genomlysning som engångsinsats ligger ofta på 10 000–25 000 kr. Seniora timpriser rör sig kring 800–1 100 kr.',
          'Karlstad hör till de prisvänligare byråmarknaderna i landet. Överväg att även ta in offerter från distansbyråer – skillnaden i pris kan vara liten men skillnaden i spetskompetens stor, beroende på din nisch.',
        ],
      },
      {
        heading: 'Så får du mest ut av SEO i en mindre stad',
        paragraphs: [
          'Prioritera rätt: börja med Google Business-profilen, lokala sökord och recensioner innan du satsar på större innehållssatsningar. I Karlstad räcker de grundläggande insatserna ovanligt långt eftersom få konkurrenter gjort dem ordentligt.',
          'Be byrån visa exempel på lokala sökord de redan tagit till topp tre. I en marknad som Karlstad ska en kompetent byrå kunna demonstrera konkreta resultat relativt snabbt – annars är det varningsklockan som ringer.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en SEO-byrå i Karlstad?', a: 'Räkna med 6 000–14 000 kr i månaden för löpande arbete och 10 000–25 000 kr för en teknisk genomlysning. Karlstad är en av landets mer prisvänliga byråmarknader – men jämför alltid flera offerter, uppläggen skiljer sig åt.' },
      { q: 'Hur snabbt syns SEO-resultat i Karlstad?', a: 'Snabbare än i storstäderna. Konkurrensen i lokala sökresultat är svag, så lokala företag som gör grunderna rätt – teknisk ordning, lokala sökord, recensioner – ser ofta effekt inom två till fyra månader.' },
      { q: 'Räcker det med en lokal byrå eller behöver jag en större?', a: 'För de flesta Karlstadsföretag räcker en lokal eller regional byrå utmärkt. Har du rikstäckande e-handel eller mycket specifika tekniska behov kan det vara värt att ta in en specialistbyrå på distans i jämförelsen.' },
      { q: 'Vad är viktigast att börja med?', a: 'Google Business-profilen och lokal synlighet. Fullständig information, rätt kategorier, regelbundna inlgg och ett aktivt arbete med kundrecensioner ger oftast snabbast avkastning av alla SEO-insatser i en stad som Karlstad.' },
    ],
  },

  'jonkoping/grafisk-design': {
    title: 'Designbyrå Jönköping – jämför offerter gratis | Updro',
    metaDesc: 'Hitta designbyrå i Jönköping. Jämför offerter från upp till tre granskade byråer inom grafisk design och varumärke – gratis.',
    h1: 'Designbyrå i Jönköping',
    intro: 'Jönköpings designscen bärs av stadens entreprenörsanda: här finns massor av tillverkande företag, e-handlare och mässutställare som ständigt behöver förpackningar, profiler och kampanjmaterial. Det har skapat designbyråer som är vana vid deadlines, produktion och konkret nytta – inte bara snygga presentationer.',
    sections: [
      {
        heading: 'Designmarknaden i Jönköping',
        paragraphs: [
          'Jönköpings näringsliv – logistik, handel, tillverkning och Elmiadriven mässverksamhet – ställer praktiska krav på designen. Byråerna i stan är därför ofta starka på det kommersiella: förpackningsdesign, säljmaterial, mässmontrar och varumärkesprofiler som ska fungera i produktion, inte bara på skärmen.',
          'Samtidigt har Jönköping University och regionens många tillväxtbolag gett upphov till yngre studios med modern digital designkompetens. Utbudet spänner alltså från traditionella reklambyråer till nischade digitala designers.',
        ],
      },
      {
        heading: 'Vad kostar en designbyrå i Jönköping?',
        paragraphs: [
          'En professionell logotyp kostar typiskt 15 000–40 000 kr, en komplett grafisk profil 25 000–70 000 kr och löpande designarbete 800–1 100 kr i timmen. Mässrelaterad produktion offereras oftast som projekt.',
          'Jönköping ligger klart under Stockholm och Göteborg i pris – ofta 15–25 procent. Förpacknings- och produktionsvana är dessutom vanligare här än i storstäderna, vilket kan spara dyra produktionsfel.',
        ],
      },
      {
        heading: 'Så väljer du rätt designbyrå',
        paragraphs: [
          'Titta på byråns portfölj med dina kunders ögon, inte dina egna. Fråga: vilka av dessa jobb liknar det vi behöver? Be sedan höra om processen bakom – hur många skisser, hur många korrekturvändor och vad som händer om ni inte gillar första förslaget.',
          'Kläm slutligen fast vem som gör arbetet. I mindre byråer är det ofta grundaren själv – en styrka. I större kan ditt jobb hamna hos den juniora designern medan seniorerna säljer. Båda uppläggen fungerar, men du ska veta vilket du betalar för.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en designbyrå i Jönköping?', a: 'En logotyp kostar typiskt 15 000–40 000 kr och en komplett grafisk profil 25 000–70 000 kr. Timpriser ligger runt 800–1 100 kr. Jönköping är generellt 15–25 procent billigare än Stockholm för motsvarande kvalitet.' },
      { q: 'Vad ingår i en grafisk profil?', a: 'En komplett profil innehåller logotyp i alla format, färger med exakta koder, typsnitt, bildstil, mallar för vanliga dokument och presentationer samt en manual som beskriver hur allt används. Se till att originalfilerna ingår och att du äger dem.' },
      { q: 'Kan en Jönköpingsbyrå hjälpa till inför mässor?', a: 'Ja, mässdesign är ett av Jönköpings specialområden tack vare Elmia. Flera byråer har lång erfarenhet av monterdesign, mässmaterial och kampanjer kopplade till mässor. Hör av dig i god tid – högsäsongen bokas upp tidigt.' },
      { q: 'Hur lång tid tar ett designprojekt?', a: 'En logotyp tar normalt två till fyra veckor, en komplett grafisk profil fyra till åtta veckor beroende på omfattning och antal korrekturvändor. Var tydlig med deadlines från start och bygg in tid för minst två ändringsrundor.' },
    ],
  },

  'linkoping/grafisk-design': {
    title: 'Designbyrå Linköping – jämför offerter gratis | Updro',
    metaDesc: 'Hitta designbyrå i Linköping. Jämför offerter från upp till tre granskade byråer inom grafisk design och varumärke – gratis.',
    h1: 'Designbyrå i Linköping',
    intro: 'Linköping är en av Sveriges starkaste teknikstäder – och det märks i designutbudet. Här finns byråer som är specialiserade på att göra komplex teknik begriplig: infografik, produktvisualisering, UX-nära grafisk design och varumärken för B2B-bolag som säljer svårförklarade saker.',
    sections: [
      {
        heading: 'Designmarknaden i Linköping',
        paragraphs: [
          'Med Saab, Ericsson, Linköpings universitet och Mjärdevi Science Park i stan har Linköpings designbyråer utvecklat en sällsynt förmåga: att översätta avancerad teknik till tydlig visuell kommunikation. Om din produkt kräver förklaring – mjukvara, industri, forskningsnära tjänster – finns få bättre städer att leta design på.',
          'Det finns också en livlig kreativ scen med yngre studios, ofta med rötter vid universitetets design- och kommunikationsprogram. Priserna ligger generellt 15–25 procent under Stockholm.',
        ],
      },
      {
        heading: 'Prisnivåer i Linköping',
        paragraphs: [
          'En professionell logotyp kostar typiskt 15 000–45 000 kr, en grafisk profil 25 000–75 000 kr och teknisk illustration eller infografik offereras oftast per projekt från cirka 10 000 kr. Timpriser: 850–1 200 kr för seniora designers.',
          'Linköping konkurrerar direkt med Norrköping om designtjänsterna i Östergötland, vilket håller priserna nere. Ta in offerter från båda städerna – spannet kan vara förvånansvärt stort för samma uppdrag.',
        ],
      },
      {
        heading: 'Det här ska du fråga om',
        paragraphs: [
          'Om du säljer något tekniskt: be byrån visa ett exempel där de gjort en komplex produkt begriplig. Det är en helt annan disciplin än att göra något vackert – och det är här Linköpingsbyråerna är som starkast.',
          'Fråga också om filhantering: du ska få ut originalfiler (inte bara PDF:er), rättigheterna ska vara dina, och profilmanualen ska vara så tydlig att nästa byrå kan ta över utan att något går förlorat.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en designbyrå i Linköping?', a: 'Räkna med 15 000–45 000 kr för en logotyp, 25 000–75 000 kr för en komplett grafisk profil och 850–1 200 kr i timmen för löpande arbete. Linköping ligger 15–25 procent under Stockholmspriserna.' },
      { q: 'Hittar jag byråer som kan teknisk visualisering i Linköping?', a: 'Ja, det är stadens specialitet. Närheten till Saab, universitetet och Mjärdevi har skapat byråer med lång erfarenhet av infografik, produktvisualisering och design som förklarar komplex teknik.' },
      { q: 'Vad ingår när jag köper en logotyp?', a: 'Minst: logotypen i vektorformat, färgversioner för ljust och mörkt underlag, svartvit variant samt favicon och sociala medier-format. Se till att originalfilerna och fulla rättigheter ingår i priset – annars betalar du igen vid nästa behov.' },
      { q: 'Hur många designförslag ska jag förvänta mig?', a: 'De flesta seriösa byråer presenterar två till tre skisser i första rundan, följt av ett avtalat antal ändringsvändor – oftast två eller tre. Obegränsade ändringsrundor låter lockande men leder ofta till otydliga processer. Skriftliggör upplägget innan start.' },
    ],
  },

  'gavle/webbutveckling': {
    title: 'Webbdesign Gävle – jämför webbyråer gratis | Updro',
    metaDesc: 'Hitta webbyrå för webbdesign i Gävle. Jämför offerter från upp till tre granskade byråer – gratis och utan förpliktelser.',
    h1: 'Webbdesign i Gävle',
    intro: 'Gävle ligger en timme från Stockholm men prissätts som en helt annan marknad. Stadens byråer levererar webbdesign och webbutveckling till hamn- och logistikbolag, industri och lokal handel – ofta till priser 20–30 procent under huvudstaden, med kortare ledtider som bonus.',
    sections: [
      {
        heading: 'Webbmarknaden i Gävle',
        paragraphs: [
          'Gävles näringsliv präglas av hamnen, logistik och tillverkande industri, men också av närheten till Stockholm – många Gävlebyråer har kunder i hela Mälardalen. Det har skapat en pragmatisk byråkultur: fokus på webbplatser som genererar förfrågningar och säljer, snarare än på designpriser.',
          'Utbudet i stan är lagom stort – ett tiotal seriösa webbyråer och ett större antal frilansare. För dig som köpare betyder det att jämförelsen är extra viktig: kvaliteten varierar mer än priset.',
        ],
      },
      {
        heading: 'Vad kostar webbdesign i Gävle?',
        paragraphs: [
          'En företagshemsida med fem till tio sidor kostar typiskt 20 000–60 000 kr i Gävle, en enklare landningssida 8 000–20 000 kr och en webbutik från cirka 40 000 kr. Timpriser för webbutveckling ligger runt 800–1 100 kr.',
          'Räkna med att samma uppdrag i Stockholm kostar 20–30 procent mer. Många Gävleföretag utnyttjar också omvänt-läget: de anlitar byråer på distans och får Gävlepriser på Stockholmskompetens – eller tvärtom.',
        ],
      },
      {
        heading: 'Fem krav att ställa på webbyrån',
        paragraphs: [
          'Kräv en tydlig offert med fast pris eller takpris, en projektplan med delleveranser och beskrivning av vad som ingår efter lansering. Fråga vilket publiceringsverktyg som används och om du själv kan uppdatera innehållet – att vara låst till byrån för varje textändring blir dyrt med tiden.',
          'Säkerställ slutligen att du äger domänen, hostingkontot och all källkod. Det låter självklart men är den vanligaste konflikten mellan företag och webbyråer. En seriös Gävlebyrå svarar ja på alla tre punkter utan att blinka.',
        ],
      },
    ],
    faq: [
      { q: 'Vad kostar en hemsida i Gävle?', a: 'En företagshemsida kostar typiskt 20 000–60 000 kr beroende på omfattning, en enklare landningssida 8 000–20 000 kr och en webbutik från cirka 40 000 kr. Gävle ligger 20–30 procent under Stockholmspriserna.' },
      { q: 'Hur lång tid tar det att bygga en hemsida?', a: 'En enkel företagssida tar normalt tre till sex veckor från start till lansering, en större sajt eller webbutik åtta till sexton veckor. Största flaskhalsen brukar vara innehållet – ha texter och bilder klara innan projektet startar så går det fortare.' },
      { q: 'WordPress, Webflow eller något annat?', a: 'WordPress passar de flesta företag: billigt, flexibelt och lätt att hitta hjälp med. Webflow ger snyggare design med mindre underhåll men färre integrationsmöjligheter. Custom-byggt passar bara om du har mycket specifika behov. En bra byrå rekommenderar utifrån ditt behov – inte det de själva gillar bäst.' },
      { q: 'Behöver jag en byrå i Gävle eller räcker det med distans?', a: 'Webbprojekt fungerar utmärkt på distans – det viktiga är struktur och kommunikation, inte plats. Många Gävleföretag anlitar byråer i andra städer, och Gävlebyråer har kunder i hela landet. Välj det som ger bäst kombination av pris och kompetens.' },
    ],
  },
}

export const getCityCategoryDeep = (citySlug: string, categorySlug: string): CityCategoryDeepContent | undefined =>
  CITY_CATEGORY_DEEP[`${citySlug}/${categorySlug}`]
