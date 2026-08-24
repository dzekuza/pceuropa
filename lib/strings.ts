// lib/strings.ts — Lithuanian UI string constants
// All visible UI strings are defined here to ensure consistency and avoid scattered literals.
// SHLL-04: Lithuanian labels throughout all UI elements

export const ADMIN_NAV_ITEMS = [
  { label: 'Pagrindinis', href: '/admin', icon: 'Home' },
  { label: 'Nuomininkai', href: '/admin/tenants', icon: 'Building2' },
  { label: 'Metų apžvalga', href: '/admin/overview', icon: 'LayoutGrid' },
  { label: 'Analitika', href: '/admin/analytics', icon: 'BarChart2' },
  { label: 'Straipsniai', href: '/admin/articles', icon: 'Newspaper' },
  { label: 'DUK', href: '/admin/faq', icon: 'HelpCircle' },
  { label: 'Puslapiai', href: '/admin/pages', icon: 'FileText' },
  { label: 'Integracijos', href: '/admin/integrations', icon: 'Plug' },
  { label: 'Vertimai', href: '/admin/translations', icon: 'Languages' },
  { label: 'Nustatymai', href: '/admin/settings', icon: 'Settings' },
] as const

export const SELLER_NAV_ITEMS = [
  { label: 'Pagrindinis', href: '/seller', icon: 'Home' },
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

// Floating admin dashboard chat widget (app/(dashboard)/layout.tsx) — internal
// tooling, not storefront-facing, so it stays LT-only like the rest of the dashboard.
export const CHAT_WIDGET_STRINGS = {
  triggerLabel: 'Atidaryti pokalbį',
  closeLabel: 'Uždaryti pokalbį',
  minimizeLabel: 'Sumažinti',
  expandLabel: 'Išskleisti',
  dragHandleLabel: 'Vilkite, kad perkeltumėte pokalbio langą',
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

export function revenueReminderBody(daysRemaining: number): string {
  const unit =
    daysRemaining === 1
      ? 'diena'
      : daysRemaining > 1 && daysRemaining < 10
      ? 'dienos'
      : 'dienų'
  return `Liko tik ${daysRemaining} ${unit} iki mėnesio pabaigos. Prašome įsitikinti, kad pateikėte visą reikiamą apyvartos informaciją.`
}

export const ARTICLES_STRINGS = {
  pageTitle: 'Straipsniai',
  pageDescription: 'Kurkite ir valdykite naujienų straipsnius',
  newButton: 'Naujas straipsnis',
  editTitle: 'Redaguoti straipsnį',
  newTitle: 'Naujas straipsnis',
  saveDraft: 'Išsaugoti juodraštį',
  publish: 'Publikuoti',
  titlePlaceholder: 'Straipsnio pavadinimas',
  slugLabel: 'Nuoroda (URL)',
  categoryLabel: 'Kategorija',
  featuredLabel: 'Rekomenduojamas',
  coverLabel: 'Viršelio nuotrauka',
  deleteConfirmTitle: 'Ištrinti straipsnį?',
  deleteConfirmDesc: 'Šis veiksmas negrįžtamas. Straipsnis bus ištrintas visam laikui.',
  deleteConfirm: 'Ištrinti',
  deleteCancel: 'Atšaukti',
  colTitle: 'Pavadinimas',
  colCategory: 'Kategorija',
  colFeatured: 'Rekomenduojamas',
  colPublished: 'Publikuotas',
  colDate: 'Data',
  colActions: 'Veiksmai',
  errorSave: 'Nepavyko išsaugoti straipsnio',
  errorDelete: 'Nepavyko ištrinti straipsnio',
  emptyState: 'Straipsnių kol kas nėra.',
  uploadCover: 'Įkelti nuotrauką',
  removeCover: 'Pašalinti',
  editorPlaceholder: 'Pradėkite rašyti straipsnį...',
  statusPublished: 'Publikuotas',
  statusDraft: 'Juodraštis',
  tabLt: 'LT',
  tabEn: 'EN',
  titleEnLabel: 'Pavadinimas (EN)',
  titleEnPlaceholder: 'Article title',
  contentEnLabel: 'Turinys (EN)',
  editorPlaceholderEn: 'Start writing the article...',
} as const

export const ADMIN_PROMOS_STRINGS = {
  pageTitle: 'Akcijos',
  pageDescription: 'Kurkite ir valdykite akcijas bei pasiūlymus',
  newButton: 'Nauja akcija',
  editTitle: 'Redaguoti akciją',
  newTitle: 'Nauja akcija',
  saveDraft: 'Išsaugoti juodraštį',
  publish: 'Publikuoti',
  titlePlaceholder: 'Akcijos pavadinimas',
  slugLabel: 'Nuoroda (URL)',
  categoryLabel: 'Kategorija',
  categoryStores: 'Parduotuvės',
  categoryServices: 'Paslaugos',
  categoryFood: 'Restoranai / Kavinės',
  startsAtLabel: 'Pradžios data',
  endsAtLabel: 'Pabaigos data',
  imageLabel: 'Nuotrauka',
  uploadImage: 'Įkelti nuotrauką',
  removeImage: 'Pašalinti',
  editorPlaceholder: 'Pradėkite rašyti akcijos aprašymą...',
  deleteConfirmTitle: 'Ištrinti akciją?',
  deleteConfirmDesc: 'Šis veiksmas negrįžtamas. Akcija bus ištrinta visam laikui.',
  deleteConfirm: 'Ištrinti',
  deleteCancel: 'Atšaukti',
  colImage: '',
  colTitle: 'Pavadinimas',
  colCategory: 'Kategorija',
  colDates: 'Laikotarpis',
  colPublished: 'Publikuota',
  colActions: 'Veiksmai',
  errorSave: 'Nepavyko išsaugoti akcijos',
  errorDelete: 'Nepavyko ištrinti akcijos',
  emptyState: 'Akcijų kol kas nėra.',
  statusPublished: 'Publikuota',
  statusDraft: 'Juodraštis',
  tabArticles: 'Straipsniai',
  tabPromos: 'Akcijos',
  tabLt: 'LT',
  tabEn: 'EN',
  titleEnLabel: 'Pavadinimas (EN)',
  titleEnPlaceholder: 'Promo title',
  contentEnLabel: 'Turinys (EN)',
  editorPlaceholderEn: 'Start writing the promo description...',
} as const

export const MODERAN_SYNC_STRINGS = {
  pageTitle: 'Integracijos',
  pageDescription: 'Išorinių sistemų sinchronizavimas',
  sectionTitle: 'Moderan – apyvartos sinchronizavimas',
  sectionDescription: 'Siųsti mėnesio apyvartos duomenis į Moderan nuomos valdymo sistemą.',
  monthLabel: 'Mėnuo',
  syncButton: 'Peržiūrėti (dry run)',
  syncButtonLoading: 'Tikrinama...',
  sendButton: 'Siųsti į Moderan',
  sendButtonLoading: 'Siunčiama...',
  sendConfirm: 'Ar tikrai norite siųsti apyvartos duomenis į Moderan? Šio veiksmo atšaukti negalima.',
  colStore: 'Parduotuvė',
  colAmount: 'Apyvarta (€)',
  colMonth: 'Mėn. data',
  colStatus: 'Būsena',
  statusReady: 'Paruošta',
  statusSkipped: 'Jau išsiųsta',
  noData: 'Šiam mėnesiui apyvartos duomenų nėra.',
  envMissing: 'Trūksta konfigūracijos: MODERAN_API_TOKEN, MODERAN_DOMAIN_ID arba MODERAN_PROPERTYSET_ID.',
  errorGeneric: 'Klaida tikrinant duomenis. Bandykite dar kartą.',
  lastSentLabel: 'Paskutinį kartą išsiųsta:',
  viewJsonButton: 'Peržiūrėti JSON',
  jsonDialogTitle: 'Siunčiamų duomenų peržiūra',
  jsonDialogDescription: 'Kiekvienai parduotuvei siunčiama atskira POST užklausa su tokiu turiniu (JSON).',
} as const

export const SITE_SETTINGS_STRINGS = {
  pageTitle: 'Nustatymai',
  pageDescription: 'Bendri svetainės nustatymai',
  gateSectionTitle: '„Svetainė ruošiama“ ekranas',
  gateSectionDescription:
    'Kai įjungta, lankytojai mato „Svetainė ruošiama“ ekraną, kol neįveda administratoriaus slaptažodžio. Išjungus, svetainė iškart tampa vieša.',
  gateToggleLabel: 'Rodyti „Svetainė ruošiama“ ekraną',
  gateEnabledStatus: 'Įjungta — svetainė paslėpta nuo lankytojų',
  gateDisabledStatus: 'Išjungta — svetainė vieša',
  errorGeneric: 'Klaida atnaujinant nustatymą. Bandykite dar kartą.',
} as const

export const UNDER_CONSTRUCTION_STRINGS = {
  title: 'Svetainė ruošiama',
  description: 'PC Europa svetainė šiuo metu atnaujinama. Netrukus grįšime su nauju turiniu.',
  adminLoginButton: 'Prisijungti kaip administratorius',
  passwordPlaceholder: 'Slaptažodis',
  submitButton: 'Prisijungti',
  submitLoading: 'Tikrinama...',
  errorRequired: 'Įveskite slaptažodį.',
  errorWrongPassword: 'Neteisingas slaptažodis.',
  dragHint: 'Vilkite, kad pamatytumėte visas parduotuves',
  contactGeneralLabel: 'Bendra informacija',
  contactEmail: 'europa@baltichorizon.com',
  contactPhone: '+370 644 05764',
  contactSecurityLabel: 'Apsauga',
  contactSecurityPhone: '+370 690 69525',
} as const

// Storefront-facing strings (nav labels, pages, chat/cookie widgets) live in
// messages/lt.json + messages/en.json and are consumed via next-intl's
// useTranslations/getTranslations, not this file.
