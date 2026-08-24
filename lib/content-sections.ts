// lib/content-sections.ts — Field/data schema for the inline dashboard content editor.
// Data shape (ContentData) matches what was stored by the old Puck editor in
// public.puck_pages so app/api/puck/[slug]/route.ts and lib/puck-render.tsx
// (the public marketing-page renderer) need no changes.

// Storefront strings moved to messages/lt.json + messages/en.json (next-intl).
// This admin-editor default-seed content is LT-only (dashboard stays LT-only),
// so it reads the LT catalog directly rather than importing from lib/strings.ts.
import ltMessages from '@/messages/lt.json'

const NEWS_SECTION_STRINGS = ltMessages.newsSection
const AKCIJOS_STRINGS = ltMessages.akcijos
const DARBO_LAIKAS_STRINGS = ltMessages.darboLaikas
const LANKYTOJAMS_STRINGS = ltMessages.lankytojams
const KONTAKTAI_STRINGS = ltMessages.kontaktai
const KAIP_ATVYKTI_STRINGS = ltMessages.kaipAtvykti
const PARKAVIMAS_STRINGS = ltMessages.parkavimas

export type FieldKind = 'text' | 'textarea' | 'richtext' | 'image' | 'array'

export interface ArraySubField {
  key: string
  label: string
  kind: 'text' | 'textarea' | 'image'
}

export interface SectionField {
  key: string
  label: string
  kind: FieldKind
  arrayFields?: ArraySubField[]
  defaultItem?: Record<string, string>
  itemLabelKey?: string
  itemLabelFallback?: string
  max?: number
}

export interface SectionDef {
  type: string
  label: string
  editable: boolean
  note?: string
  fields: SectionField[]
}

export interface ContentBlock {
  props: Record<string, unknown> & { id?: string }
  type: string
}

export interface ContentData {
  content: ContentBlock[]
  root: { props: Record<string, unknown> }
  zones: Record<string, unknown>
}

