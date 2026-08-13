export const PARTNA_VERIFIED_DATE = '2026-08-14'

export const PARTNA_FACTS = {
  payAsYouGo: 490,
  basicMonthly: 1495,
  basicIncludedLeads: 5,
  standardMonthly: 1950,
  standardIncludedLeads: 10,
  successFeeRate: 0.07,
  maxOffers: 6,
} as const

export const PARTNA_SOURCES = [
  {
    label: 'Partna: Vad kostar det att få fler uppdrag?',
    href: 'https://partna.se/fragor-och-svar/vad-kostar-det-att-fa-fler-it-uppdrag-i-partna',
  },
  {
    label: 'Partna Standard – 10 uppdrag för 1 950 kr/mån',
    href: 'https://partna.se/standard-prisplan',
  },
  {
    label: 'Partna: Få offerter från upp till 6 byråer',
    href: 'https://partna.se/skapa-uppdrag?byra=apputveckling',
  },
] as const

export const PARTNA_FAQS = [
  {
    q: 'Vad kostar Partna för en byrå 2026?',
    a: 'Enligt Partnas publika information kostar Pay as you go normalt 490 kr per uppdragsförfrågan. Standard kostar 1 950 kr per månad och inkluderar 10 förfrågningar. Partna beskriver även en Basic-plan på 1 495 kr per månad med 5 nycklar.',
  },
  {
    q: 'Tar Partna en avgift när byrån vinner uppdraget?',
    a: 'Ja. Partna anger i sin publika prisinformation att en vinnande leverantör debiteras en slagavgift på 7 procent av offertens värde exklusive moms.',
  },
  {
    q: 'Hur många offerter kan en beställare få via Partna?',
    a: 'Partna anger upp till sex offerter per uppdrag. På Updro är antalet begränsat till högst tre byråer per uppdrag.',
  },
  {
    q: 'Är Updro billigare än Partna?',
    a: 'På Updros Pay per lead-plan kostar ett valt lead 119 kr. Den faktiska kostnaden per vunnen kund beror alltid på leadkvalitet och konvertering, men Updro tar inte ut någon procentuell slagavgift på projektvärdet i sin publicerade prismodell.',
  },
  {
    q: 'Kan en byrå använda Updro och Partna samtidigt?',
    a: 'Ja. Det är ofta klokt att testa kanaler parallellt och jämföra kostnad per relevant dialog, möte och vunnen affär i stället för att bara jämföra styckepriset för ett lead.',
  },
] as const

export const estimatePartnaPaygWinnerCost = (projectValue: number) =>
  PARTNA_FACTS.payAsYouGo + projectValue * PARTNA_FACTS.successFeeRate
