/**
 * Enda källan för startsidans SEO-metadata och FAQ.
 * Får INTE importera React eller andra seo-datamoduler – filen läses av
 * seoStatic.ts under build (prerender).
 */

export const HOME_TITLE = 'Hitta rätt byrå utan massutskick – jämför offerter | Updro'
export const HOME_DESCRIPTION = 'Beskriv projektet på två minuter. Updro granskar briefen och högst tre relevanta svenska byråer lämnar offert på webb, e-handel, SEO och AI. Gratis.'
export const HOME_H1 = 'Hitta rätt byrå – utan massutskick'
export const HOME_CANONICAL = 'https://updro.se/'

export interface HomeFaqItem {
  q: string
  a: string
}

export const HOME_FAQ: HomeFaqItem[] = [
  {
    q: 'Kostar det något att använda Updro?',
    a: 'Nej. Det är gratis för dig som söker byrå. Byråer betalar per lead de själva väljer att låsa upp eller använder ett månadskort.',
  },
  {
    q: 'Hur många offerter kan jag få?',
    a: 'Högst tre byråer kan lämna offert på samma uppdrag. Tanken är att du ska få ett hanterbart antal relevanta alternativ, inte ett massutskick.',
  },
  {
    q: 'Hur snabbt får jag svar?',
    a: 'Svarstiden beror på kategori, budget och tillgängliga byråer. Updro öppnar uppdraget efter granskning och meddelar dig när en offert kommer, men garanterar inte en viss svarstid.',
  },
  {
    q: 'Hur granskas uppdrag och byråer?',
    a: 'Nya uppdrag granskas innan de aktiveras. Byråer lämnar företags- och kontaktuppgifter och kan få olika verifieringsnivåer när underlaget har kontrollerats. Aktuell verifieringsstatus visas i tjänsten.',
  },
  {
    q: 'Måste jag registrera mig?',
    a: 'Nej. Du kan skicka in en förfrågan utan konto. Ett kostnadsfritt konto behövs först när du vill följa offerter och dialog i dashboarden.',
  },
  {
    q: 'Vad händer med mina kontaktuppgifter?',
    a: 'Kontaktuppgifterna är låsta och blir bara synliga för en byrå som aktivt väljer att låsa upp just ditt uppdrag. De visas inte öppet i marknadsplatsen.',
  },
]
