// lib/strings.ts — Lithuanian UI string constants
// All visible UI strings are defined here to ensure consistency and avoid scattered literals.
// SHLL-04: Lithuanian labels throughout all UI elements

export const ADMIN_NAV_ITEMS = [
  { label: 'Pagrindinis', href: '/admin', icon: 'Home' },
  { label: 'Nuomininkai', href: '/admin/tenants', icon: 'Building2' },
  { label: 'Analitika', href: '/admin/analytics', icon: 'BarChart2' },
  { label: 'DUK', href: '/admin/faq', icon: 'HelpCircle' },
  { label: 'Puslapiai', href: '/admin/pages', icon: 'FileText' },
  { label: 'Integracijos', href: '/admin/integrations', icon: 'Plug' },
] as const

export const SELLER_NAV_ITEMS = [
  { label: 'Apyvarta', href: '/seller/revenue', icon: 'TrendingUp' },
  { label: 'Analitika', href: '/seller/analytics', icon: 'BarChart2' },
  { label: 'DUK', href: '/seller/faq', icon: 'HelpCircle' },
] as const

export const AUTH_STRINGS = {
  loginTitle: 'Prisijungti',
  usernameLabel: 'Vartotojo vardas',
  passwordLabel: 'Slaptažodis',
  loginButton: 'Prisijungti',
  loginError: 'Neteisingas vartotojo vardas arba slaptažodis',
  logoutLabel: 'Atsijungti',
} as const

// Domain suffix appended to seller username to construct a Supabase auth email.
// Admin creates seller accounts with email: {username}@pceuropa.lt
// Login form appends this when the entered identifier contains no '@'.
export const SELLER_USERNAME_DOMAIN = '@pceuropa.lt'

export type NavItem = {
  label: string
  href: string
  icon: string
}

export const REVENUE_REMINDER_TITLE = 'Artėja mėnesio pabaiga'

export const AKCIJOS_STRINGS = {
  pageTitle: 'Akcijos / Naujienos',
  pageDescription:
    'Svarbiausios naujienos, nauji atidarymai, sezoniniai pasiūlymai ir aktualios akcijos – viskas vienoje vietoje, kad nepraleistumėte to, kas vyksta PC EUROPA.',
  filterAll: 'Visi pasiūlymai',
  filterStores: 'Parduotuvės',
  filterServices: 'Paslaugos',
  filterFood: 'Restoranai / Kavinės / Dialogai',
  searchPlaceholder: 'Paieška',
  loadMore: 'Rodyti daugiau',
  breadcrumbHome: 'Pagrindinis',
  breadcrumbCurrent: 'Akcijos / Naujienos',
} as const

export function revenueReminderBody(daysRemaining: number): string {
  const unit =
    daysRemaining === 1
      ? 'diena'
      : daysRemaining > 1 && daysRemaining < 10
      ? 'dienos'
      : 'dienų'
  return `Liko tik ${daysRemaining} ${unit} iki mėnesio pabaigos. Prašome įsitikinti, kad pateikėte visą reikiamą apyvartos informaciją.`
}

// Darbo laikas page strings
export const DARBO_LAIKAS_STRINGS = {
  pageTitle: 'Darbo laikas — PC Europa',
  pageDescription: 'PC Europa prekybos centro darbo laikas ir parduotuvių tvarkaraščiai.',
  breadcrumbHome: 'Pagrindinis',
  breadcrumbCurrent: 'Darbo laikas',
  heroHeading: 'Darbo laikas',
  heroSubtext1: 'Prekybos centras: I–VI 10:00–21:00, VII 10:00–20:00',
  heroSubtext2: 'Mados ir aksesuarų parduotuvės: I–VI 10:00–20:00, VII 10:00–19:00',
  heroSubtext3: 'Sporto klubai: I–VII 24/7',
  searchPlaceholder: 'Paieška',
  loadMoreButton: 'Rodyti daugiau',
  openStatus: 'Atidaryta',
  closedStatus: 'Uždaryta',
  howToGetHereHeading: 'Kaip atvykti?',
  howToGetHereSubtext: 'Raskite patogiausią būdą pasiekti PC Europą.',
  viewRouteButton: 'Žiūrėti maršrutą',
  contactAdminLabel: 'PC Europa administracija',
  contactAdminPhone: '+370 644 05764',
  contactAdminEmail: 'europa@baltichorizon.com',
  contactMarketingLabel: 'Marketingo skyrius',
  contactMarketingEmail: 'reklama@baltichorizon.com',
  bannerHeading: 'Mes pasiruošę jums padėti!',
} as const

export const LAISVALAIKIS_STRINGS = {
  pageTitle: 'Laisvalaikis ir Pramogos — PC Europa',
  pageDescription: 'Kino teatras, žaidimai, pramogos vaikams ir suaugusiems — visi laisvalaikio centrai PC Europa.',
  heroHeading: 'Laisvalaikis / Pramogos',
  heroDescription:
    'Kino teatras, žaidimų zonos, pramogos vaikams ir suaugusiems — visa tai PC Europa po vienu stogu.',
  filterAll: 'Visi',
  searchPlaceholder: 'Paieška',
  loadMore: 'Rodyti daugiau',
} as const

export const SPORTAS_STRINGS = {
  pageTitle: 'Sportas ir sveikata — PC Europa',
  pageDescription: 'PC Europa sporto klubai ir sveikatos paslaugos — rask tinkamiausią vietą aktyviam gyvenimui.',
  heroHeading: 'Sportas / Sveikata',
  heroDescription:
    'Sporto klubai, pilates studijos ir sveikatos paslaugos — viskas vienoje vietoje, kad gyventum aktyviau.',
  filterAll: 'Visi',
  searchPlaceholder: 'Paieška',
  loadMore: 'Rodyti daugiau',
} as const

