export interface ArticlePage {
  slug: string
  metaTitle: string
  metaDesc: string
  h1: string
  category: string
  publishedDate: string
  intro: string
  sections: { heading: string; content: string }[]
  faq: { q: string; a: string }[]
  relatedLinks: { label: string; href: string }[]
}

export const ARTICLES: ArticlePage[] = [
  {
    slug: 'vad-kostar-en-hemsida-2026',
    metaTitle: 'Vad kostar en hemsida 2026? Komplett prisguide | Updro',
    metaDesc: 'Vad kostar det att bygga en hemsida 2026? Prisguide med aktuella priser, tips och jämförelser. Se vad du kan förvänta dig.',
    h1: 'Vad kostar en hemsida 2026? Komplett prisguide',
    category: 'Webbutveckling',
    publishedDate: '2026-01-15',
    intro: 'En av de vanligaste frågorna vi får är "Vad kostar det att bygga en hemsida?". Svaret beror på vad du behöver, men i den här guiden ger vi dig en komplett prisöversikt för 2026 baserad på faktiska offerter vi sett via Updro.',
    sections: [
      { heading: 'Prisöversikt 2026', content: 'Baserat på tusentals offerter via Updro kan vi presentera aktuella marknadspriser:\n\n| Typ av hemsida | Prisintervall 2026 |\n|---|---|\n| Enkel landningssida | 5 000 – 15 000 kr |\n| Företagshemsida (5–10 sidor) | 15 000 – 50 000 kr |\n| Hemsida med CMS (WordPress) | 20 000 – 80 000 kr |\n| E-handelsplattform | 30 000 – 200 000 kr |\n| Avancerad webbapplikation | 80 000 – 500 000+ kr |\n| Redesign | 10 000 – 80 000 kr |\n\nDessa priser inkluderar design, utveckling och grundläggande SEO-setup.' },
      { heading: 'Faktorer som påverkar priset', content: '**Design** – Unik design kostar 15 000–30 000 kr extra jämfört med mallbaserad.\n\n**Funktionalitet** – Varje extra funktion (bokningssystem, betalning, login) ökar priset.\n\n**CMS-val** – WordPress är billigast, Webflow i mellansegmentet, custom-byggt dyrt.\n\n**Antal sidor** – Fler sidor = mer arbete.\n\n**Integrationer** – CRM, betallösningar, ERP-kopplingar.\n\n**Innehåll** – Professionell copywriting kostar 500–2 000 kr per sida.\n\n**Byråns storlek** – Freelancers tar 500–1 000 kr/h, stora byråer 1 200–2 000 kr/h.' },
      { heading: 'Löpande kostnader', content: '- **Hosting**: 200–2 000 kr/månad\n- **Domän**: 100–200 kr/år\n- **SSL-certifikat**: Gratis (Let\'s Encrypt) – 2 000 kr/år\n- **Underhåll**: 500–3 000 kr/månad\n- **Content updates**: 1 000–5 000 kr/månad\n\nRäkna med 1 000–5 000 kr/månad i löpande kostnader.' },
      { heading: 'Så sparar du pengar', content: '1. **Jämför offerter** – Använd Updro för att jämföra minst 3 offerter\n2. **Börja med MVP** – Bygg grunderna först, utöka sedan\n3. **Förbered innehåll** – Ha texter och bilder klara innan projektet startar\n4. **Var tydlig** – En bra kravspecifikation minskar missförstånd\n5. **Överväg templates** – En bra mall kan spara 50% av designkostnaden' },
    ],
    faq: [
      { q: 'Kan jag bygga en hemsida gratis?', a: 'Ja, med verktyg som WordPress.com eller Wix kan du skapa en enkel sida gratis, men den ser ofta oprofessionell ut och saknar viktiga funktioner.' },
      { q: 'Är det värt att betala för en dyr hemsida?', a: 'En professionell hemsida som konverterar besökare till kunder betalar sig ofta inom månader. En billig sajt som inte konverterar är dyrare i längden.' },
      { q: 'Hur ofta bör jag uppgradera min hemsida?', a: 'En fullständig redesign vart 3–5 år, med löpande förbättringar och content-uppdateringar däremellan.' },
    ],
    relatedLinks: [
      { label: 'Webbutveckling', href: '/webbutveckling' },
      { label: 'Webbutveckling pris', href: '/webbutveckling/pris' },
      { label: 'Bästa webbyrån', href: '/basta-webbyran' },
    ]
  },
  {
    slug: 'hur-valjer-man-webbyra',
    metaTitle: 'Hur väljer man webbyrå? 10 tips | Updro',
    metaDesc: 'Guide för att välja rätt webbyrå. 10 tips som hjälper dig hitta den perfekta byrån för ditt projekt.',
    h1: 'Hur väljer man webbyrå? 10 tips för rätt val',
    category: 'Webbutveckling',
    publishedDate: '2026-02-01',
    intro: 'Att välja webbyrå är ett av de viktigaste besluten för ditt företags digitala satsning. Med hundratals byråer att välja bland kan det kännas överväldigande. Här är 10 beprövade tips.',
    sections: [
      { heading: '1. Definiera dina behov', content: 'Innan du kontaktar byråer bör du ha klart för dig:\n- Vad är syftet med hemsidan?\n- Vilka funktioner behöver du?\n- Vem är din målgrupp?\n- Vilken budget har du?\n- När behöver du vara klar?' },
      { heading: '2. Jämför minst 3 offerter', content: 'Kontakta aldrig bara en byrå. Via Updro kan du kostnadsfritt jämföra offerter från kvalitetssäkrade byråer och hitta rätt pris för ditt projekt.' },
      { heading: '3–10. Ytterligare tips', content: '3. **Granska portfolion** – Matchar deras stil din vision?\n4. **Kontrollera referenser** – Ring befintliga kunder\n5. **Diskutera process** – Hur jobbar de? Agilt? Vattenfall?\n6. **Fråga om teknik** – Vilken stack rekommenderar de?\n7. **Förstå prissättningen** – Fast pris eller löpande?\n8. **Kolla avtalet** – Vem äger koden? Support?\n9. **Testa kemin** – Ni ska jobba tätt tillsammans\n10. **Tänk långsiktigt** – Kan byrån växa med er?' },
    ],
    faq: [
      { q: 'Ska jag välja en stor eller liten byrå?', a: 'Liten byrå ger personligare service och ofta lägre priser. Stor byrå ger bredare kompetens och resurser. Välj baserat på projektets storlek.' },
    ],
    relatedLinks: [
      { label: 'Bästa webbyrån', href: '/basta-webbyran' },
      { label: 'Webbutveckling pris', href: '/webbutveckling/pris' },
    ]
  },
  {
    slug: 'seo-guide-foretag',
    metaTitle: 'SEO guide för företag 2026 – Komplett guide | Updro',
    metaDesc: 'Komplett SEO-guide för företag. Lär dig sökmotoroptimering steg för steg med konkreta tips och strategier.',
    h1: 'SEO guide för företag 2026 – Komplett guide',
    category: 'SEO',
    publishedDate: '2026-01-20',
    intro: 'Sökmotoroptimering (SEO) är den mest kostnadseffektiva kanalen för att driva relevant trafik. Den här guiden ger dig allt du behöver veta för att komma igång med SEO för ditt företag.',
    sections: [
      { heading: 'Grunderna i SEO', content: 'SEO handlar om att optimera din webbplats för att ranka högre i Googles organiska sökresultat. De tre pelarna är:\n\n- **Teknisk SEO** – Sajthastighet, mobilanpassning, crawlbarhet\n- **On-page SEO** – Sökordsoptimering, meta-taggar, innehåll\n- **Off-page SEO** – Länkbyggande och digitalt PR' },
      { heading: 'Steg-för-steg', content: '1. Gör en SEO-audit av din nuvarande sajt\n2. Analysera dina sökord och konkurrenter\n3. Åtgärda tekniska problem\n4. Optimera befintligt innehåll\n5. Skapa nytt, sökoptimerat innehåll\n6. Bygg kvalitetslänkar\n7. Mät och optimera löpande' },
    ],
    faq: [
      { q: 'Hur lång tid tar SEO?', a: '3–6 månader för märkbara resultat, 6–12 månader för signifikant trafik.' },
      { q: 'Kan jag göra SEO själv?', a: 'Grunderna ja, men för konkurrenskraftiga sökord behövs experthjälp.' },
    ],
    relatedLinks: [
      { label: 'SEO', href: '/seo' },
      { label: 'SEO pris', href: '/seo/pris' },
      { label: 'Bästa SEO-byrån', href: '/basta-seo-byran' },
    ]
  },
  {
    slug: 'shopify-vs-woocommerce',
    metaTitle: 'Shopify vs WooCommerce 2026 – Vilken ska du välja? | Updro',
    metaDesc: 'Jämförelse mellan Shopify och WooCommerce 2026. Priser, funktioner, fördelar och nackdelar.',
    h1: 'Shopify vs WooCommerce 2026 – Komplett jämförelse',
    category: 'E-handel',
    publishedDate: '2026-02-15',
    intro: 'Shopify och WooCommerce är de två mest populära e-handelsplattformarna. Men vilken passar ditt företag bäst? Vi jämför allt – pris, funktioner, skalbarhet och användarvänlighet.',
    sections: [
      { heading: 'Snabb jämförelse', content: '| | Shopify | WooCommerce |\n|---|---|---|\n| Pris | Från $39/mån | Gratis (hosting separat) |\n| Enkelhet | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |\n| Flexibilitet | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n| SEO | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |\n| Skalbarhet | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |\n| Appar/plugins | 8 000+ | 50 000+ |' },
      { heading: 'När välja Shopify?', content: 'Shopify passar om du:\n- Vill komma igång snabbt\n- Inte har teknisk kunskap\n- Vill ha allt-i-ett-lösning\n- Prioriterar enkelhet' },
      { heading: 'När välja WooCommerce?', content: 'WooCommerce passar om du:\n- Vill ha full kontroll\n- Redan använder WordPress\n- Vill undvika transaktionsavgifter\n- Behöver maximal flexibilitet' },
    ],
    faq: [
      { q: 'Vilken är billigast?', a: 'WooCommerce är gratis som plugin men kräver hosting (100–500 kr/mån). Shopify börjar på $39/mån men inkluderar hosting.' },
    ],
    relatedLinks: [
      { label: 'E-handel Shopify', href: '/ehandel/shopify' },
      { label: 'E-handel WooCommerce', href: '/ehandel/woocommerce' },
      { label: 'E-handel pris', href: '/ehandel/pris' },
    ]
  },
  {
    slug: 'hur-lang-tid-tar-apputveckling',
    metaTitle: 'Hur lång tid tar apputveckling? Guide 2026 | Updro',
    metaDesc: 'Hur lång tid tar det att utveckla en app? Komplett guide med tidslinjer för iOS, Android och cross-platform.',
    h1: 'Hur lång tid tar apputveckling? Komplett guide',
    category: 'App-utveckling',
    publishedDate: '2026-03-01',
    intro: 'Tidslinjen för apputveckling beror på appens komplexitet, plattform och utvecklingsmetod. Här ger vi realistiska tidsestimat baserat på verkliga projekt.',
    sections: [
      { heading: 'Tidsöversikt', content: '| Typ av app | Tidslinje |\n|---|---|\n| Enkel app (MVP) | 2–3 månader |\n| Medelstor app | 3–6 månader |\n| Komplex app | 6–12 månader |\n| Enterprise-app | 9–18 månader |' },
      { heading: 'Faser i apputveckling', content: '1. **Kravspecifikation** (1–2 veckor)\n2. **UX/UI-design** (2–4 veckor)\n3. **Utveckling** (4–24 veckor)\n4. **Testning** (2–4 veckor)\n5. **Lansering** (1–2 veckor)\n6. **Iteration** (löpande)' },
    ],
    faq: [
      { q: 'Kan man snabba på processen?', a: 'Ja, genom MVP-approach, cross-platform-ramverk och ett erfaret team. Men underskatta inte tiden för testning.' },
    ],
    relatedLinks: [
      { label: 'App-utveckling', href: '/app-utveckling' },
      { label: 'App-utveckling pris', href: '/app-utveckling/pris' },
      { label: 'Bästa apputvecklare', href: '/basta-apputvecklare' },
    ]
  },
  {
    slug: 'seo-pris-guide',
    metaTitle: 'SEO pris 2026 – Vad kostar sökmotoroptimering? | Updro',
    metaDesc: 'Komplett prisguide för SEO 2026. Se vad sökmotoroptimering kostar och jämför SEO-paket.',
    h1: 'SEO pris 2026 – Vad kostar sökmotoroptimering?',
    category: 'SEO',
    publishedDate: '2026-01-25',
    intro: 'SEO-priser varierar enormt – från 3 000 kr till 100 000 kr per månad. Men vad får du faktiskt för pengarna? Här ger vi en ärlig prisguide baserad på marknadsdata.',
    sections: [
      { heading: 'Marknadspriser 2026', content: '| Nivå | Pris/mån | Vad ingår |\n|---|---|---|\n| Basic | 3 000 – 8 000 kr | Grundläggande on-page, rapportering |\n| Standard | 8 000 – 20 000 kr | On-page + off-page, content, teknisk SEO |\n| Premium | 20 000 – 50 000 kr | Allt ovan + dedikerat team, content-produktion |\n| Enterprise | 50 000+ kr | Skräddarsytt, internationell SEO |' },
    ],
    faq: [
      { q: 'Är billig SEO värt det?', a: 'Sällan. SEO under 5 000 kr/mån kan göra mer skada än nytta med black-hat-metoder.' },
    ],
    relatedLinks: [
      { label: 'SEO', href: '/seo' },
      { label: 'Bästa SEO-byrån', href: '/basta-seo-byran' },
    ]
  },
  {
    slug: 'digital-marknadsforing-for-foretag',
    metaTitle: 'Digital marknadsföring för företag – Guide 2026 | Updro',
    metaDesc: 'Komplett guide till digital marknadsföring för företag. Strategier, kanaler och budget – allt du behöver veta.',
    h1: 'Digital marknadsföring för företag – Guide 2026',
    category: 'Marknadsföring',
    publishedDate: '2026-02-10',
    intro: 'Digital marknadsföring är inte längre valfritt – det är nödvändigt. Den här guiden ger dig en komplett översikt över kanaler, strategier och budgetering.',
    sections: [
      { heading: 'De viktigaste kanalerna', content: '1. **SEO** – Organisk synlighet, långsiktig ROI\n2. **Google Ads** – Omedelbar synlighet, betalda klick\n3. **Sociala medier** – Varumärkesbyggande, engagemang\n4. **Content marketing** – Bloggar, guider, video\n5. **E-postmarknadsföring** – Direkt kommunikation\n6. **Retargeting** – Nå tillbaka besökare som inte konverterade' },
    ],
    faq: [
      { q: 'Hur mycket ska jag lägga på marknadsföring?', a: 'Tumregel: 5–15% av omsättningen. Digitalt bör vara minst 50% av total marknadsföringsbudget.' },
    ],
    relatedLinks: [
      { label: 'Digital marknadsföring', href: '/digital-marknadsforing' },
      { label: 'SEO', href: '/seo' },
      { label: 'Sociala medier', href: '/sociala-medier' },
    ]
  },
  {
    slug: 'webbdesign-trender-2026',
    metaTitle: 'Webbdesign-trender 2026 – Årets 10 hetaste trender | Updro',
    metaDesc: 'Upptäck de hetaste webbdesign-trenderna 2026. AI-driven design, 3D, mikrointeraktioner och mer.',
    h1: 'Webbdesign-trender 2026 – Årets 10 hetaste',
    category: 'Webbdesign',
    publishedDate: '2026-01-10',
    intro: 'Webbdesign utvecklas snabbt. Här är de trender som definierar 2026 och som du bör ha koll på för att hålla din webbplats relevant.',
    sections: [
      { heading: 'De 10 hetaste trenderna', content: '1. **AI-genererade layouts** – Personaliserade upplevelser\n2. **Immersive 3D** – Interaktiva 3D-element\n3. **Dark mode som standard** – Mörka teman\n4. **Mikrointeraktioner** – Subtila animationer\n5. **Brutalism 2.0** – Medvetet rå estetik\n6. **Variable fonts** – Dynamisk typografi\n7. **Glassmorphism** – Frostat glas-effekter\n8. **Sustainability design** – Klimatmedveten design\n9. **Voice UI** – Röstnavigering\n10. **Scroll-triggered animations** – Animationer vid scroll' },
    ],
    faq: [
      { q: 'Behöver jag följa alla trender?', a: 'Nej, välj de som passar ditt varumärke och målgrupp. Trender ska komplettera, inte överskugga, funktionalitet.' },
    ],
    relatedLinks: [
      { label: 'Webbdesign', href: '/webbdesign' },
      { label: 'Grafisk design', href: '/grafisk-design' },
    ]
  },
  {
    slug: 'ehandel-statistik-sverige',
    metaTitle: 'E-handel statistik Sverige 2026 – Siffror och trender | Updro',
    metaDesc: 'Aktuell e-handelsstatistik för Sverige 2026. Omsättning, trender, beteenden och prognoser.',
    h1: 'E-handel statistik Sverige 2026',
    category: 'E-handel',
    publishedDate: '2026-02-20',
    intro: 'Den svenska e-handelsmarknaden fortsätter att växa. Här samlar vi den senaste statistiken och trenderna du behöver känna till.',
    sections: [
      { heading: 'Nyckeltal 2026', content: '- **Total omsättning**: ~175 miljarder kr\n- **Tillväxt**: +8% jämfört med 2025\n- **Andel av detaljhandeln**: ~18%\n- **Mobilhandel**: 65% av alla köp\n- **Vanligaste betalsättet**: Klarna (35%), Kort (30%), Swish (20%)\n- **Genomsnittligt ordervärde**: 850 kr' },
      { heading: 'Trender 2026', content: '- Social commerce växer 40% YoY\n- Hållbar e-handel blir standard\n- AI-personalisering ökar konvertering 15–30%\n- Same-day delivery expanderar utanför storstäder\n- Subscription-modeller fortsätter växa' },
    ],
    faq: [
      { q: 'Hur stor är e-handeln i Sverige?', a: 'E-handeln i Sverige omsätter cirka 175 miljarder kr 2026 och växer med 8% årligen.' },
    ],
    relatedLinks: [
      { label: 'E-handel', href: '/ehandel' },
      { label: 'Digital marknadsföring', href: '/digital-marknadsforing' },
    ]
  },
  {
    slug: 'seo-statistik-sverige',
    metaTitle: 'SEO statistik Sverige 2026 – Fakta och siffror | Updro',
    metaDesc: 'Aktuell SEO-statistik för Sverige 2026. Sökbeteenden, marknadsdata och trender.',
    h1: 'SEO statistik Sverige 2026',
    category: 'SEO',
    publishedDate: '2026-03-05',
    intro: 'Sökmotoroptimering fortsätter vara den viktigaste digitala kanalen. Här samlar vi den senaste SEO-statistiken för den svenska marknaden.',
    sections: [
      { heading: 'Nyckeltal', content: '- **Google marknadsandel i Sverige**: 95%\n- **Andel som klickar på organiskt**: 45–55%\n- **Genomsnittlig SEO-budget**: 12 000 kr/mån\n- **ROI för SEO**: 5–10x inom 12 månader\n- **Antal sökningar i Sverige/dag**: ~15 miljoner\n- **Andel mobila sökningar**: 68%' },
    ],
    faq: [
      { q: 'Är SEO fortfarande relevant 2026?', a: 'Absolut. Med AI-genererade svar ändras formatet, men organisk synlighet är fortfarande den mest kostnadseffektiva kanalen.' },
    ],
    relatedLinks: [
      { label: 'SEO', href: '/seo' },
      { label: 'SEO pris', href: '/seo/pris' },
    ]
  },
]

export const findArticle = (slug: string) => ARTICLES.find(a => a.slug === slug)

export const getArticlesByCategory = (category: string) => ARTICLES.filter(a => a.category === category)
