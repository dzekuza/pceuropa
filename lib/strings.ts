// lib/strings.ts — Lithuanian UI string constants
// All visible UI strings are defined here to ensure consistency and avoid scattered literals.
// SHLL-04: Lithuanian labels throughout all UI elements

export const ADMIN_NAV_ITEMS = [
  { label: 'Pagrindinis', href: '/admin', icon: 'Home' },
  { label: 'Nuomininkai', href: '/admin/tenants', icon: 'Building2' },
  { label: 'Analitika', href: '/admin/analytics', icon: 'BarChart2' },
  { label: 'Straipsniai', href: '/admin/articles', icon: 'Newspaper' },
  { label: 'DUK', href: '/admin/faq', icon: 'HelpCircle' },
  { label: 'Puslapiai', href: '/admin/pages', icon: 'FileText' },
  { label: 'Integracijos', href: '/admin/integrations', icon: 'Plug' },
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

// Landing page news/promo cards
export const NEWS_SECTION_STRINGS = {
  heading: 'Akcijos ir naujienos',
  ctaLabel: 'Daugiau',
  items: [
    {
      image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-1.jpg',
      title: 'Papildoma nuolaida Rieker!',
      date: 'Nuo 2026.03.25 iki 2026.03.29',
      href: '/akcijos/rieker',
    },
    {
      image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-2.jpg',
      title: 'Kvepia pavasariu',
      date: 'Nuo 2026.03.25 iki 2026.03.29',
      href: '/akcijos/pavasaris',
    },
    {
      image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-3.jpg',
      title: 'Kvepia pavasariu',
      date: 'Nuo 2026.03.25 iki 2026.03.29',
      href: '/akcijos/samsung',
    },
    {
      image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/news-4.jpg',
      title: 'Kvepia pavasariu',
      date: 'Nuo 2026.03.25 iki 2026.03.29',
      href: '/akcijos/vision-express',
    },
  ],
} as const

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
  mapAlt: 'PC Europa žemėlapis',
  transportCards: [
    {
      title: 'Lengvas privažiavimas',
      subtitle: 'iš Konstitucijos pr. ir Ozo g.',
    },
    {
      title: 'Didelis parkingas',
      subtitle: 'pirma valanda — nemokama.',
    },
    {
      title: 'Dviračių stovai',
      subtitle: 'prie pagrindinio įėjimo.',
    },
    {
      title: 'Pritaikyta visiems',
      subtitle: 'lengvas privažiavimas.',
    },
  ],
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

export const NAUJIENOS_STRINGS = {
  pageTitle: 'Naujienos — PC Europa',
  pageDescription:
    'Naujausi PC Europa prekybos centro atidarymai, renginiai ir aktualijos – viskas vienoje vietoje.',
  featuredLabel: 'Rekomenduojama',
  emptyState: 'Kol kas straipsnių nėra. Grįžkite netrukus.',
  readMore: 'Skaityti daugiau',
} as const

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
  noData: 'Šiam mėnesiui apyvartos duomenų nėra.',
  envMissing: 'Trūksta konfigūracijos: MODERAN_API_TOKEN, MODERAN_DOMAIN_ID arba MODERAN_PROPERTYSET_ID.',
  errorGeneric: 'Klaida tikrinant duomenis. Bandykite dar kartą.',
  lastSentLabel: 'Paskutinį kartą išsiųsta:',
  viewJsonButton: 'Peržiūrėti JSON',
  jsonDialogTitle: 'Siunčiamų duomenų peržiūra',
  jsonDialogDescription: 'Kiekvienai parduotuvei siunčiama atskira POST užklausa su tokiu turiniu (JSON).',
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

export const KONTAKTAI_STRINGS = {
  pageTitle: 'Kontaktai — PC Europa',
  pageDescription: 'PC Europa prekybos centro kontaktinė informacija, adresas ir darbo laikas.',
  heading: 'Kontaktai',
  addressTitle: 'Adresas',
  address: 'Konstitucijos pr. 7A, Vilnius, 09308 Vilniaus m. sav.',
  phoneTitle: 'Telefonas',
  phone: '+370 644 05764',
  phoneHref: 'tel:+37064405764',
  emailTitle: 'El. paštas',
  email: 'reklama@baltichorizon.com',
  emailHref: 'mailto:reklama@baltichorizon.com',
  hoursTitle: 'Darbo laikas',
  hoursWeekdays: 'I–V: 10:00–21:00',
  hoursSaturday: 'VI: 10:00–20:00',
  hoursSunday: 'VII: 10:00–20:00',
} as const

export const KAIP_ATVYKTI_STRINGS = {
  pageTitle: 'Kaip atvykti — PC Europa',
  pageDescription: 'Kaip pasiekti PC Europa prekybos centrą viešuoju transportu ar automobiliu.',
  heading: 'Kaip mus pasiekti',
  publicTransportTitle: 'Viešasis transportas',
  publicTransport: 'Viešuoju transportu: autobusai Nr. 1, 5, 14 sustoja tiesiogiai prie centro. Artimiausios stotelės — „PC Europa".',
  byCarTitle: 'Automobiliu',
  byCar: 'Automobiliu: centras pasiekiamas iš pagrindinių miesto gatvių. Navigacijos adresas: PC Europa, Vilnius.',
  addressTitle: 'Mūsų adresas',
  address: 'Konstitucijos pr. 7A, Vilnius, 09308 Vilniaus m. sav.',
  addressNote: 'PC Europa yra lengvai pasiekiamas viešuoju transportu ir automobiliu.',
  mapLabel: 'Žemėlapis',
} as const

export const PARKAVIMAS_STRINGS = {
  pageTitle: 'Parkavimas — PC Europa',
  pageDescription:
    'Nemokamas parkavimas PC Europa: daugiau nei 500 vietų, elektromobilių įkrovimas ir specialios vietos neįgaliesiems.',
  heading: 'Parkavimas',
  mainTitle: 'Parkavimas',
  mainBody:
    'PC Europa turi nemokamą automobilių stovėjimo aikštelę su daugiau nei 500 vietų. Aikštelė veikia visą parą. Taip pat yra specialiai pažymėtos vietos neįgaliesiems.',
  evTitle: 'Elektromobilių įkrovimas',
  evBody:
    'PC Europa stovėjimo aikštelėje yra įrengtos elektromobilių įkrovimo stotelės. Naudojimasis nemokamas pirmąsias 2 valandas.',
  disabledTitle: 'Neįgaliųjų vietos',
  disabledBody:
    'Specialios stovėjimo vietos neįgaliesiems pažymėtos arčiausiai centrinių įėjimų.',
} as const

export const TAISYKLES_STRINGS = {
  pageTitle: 'Prekybos centro taisyklės — PC Europa',
  pageDescription: 'PC Europa prekybos centro lankytojų elgesio taisyklės ir tvarka.',
  heading: 'Prekybos centro taisyklės',
  generalTitle: 'Bendrosios taisyklės',
  generalItems: [
    'Lankytojų prašoma elgtis pagarbiai kitų svečių ir darbuotojų atžvilgiu.',
    'Rūkyti prekybos centro viduje griežtai draudžiama.',
    'Alkoholinių gėrimų vartojimas viešose centro erdvėse yra draudžiamas.',
    'Garsios muzikos grojimas ar triukšmavimas, trukdantis kitiems lankytojams, nėra toleruojamas.',
  ],
  securityTitle: 'Saugumas',
  securityItems: [
    'Vaizdo kameros veikia visą parą, 7 dienas per savaitę.',
    'Pastebėję įtartiną elgesį, nedelsiant informuokite apsaugos darbuotojus arba informacijos langelį.',
    'Avarinio išėjimo durys yra pažymėtos žaliais ženklais kiekviename aukšte.',
  ],
  childrenTitle: 'Vaikų saugumas',
  childrenBody:
    'Vaikai iki 12 metų privalo būti lydimi suaugusiojo. Tėvai ar globėjai yra visiškai atsakingi už savo vaikų elgesį ir saugumą prekybos centro teritorijoje.',
  petsTitle: 'Gyvūnai',
  petsBody:
    'Nedideli augintiniai gali lankytis centre, jei yra nešami ant rankų arba laikomi pririšti pavadėliu. Savininkas yra visiškai atsakingas už augintinio elgesį ir švarą.',
  liabilityTitle: 'Atsakomybė',
  liabilityBody:
    'Prekybos centras neatsako už lankytojų prarastus ar pavogtus asmeninius daiktus. Rekomenduojame naudotis prie įėjimų esančiomis bagažo saugojimo spintomis.',
} as const

export const SLAPUKU_POLITIKA_STRINGS = {
  pageTitle: 'Slapukų politika — PC Europa',
  pageDescription: 'PC Europa svetainės slapukų naudojimo politika.',
  heading: 'Slapukų politika',
  whatTitle: 'Kas yra slapukai',
  whatBody:
    'Slapukai (angl. cookies) — tai nedideli tekstiniai failai, kurie išsaugomi Jūsų įrenginyje, kai lankotės svetainėje. Jie padeda svetainei prisiminti Jūsų nustatymus ir pagerinti naršymo patirtį.',
  typesTitle: 'Kokius slapukus naudojame',
  necessaryLabel: 'Būtinieji slapukai',
  necessaryBody:
    'Šie slapukai yra būtini tinkamam svetainės veikimui — jie valdo sesiją ir autentifikaciją. Jų išjungti negalima.',
  analyticsLabel: 'Analitiniai slapukai',
  analyticsBody:
    'Naudojame „Google Analytics" slapukus lankytojų srautui analizuoti ir svetainei tobulinti. Duomenys renkami anonimiškai.',
  marketingLabel: 'Rinkodaros slapukai',
  marketingBody:
    'Neprivalomieji slapukai, skirti tinkamesnių reklamų rodymui. Galite juos atšaukti bet kuriuo metu naršyklės nustatymuose.',
  controlTitle: 'Kaip valdyti slapukus',
  controlBody:
    'Slapukus galite valdyti ir ištrinti per savo naršyklės nustatymus. Atkreipiame dėmesį, kad išjungus būtinuosius slapukus, tam tikros svetainės funkcijos gali neveikti tinkamai.',
  contactTitle: 'Susisiekite',
  contactBody: 'Klausimams dėl slapukų rašykite: reklama@baltichorizon.com',
} as const

export const PRIVATUMO_POLITIKA_STRINGS = {
  pageTitle: 'Privatumo politika — PC Europa',
  pageDescription: 'PC Europa svetainės privatumo politika ir asmens duomenų tvarkymas.',
  heading: 'Privatumo politika',
  controllerTitle: 'Duomenų valdytojas',
  controllerBody:
    'Baltic Horizon UAB, Konstitucijos pr. 7A, Vilnius, 09308 Vilniaus m. sav. El. paštas: reklama@baltichorizon.com',
  collectedTitle: 'Kokie duomenys renkami',
  collectedItems: [
    'Kontaktinės formos duomenys: vardas, el. pašto adresas, žinutės turinys.',
    'Analitiniai duomenys: apsilankymo laikas, naršyklė, įrenginio tipas (anonimiškai per „Google Analytics").',
  ],
  usageTitle: 'Kaip naudojame duomenis',
  usageItems: [
    'Atsakyti į Jūsų užklausas ir susisiekti su Jumis.',
    'Tobulinti svetainės veikimą ir turinį.',
    'Vykdyti teisinius įpareigojimus pagal galiojančius teisės aktus.',
  ],
  retentionTitle: 'Duomenų saugojimas',
  retentionBody:
    'Duomenys saugomi ne ilgiau, nei tai būtina nurodytam tikslui pasiekti. Kontaktinės formos duomenys ištrinami po 2 metų nuo paskutinio susisiekimo.',
  rightsTitle: 'Jūsų teisės',
  rightsItems: [
    'Teisė susipažinti su savo asmens duomenimis.',
    'Teisė reikalauti ištaisyti netikslius duomenis.',
    'Teisė reikalauti ištrinti duomenis.',
  ],
  rightsContact: 'Norėdami pasinaudoti savo teisėmis, rašykite: reklama@baltichorizon.com',
  cookiesTitle: 'Slapukai',
  cookiesBody: 'Informacija apie slapukų naudojimą pateikta mūsų ',
  cookiesLinkText: 'slapukų politikoje',
  cookiesLinkHref: '/slapuku-politika',
} as const