export const CHAT_WIDGET_STRINGS = {
  triggerLabel: 'Atidaryti pokalbį',
  closeLabel: 'Uždaryti pokalbį',
  minimizeLabel: 'Sumažinti',
  expandLabel: 'Išskleisti',
  sendLabel: 'Siųsti žinutę',
  assistantName: 'PCEuropa Asistentė',
  assistantStatus: 'Dabar prisijungusi',
  inputPlaceholder: 'Rašykite žinutę...',
  inputHint: 'Enter — siųsti · Shift+Enter — nauja eilutė',
  greeting: 'Sveiki! Aš esu PCEuropa administracijos asistentė. Kuo galiu padėti?',
  replies: [
    'Puiku! Aš perduosiu šią informaciją komandai.',
    'Supratau. Ar galite pateikti daugiau detalių?',
    'Tai bus išspręsta per 24 valandas.',
    'Ačiū už pranešimą. Mūsų komanda jau informuota.',
  ],
} as const

export const NUOMA_REKLAMA_STRINGS = {
  pageTitle: 'Patalpų nuoma ir reklama — PC Europa',
  pageDescription: 'Norite įkurti verslą PC Europa ar reklamuotis mūsų erdvėse? Susisiekite su mumis ir aptarsime geriausias galimybes.',
  heroHeading: 'Patalpų nuoma ir reklama',
  contactCardLabel: 'Susiekite',
  contactPhone: '+370 644 05764',
  contactEmail: 'reklama@baltichorizon.com',
  formHeading: 'Susiekite',
  formBody: 'Pateikite trumpą informaciją apie Jūsų įmonę ir mūsų nuomos projektų vadovė susieks su Jumis artimiausiu metu.',
  labelName: 'Jūsų vardas',
  placeholderName: 'Vardas Pavardė',
  labelEmail: 'El pašto adresas',
  placeholderEmail: 'vardas@elpastas.lt',
  labelMessage: 'Jūsų žinutė',
  placeholderMessage: 'Jūsų tekstas, spauskite čia.',
  submitButton: 'Siųsti',
  successMessage: 'Ačiū! Jūsų žinutė išsiųsta. Susisieksime artimiausiu metu.',
} as const

export const MODERAN_SYNC_STRINGS = {
  pageTitle: 'Integracijos',
  pageDescription: 'Išorinių sistemų sinchronizavimas',
  sectionTitle: 'Moderan – apyvartos sinchronizavimas',
  sectionDescription: 'Siųsti mėnesio apyvartos duomenis į Moderan nuomos valdymo sistemą.',
  monthLabel: 'Mėnuo',
  syncButton: 'Testuoti (dry run)',
  syncButtonLoading: 'Tikrinama...',
  colStore: 'Parduotuvė',
  colAmount: 'Apyvarta (€)',
  colMonth: 'Mėn. data',
  colStatus: 'Būsena',
  statusReady: 'Paruošta',
  noData: 'Šiam mėnesiui apyvartos duomenų nėra.',
  envMissing: 'Trūksta konfigūracijos: MODERAN_API_TOKEN, MODERAN_DOMAIN_ID arba MODERAN_PROPERTYSET_ID.',
  errorGeneric: 'Klaida tikrinant duomenis. Bandykite dar kartą.',
} as const

export const LANKYTOJAMS_STRINGS = {
  pageTitle: 'Informacija lankytojams — PC Europa',
  pageDescription: 'Visa svarbi informacija PC Europa prekybos centro lankytojams: parkavimas, pasiekiamumas, patogumų sąrašas ir dažniausiai užduodami klausimai.',
  heading: 'Informacija lankytojams',
  parkingTitle: 'Parkavimas',
  parkingBody: 'PC Europa turi nemokamą automobilių stovėjimo aikštelę su daugiau nei 500 vietų. Aikštelė veikia visą parą. Taip pat yra specialiai pažymėtos vietos neįgaliesiems.',
  accessTitle: 'Kaip mus pasiekti',
  accessPublicTransport: 'Viešuoju transportu: autobusai Nr. 1, 5, 14 sustoja tiesiogiai prie centro. Artimiausios stotelės — „PC Europa".',
  accessByCar: 'Automobiliu: centras pasiekiamas iš pagrindinių miesto gatvių. Navigacijos adresas: PC Europa, Vilnius.',
  amenitiesTitle: 'Patogumai',
  amenities: [
    'Vaikų žaidimų kambarys',
    'Neįgaliųjų prieiga ir liftas',
    'Pakrovimo stotelės elektromobiliams',
    'Bankomatas',
    'Informacijos langelis',
    'Nemokamas Wi-Fi',
  ],
  faqTitle: 'D.U.K.',
  faqItems: [
    {
      question: 'Ar galima atsivesti gyvūną?',
      answer: 'Nedideli augintiniai gali lankytis su savininkais, tačiau prašome nešti juos ant rankų arba laikyti prisirišusius.',
    },
    {
      question: 'Ar yra mama-baby kambarys?',
      answer: 'Taip, antrame aukšte yra įrengtas mama-baby kambarys su persirengimo lentele ir maitinimo zona.',
    },
    {
      question: 'Kur kreiptis radus pamestą daiktą?',
      answer: 'Rastus daiktus prašome pristatyti į informacijos langelį prie centrinio įėjimo.',
    },
  ],
} as const
