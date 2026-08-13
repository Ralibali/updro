/**
 * Enda källan för startsidans SEO-metadata och FAQ.
 * Får INTE importera React eller andra seo-datamoduler – filen läses av
 * seoStatic.ts under build (prerender).
 */

export const HOME_TITLE = 'Jämför digitala byråer och offerter – max tre svar | Updro'
export const HOME_DESCRIPTION = 'Beskriv projektet en gång och jämför högst tre relevanta offerter från svenska digitala byråer. Briefen granskas och tjänsten är gratis för beställare.'
export const HOME_H1 = 'Jämför rätt byrå – utan att jaga offerter'
export const HOME_CANONICAL = 'https://updro.se/'

export interface HomeFaqItem {
  q: string
  a: string
}

export const HOME_FAQ: HomeFaqItem[] = [
  {
    q: 'Kostar det något att använda Updro?',
    a: 'Nej. Updro är gratis för dig som söker byrå. Byråer betalar per lead de själva väljer att låsa upp eller använder ett månadskort.',
  },
  {
    q: 'Hur många offerter kan jag få?',
    a: 'Högst tre byråer kan lämna offert på samma uppdrag. Målet är ett hanterbart antal relevanta alternativ som går att jämföra, inte ett massutskick.',
  },
  {
    q: 'Vad kan jag jämföra mellan offerterna?',
    a: 'Du kan jämföra bland annat pris, upplägg, tidsplan och byråns kompetens. Updro är byggt för att göra beslutsunderlaget tydligare än om du själv kontaktar flera byråer var för sig.',
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