export const SECTION_DEFS: Record<string, SectionDef> = {
  PageBanner: {
    type: 'PageBanner',
    label: 'Viršelio karuselė',
    editable: true,
    fields: [
      { key: 'slide1', label: 'Nuotrauka 1', kind: 'image' },
      { key: 'slide2', label: 'Nuotrauka 2', kind: 'image' },
      { key: 'slide3', label: 'Nuotrauka 3', kind: 'image' },
      { key: 'slide4', label: 'Nuotrauka 4', kind: 'image' },
    ],
  },

  Hero: {
    type: 'Hero',
    label: 'Hero',
    editable: true,
    fields: [
      { key: 'title', label: 'Antraštė', kind: 'text' },
      { key: 'subtitle', label: 'Paantraštė', kind: 'text' },
      {
        key: 'slides',
        label: 'Karuselės nuotraukos',
        kind: 'array',
        arrayFields: [
          { key: 'src', label: 'Nuotrauka', kind: 'image' },
          { key: 'alt', label: 'Aprašymas (alt)', kind: 'text' },
        ],
        defaultItem: { src: '', alt: 'PC Europa' },
        itemLabelKey: 'alt',
        itemLabelFallback: 'Skaidrė',
      },
    ],
  },

  QuickLinks: {
    type: 'QuickLinks',
    label: 'Greitos nuorodos',
    editable: true,
    fields: [
      {
        key: 'links',
        label: 'Nuorodos',
        kind: 'array',
        arrayFields: [
          { key: 'label', label: 'Tekstas', kind: 'text' },
          { key: 'href', label: 'URL', kind: 'text' },
        ],
        defaultItem: { label: '', href: '/' },
        itemLabelKey: 'label',
        itemLabelFallback: 'Nuoroda',
      },
    ],
  },

  CategoriesSection: {
    type: 'CategoriesSection',
    label: 'Kategorijos',
    editable: true,
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      {
        key: 'categories',
        label: 'Kategorijos',
        kind: 'array',
        arrayFields: [
          { key: 'title', label: 'Pavadinimas', kind: 'text' },
          { key: 'href', label: 'URL', kind: 'text' },
          { key: 'image', label: 'Nuotrauka', kind: 'image' },
        ],
        defaultItem: { title: '', href: '/', image: '' },
        itemLabelKey: 'title',
        itemLabelFallback: 'Kategorija',
      },
    ],
  },

  ActivitiesSection: {
    type: 'ActivitiesSection',
    label: 'Veiklos',
    editable: true,
    fields: [
      { key: 'leisureTag', label: 'Laisvalaikio žyma', kind: 'text' },
      { key: 'leisureHeading', label: 'Laisvalaikio antraštė', kind: 'textarea' },
      { key: 'leisureDescription', label: 'Laisvalaikio aprašymas', kind: 'textarea' },
      { key: 'leisureImage', label: 'Laisvalaikio nuotrauka', kind: 'image' },
      { key: 'sportsHeading', label: 'Sporto kortelės antraštė', kind: 'text' },
      { key: 'sportsImage1', label: 'Sporto nuotrauka 1 (kairė)', kind: 'image' },
      { key: 'sportsImage2', label: 'Sporto nuotrauka 2 (vidurinė)', kind: 'image' },
      { key: 'sportsImage3', label: 'Sporto nuotrauka 3 (dešinė)', kind: 'image' },
      { key: 'petsHeading', label: 'Augintinių kortelės antraštė', kind: 'text' },
      { key: 'petsDescription', label: 'Augintinių aprašymas', kind: 'textarea' },
      { key: 'petImage', label: 'Augintinių nuotrauka', kind: 'image' },
    ],
  },

  PartnerLogos: {
    type: 'PartnerLogos',
    label: 'Partnerių logotipai',
    editable: false,
    note: 'Šis turinys valdomas atskirai (partnerių sąrašas).',
    fields: [],
  },

  NewsSection: {
    type: 'NewsSection',
    label: 'Naujienos',
    editable: true,
    note: 'Kortelės rodomos automatiškai pagal naujausias publikuotas akcijas.',
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      { key: 'ctaLabel', label: 'Mygtuko tekstas', kind: 'text' },
    ],
  },

  OpeningHoursBlock: {
    type: 'OpeningHoursBlock',
    label: 'Darbo laikas',
    editable: true,
    fields: [
      { key: 'heroHeading', label: 'Antraštė', kind: 'text' },
      { key: 'searchPlaceholder', label: 'Paieškos placeholder', kind: 'text' },
      { key: 'loadMoreButton', label: '"Rodyti daugiau" mygtukas', kind: 'text' },
    ],
  },

  HowToGetHereBlock: {
    type: 'HowToGetHereBlock',
    label: 'Kaip mus rasti',
    editable: true,
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      { key: 'subtext', label: 'Paantraštė', kind: 'richtext' },
      { key: 'mapEmbedUrl', label: 'Žemėlapio embed URL', kind: 'text' },
      { key: 'mapLinkUrl', label: 'Maršruto nuoroda', kind: 'text' },
      { key: 'viewRouteLabel', label: 'Mygtuko tekstas', kind: 'text' },
      {
        key: 'transportCards',
        label: 'Transporto kortelės',
        kind: 'array',
        arrayFields: [
          { key: 'title', label: 'Pavadinimas', kind: 'text' },
          { key: 'subtitle', label: 'Paaiškinimas', kind: 'text' },
        ],
        defaultItem: { title: '', subtitle: '' },
        itemLabelKey: 'title',
        itemLabelFallback: 'Kortelė',
        max: 4,
      },
    ],
  },

  StoresDirectoryBlock: {
    type: 'StoresDirectoryBlock',
    label: 'Parduotuvių sąrašas',
    editable: false,
    note: 'Šis sąrašas generuojamas automatiškai iš duomenų bazės.',
    fields: [],
  },

  BannerHoursBlock: {
    type: 'BannerHoursBlock',
    label: 'Darbo laiko kortelės (viršelio juosta)',
    editable: true,
    fields: [
      {
        key: 'cards',
        label: 'Kortelės (pirmoji rodoma per visą plotį)',
        kind: 'array',
        arrayFields: [
          { key: 'label', label: 'Pavadinimas', kind: 'text' },
          { key: 'line1', label: 'Darbo laikas (1 eilutė)', kind: 'text' },
          { key: 'line2', label: 'Darbo laikas (2 eilutė, nebūtina)', kind: 'text' },
        ],
        defaultItem: { label: '', line1: '', line2: '' },
        itemLabelKey: 'label',
        itemLabelFallback: 'Kortelė',
      },
    ],
  },

  LankytojamsBlock: {
    type: 'LankytojamsBlock',
    label: 'Lankytojų informacija',
    editable: true,
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      { key: 'parkingTitle', label: 'Parkavimo antraštė', kind: 'text' },
      { key: 'parkingBody', label: 'Parkavimo aprašymas', kind: 'textarea' },
      { key: 'accessTitle', label: 'Pasiekiamumo antraštė', kind: 'text' },
      { key: 'accessPublicTransport', label: 'Viešasis transportas', kind: 'textarea' },
      { key: 'accessByCar', label: 'Automobiliu', kind: 'textarea' },
      { key: 'amenitiesTitle', label: 'Patogumų antraštė', kind: 'text' },
      {
        key: 'amenities',
        label: 'Patogumai',
        kind: 'array',
        arrayFields: [{ key: 'value', label: 'Punktas', kind: 'text' }],
        defaultItem: { value: '' },
        itemLabelKey: 'value',
        itemLabelFallback: 'Punktas',
      },
      { key: 'faqTitle', label: 'D.U.K. antraštė', kind: 'text' },
      {
        key: 'faqItems',
        label: 'Klausimai',
        kind: 'array',
        arrayFields: [
          { key: 'question', label: 'Klausimas', kind: 'text' },
          { key: 'answer', label: 'Atsakymas', kind: 'textarea' },
        ],
        defaultItem: { question: '', answer: '' },
        itemLabelKey: 'question',
        itemLabelFallback: 'Klausimas',
      },
    ],
  },

  KontaktaiBlock: {
    type: 'KontaktaiBlock',
    label: 'Kontaktų informacija',
    editable: true,
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      { key: 'addressTitle', label: 'Adreso antraštė', kind: 'text' },
      { key: 'address', label: 'Adresas', kind: 'textarea' },
      { key: 'hoursTitle', label: 'Darbo laiko antraštė', kind: 'text' },
      { key: 'hoursWeekdays', label: 'Darbo laikas I–V', kind: 'text' },
      { key: 'hoursSaturday', label: 'Darbo laikas VI', kind: 'text' },
      { key: 'hoursSunday', label: 'Darbo laikas VII', kind: 'text' },
      { key: 'adminHoursTitle', label: 'Administracijos darbo laiko antraštė', kind: 'text' },
      { key: 'adminHours', label: 'Administracijos darbo laikas', kind: 'text' },
    ],
  },

  ParkavimasBlock: {
    type: 'ParkavimasBlock',
    label: 'Parkavimo informacija',
    editable: true,
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      { key: 'mainTitle', label: 'Pagrindinės informacijos antraštė', kind: 'text' },
      { key: 'mainBody', label: 'Pagrindinės informacijos tekstas', kind: 'richtext' },
      { key: 'evTitle', label: 'Elektromobilių įkrovimo antraštė', kind: 'text' },
      { key: 'evBody', label: 'Elektromobilių įkrovimo tekstas', kind: 'richtext' },
      { key: 'disabledTitle', label: 'Neįgaliųjų vietų antraštė', kind: 'text' },
      { key: 'disabledBody', label: 'Neįgaliųjų vietų tekstas', kind: 'richtext' },
    ],
  },

  AkcijosGridBlock: {
    type: 'AkcijosGridBlock',
    label: 'Akcijų tinklelis',
    editable: true,
    fields: [
      { key: 'filterAllLabel', label: 'Filtras: Visi', kind: 'text' },
      { key: 'filterStoresLabel', label: 'Filtras: Parduotuvės', kind: 'text' },
      { key: 'filterServicesLabel', label: 'Filtras: Paslaugos', kind: 'text' },
      { key: 'filterFoodLabel', label: 'Filtras: Maistas', kind: 'text' },
      { key: 'searchPlaceholder', label: 'Paieškos placeholder', kind: 'text' },
      { key: 'loadMoreLabel', label: '"Rodyti daugiau" mygtukas', kind: 'text' },
    ],
  },

  DialogaiFoodCourtBlock: {
    type: 'DialogaiFoodCourtBlock',
    label: 'Dialogai Food Court',
    editable: false,
    note: 'Šis sąrašas generuojamas automatiškai iš duomenų bazės.',
    fields: [],
  },

  NuomaReklamaBanner: {
    type: 'NuomaReklamaBanner',
    label: 'Nuoma / Reklama viršelis',
    editable: true,
    fields: [{ key: 'cover', label: 'Viršelio nuotrauka', kind: 'image' }],
  },

  SocialSection: {
    type: 'SocialSection',
    label: 'Socialiniai tinklai',
    editable: true,
    fields: [
      { key: 'heading', label: 'Antraštė', kind: 'text' },
      {
        key: 'socials',
        label: 'Socialiniai tinklai',
        kind: 'array',
        arrayFields: [
          { key: 'label', label: 'Pavadinimas', kind: 'text' },
          { key: 'href', label: 'URL', kind: 'text' },
        ],
        defaultItem: { label: '', href: 'https://' },
        itemLabelKey: 'label',
        itemLabelFallback: 'Tinklas',
      },
    ],
  },
}

