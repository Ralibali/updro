export const CATEGORIES = [
  'Webbutveckling', 'E-handel', 'Digital marknadsföring',
  'Grafisk design/UX', 'SEO', 'App-utveckling',
  'IT-konsult', 'Sociala medier',
] as const

export const CATEGORY_ICONS: Record<string, string> = {
  'Webbutveckling': '🌐',
  'E-handel': '🛒',
  'Digital marknadsföring': '📈',
  'Grafisk design/UX': '🎨',
  'SEO': '🔍',
  'App-utveckling': '📱',
  'IT-konsult': '💻',
  'Sociala medier': '📣',
}

export const CATEGORY_STYLES: Record<string, string> = {
  'Webbutveckling': 'bg-blue-50 text-blue-700 border border-blue-200',
  'E-handel': 'bg-violet-50 text-violet-700 border border-violet-200',
  'Digital marknadsföring': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Grafisk design/UX': 'bg-pink-50 text-pink-700 border border-pink-200',
  'SEO': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'App-utveckling': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'IT-konsult': 'bg-slate-50 text-slate-700 border border-slate-200',
  'Sociala medier': 'bg-rose-50 text-rose-700 border border-rose-200',
}

export const BUDGET_LABELS: Record<string, string> = {
  under_10k: 'Under 10 000 kr',
  '10k_50k': '10 000 – 50 000 kr',
  '50k_150k': '50 000 – 150 000 kr',
  over_150k: 'Över 150 000 kr',
  unknown: 'Vet ej / Diskuteras',
}

export const START_TIME_LABELS: Record<string, string> = {
  asap: 'Snarast möjligt',
  within_month: 'Inom 1 månad',
  within_3months: 'Inom 3 månader',
  flexible: 'Flexibelt',
}

export const TRIAL_LEADS = 5
export const TRIAL_DAYS = 14

export const PLANS = [
  {
    id: 'payg' as const,
    name: 'Pay as you go',
    price: 299,
    per: 'per lead',
    credits: 1,
    features: [
      'Betala bara för leads du väljer',
      'Fullständig offert-funktion',
      'Inbyggd chatt med beställare',
      'Inga bindningstider',
    ],
    cta: 'Köp leads',
    highlighted: false,
  },
  {
    id: 'standard' as const,
    name: 'Standard',
    price: 699,
    per: '/månad',
    credits: 10,
    features: [
      '10 leads per månad',
      'Profilsida med logotyp & portfolio',
      'Statistik & insikter',
      'Prioriterad support',
    ],
    cta: 'Välj Standard',
    highlighted: true,
    badge: 'Populärast',
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 1490,
    per: '/månad',
    credits: 9999,
    features: [
      'Obegränsat antal leads',
      'Framhävd profil i sökning',
      'Prioriterad matchning till uppdrag',
      'Dedicated support',
    ],
    cta: 'Välj Premium',
    highlighted: false,
  },
]