export const PAGES = [
  { slug: 'landing', label: 'Pagrindinis' },
  { slug: 'akcijos', label: 'Akcijos' },
  { slug: 'dialogai', label: 'Dialogai' },
  { slug: 'restoranai', label: 'Restoranai' },
  { slug: 'parduotuves', label: 'Parduotuvės' },
  { slug: 'sportas', label: 'Sportas' },
  { slug: 'laisvalaikis', label: 'Laisvalaikis' },
  { slug: 'darbo-laikas', label: 'Darbo laikas' },
  { slug: 'lankytojams', label: 'Lankytojams' },
  { slug: 'kontaktai', label: 'Kontaktai' },
  { slug: 'kaip-atvykti', label: 'Kaip atvykti' },
  { slug: 'parkavimas', label: 'Parkavimas' },
  { slug: 'naujienos', label: 'Naujienos' },
  { slug: 'nuoma-reklama', label: 'Nuoma / Reklama' },
] as const

export const PREVIEW_URLS: Record<string, string> = {
  landing: '/',
  akcijos: '/akcijos',
  dialogai: '/dialogai',
  restoranai: '/restoranai',
  parduotuves: '/parduotuves',
  sportas: '/sportas',
  laisvalaikis: '/laisvalaikis',
  'darbo-laikas': '/darbo-laikas',
  lankytojams: '/lankytojams',
  kontaktai: '/kontaktai',
  'kaip-atvykti': '/kaip-atvykti',
  parkavimas: '/parkavimas',
  naujienos: '/naujienos',
  'nuoma-reklama': '/nuoma-reklama',
}

// Default/fallback banner images were seeded on the legacy Supabase project and
// never migrated to the current one — matches the DEFAULT_BANNER_SLIDES host used
// by every public marketing page (e.g. app/(marketing)/dialogai/page.tsx).
const BASE = 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets'

export const ALLOWED_SLUGS: Set<string> = new Set(PAGES.map((p) => p.slug))

export const DEFAULT_DATA: Record<string, ContentData> = {
  landing: {
    content: [
      { type: 'Hero', props: { id: 'hero-1', title: '', subtitle: '', slides: [
        { src: `${BASE}/hero-bg.jpg`, alt: 'PC Europa' },
        { src: `${BASE}/activities-coffee.jpg`, alt: 'PC Europa — laisvalaikis' },
        { src: `${BASE}/categories-1.jpg`, alt: 'PC Europa — akcijos' },
        { src: `${BASE}/news-1.jpg`, alt: 'PC Europa — naujienos' },
      ] } },
      { type: 'QuickLinks', props: { id: 'quicklinks-1', links: [
        { label: 'Parkavimas', href: '/parkavimas' },
        { label: 'Prekybos centro planas', href: '/planas' },
        { label: 'Kontaktai', href: '/kontaktai' },
      ] } },
      { type: 'CategoriesSection', props: {
        id: 'categories-1',
        heading: 'Čia rasite',
        categories: [
          { title: 'Akcijos ir naujienos', href: '/akcijos', image: `${BASE}/categories-1.jpg` },
          { title: 'Dialogai maisto erdvė', href: '/dialogai', image: `${BASE}/categories-3.jpg` },
          { title: 'Restoranai ir kavinės', href: '/restoranai', image: `${BASE}/categories-2.jpg` },
          { title: 'Parduotuvės ir paslaugos', href: '/parduotuves', image: `${BASE}/categories-4.jpg` },
        ],
      } },
      { type: 'ActivitiesSection', props: {
        id: 'activities-1',
        leisureTag: 'Laisvalaikis ir pramogos',
        leisureHeading: 'Vieta ne tik apsipirkti, bet ir praleisti laiką – skoniai, veiklos ir patirtys vienoje vietoje.',
        leisureDescription: '',
        leisureImage: '',
        sportsHeading: 'Rūpestis savimi prasideda čia',
        sportsImage1: '',
        sportsImage2: '',
        sportsImage3: '',
        petsHeading: 'PC EUROPA\ndraugiška augintiniams',
        petsDescription: 'Jūsų augintiniai – mūsų svečiai. Atvykite į PC Europa kartu su savo mažaisiais draugais, nepamiršdami jų priežiūros ir saugumo.',
        petImage: '',
      } },
      { type: 'PartnerLogos', props: { id: 'partners-1' } },
      { type: 'NewsSection', props: {
        id: 'news-1',
        heading: NEWS_SECTION_STRINGS.heading,
        ctaLabel: NEWS_SECTION_STRINGS.ctaLabel,
      } },
      { type: 'SocialSection', props: {
        id: 'social-1',
        heading: 'Sekite mus',
        socials: [
          { label: 'Instagram', href: 'https://instagram.com' },
          { label: 'Facebook', href: 'https://facebook.com' },
          { label: 'Tik Tok', href: 'https://tiktok.com' },
        ],
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  akcijos: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-akcijos-1.jpg`, slide2: `${BASE}/banner-akcijos-2.jpg`, slide3: '', slide4: '' } },
      { type: 'AkcijosGridBlock', props: {
        id: 'akcijos-grid-1',
        filterAllLabel: AKCIJOS_STRINGS.filterAll,
        filterStoresLabel: AKCIJOS_STRINGS.filterStores,
        filterServicesLabel: AKCIJOS_STRINGS.filterServices,
        filterFoodLabel: AKCIJOS_STRINGS.filterFood,
        searchPlaceholder: AKCIJOS_STRINGS.searchPlaceholder,
        loadMoreLabel: AKCIJOS_STRINGS.loadMore,
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  dialogai: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-dialogai-1.jpg`, slide2: `${BASE}/banner-dialogai-2.jpg`, slide3: `${BASE}/banner-dialogai-3.jpg`, slide4: '' } },
      { type: 'DialogaiFoodCourtBlock', props: { id: 'dialogai-fc-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  restoranai: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-restoranai-1.jpg`, slide2: `${BASE}/banner-restoranai-2.jpg`, slide3: `${BASE}/banner-restoranai-3.jpg`, slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  parduotuves: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-parduotuves-wide.jpg`, slide2: '', slide3: '', slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  sportas: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-sportas-carousel.jpg`, slide2: '', slide3: '', slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  laisvalaikis: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/hero-bg.jpg`, slide2: `${BASE}/activities-coffee.jpg`, slide3: '', slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  'darbo-laikas': {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: '', slide2: '', slide3: '', slide4: '' } },
      { type: 'BannerHoursBlock', props: {
        id: 'banner-hours-1',
        cards: DARBO_LAIKAS_STRINGS.bannerHoursCards.map((c) => ({ ...c })),
      } },
      { type: 'OpeningHoursBlock', props: {
        id: 'hours-1',
        heroHeading: DARBO_LAIKAS_STRINGS.heroHeading,
        searchPlaceholder: DARBO_LAIKAS_STRINGS.searchPlaceholder,
        loadMoreButton: DARBO_LAIKAS_STRINGS.loadMoreButton,
      } },
      { type: 'HowToGetHereBlock', props: {
        id: 'directions-1',
        heading: DARBO_LAIKAS_STRINGS.howToGetHereHeading,
        subtext: DARBO_LAIKAS_STRINGS.howToGetHereSubtext,
        mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
        mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
        viewRouteLabel: DARBO_LAIKAS_STRINGS.viewRouteButton,
        transportCards: DARBO_LAIKAS_STRINGS.transportCards.map((c) => ({ ...c })),
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  lankytojams: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: '', slide2: '', slide3: '', slide4: '' } },
      { type: 'LankytojamsBlock', props: {
        id: 'visitor-1',
        heading: LANKYTOJAMS_STRINGS.heading,
        parkingTitle: LANKYTOJAMS_STRINGS.parkingTitle,
        parkingBody: LANKYTOJAMS_STRINGS.parkingBody,
        accessTitle: LANKYTOJAMS_STRINGS.accessTitle,
        accessPublicTransport: LANKYTOJAMS_STRINGS.accessPublicTransport,
        accessByCar: LANKYTOJAMS_STRINGS.accessByCar,
        amenitiesTitle: LANKYTOJAMS_STRINGS.amenitiesTitle,
        amenities: LANKYTOJAMS_STRINGS.amenities.map((value) => ({ value })),
        faqTitle: LANKYTOJAMS_STRINGS.faqTitle,
        faqItems: LANKYTOJAMS_STRINGS.faqItems.map((item) => ({ ...item })),
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  kontaktai: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: '', slide2: '', slide3: '', slide4: '' } },
      { type: 'KontaktaiBlock', props: {
        id: 'kontaktai-1',
        heading: KONTAKTAI_STRINGS.heading,
        addressTitle: KONTAKTAI_STRINGS.addressTitle,
        address: KONTAKTAI_STRINGS.address,
        hoursTitle: KONTAKTAI_STRINGS.hoursTitle,
        hoursWeekdays: KONTAKTAI_STRINGS.hoursWeekdays,
        hoursSaturday: KONTAKTAI_STRINGS.hoursSaturday,
        hoursSunday: KONTAKTAI_STRINGS.hoursSunday,
        adminHoursTitle: KONTAKTAI_STRINGS.adminHoursTitle,
        adminHours: KONTAKTAI_STRINGS.adminHours,
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  'kaip-atvykti': {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: '', slide2: '', slide3: '', slide4: '' } },
      { type: 'HowToGetHereBlock', props: {
        id: 'directions-1',
        heading: KAIP_ATVYKTI_STRINGS.heading,
        subtext: KAIP_ATVYKTI_STRINGS.addressNote,
        mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
        mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
        viewRouteLabel: DARBO_LAIKAS_STRINGS.viewRouteButton,
        transportCards: DARBO_LAIKAS_STRINGS.transportCards.map((c) => ({ ...c })),
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  parkavimas: {
    content: [
      { type: 'ParkavimasBlock', props: {
        id: 'parkavimas-1',
        heading: PARKAVIMAS_STRINGS.heading,
        mainTitle: PARKAVIMAS_STRINGS.mainTitle,
        mainBody: PARKAVIMAS_STRINGS.mainBody,
        evTitle: PARKAVIMAS_STRINGS.evTitle,
        evBody: PARKAVIMAS_STRINGS.evBody,
        disabledTitle: PARKAVIMAS_STRINGS.disabledTitle,
        disabledBody: PARKAVIMAS_STRINGS.disabledBody,
      } },
    ],
    root: { props: {} },
    zones: {},
  },
  naujienos: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-akcijos-1.jpg`, slide2: `${BASE}/banner-akcijos-2.jpg`, slide3: '', slide4: '' } },
    ],
    root: { props: {} },
    zones: {},
  },
  'nuoma-reklama': {
    content: [
      { type: 'NuomaReklamaBanner', props: { id: 'banner-1', cover: `${BASE}/nuoma-reklama/banner.jpg` } },
    ],
    root: { props: {} },
    zones: {},
  },
}

export const FALLBACK_DATA: ContentData = { content: [], root: { props: {} }, zones: {} }
