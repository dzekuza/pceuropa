// lib/page-config.ts — Defines editable pages, sections, and fields for the CMS

export type FieldType = 'text' | 'textarea' | 'image'

export interface PageField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
}

export interface SectionConfig {
  key: string
  title: string
  fields: PageField[]
}

export interface PageConfig {
  slug: string
  title: string
  navLabel: string   // label shown in the public marketing header
  description: string
  previewUrl: string // URL of the public-facing page
  sections: SectionConfig[]
}

export const PAGES_CONFIG: PageConfig[] = [
  {
    slug: 'landing',
    title: 'Pagrindinis puslapis',
    navLabel: 'Pagrindinis',
    description: 'Viešas pirkimų centro puslapis — antraštė, aprašymas, kontaktai',
    previewUrl: '/',
    sections: [
      {
        key: 'hero',
        title: 'Pagrindinė sekcija',
        fields: [
          { key: 'title', label: 'Antraštė', type: 'text', placeholder: 'PC Europa' },
          {
            key: 'subtitle',
            label: 'Paantraštė',
            type: 'textarea',
            placeholder: 'Pirkimų centras Vilniaus centre...',
          },
          {
            key: 'cta_text',
            label: 'Mygtuko tekstas',
            type: 'text',
            placeholder: 'Sužinoti daugiau',
          },
          { key: 'image_url', label: 'Fono nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'about',
        title: 'Apie mus (sekcija)',
        fields: [
          { key: 'heading', label: 'Antraštė', type: 'text', placeholder: 'Apie PC Europa' },
          {
            key: 'description',
            label: 'Aprašymas',
            type: 'textarea',
            placeholder: 'PC Europa yra modernus pirkimų centras...',
          },
          { key: 'image_url', label: 'Nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'contact',
        title: 'Kontaktai (sekcija)',
        fields: [
          {
            key: 'heading',
            label: 'Antraštė',
            type: 'text',
            placeholder: 'Susisiekite su mumis',
          },
          { key: 'address', label: 'Adresas', type: 'text', placeholder: 'Naugarduko g. 76, Vilnius' },
          { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 5 123 4567' },
          { key: 'email', label: 'El. paštas', type: 'text', placeholder: 'info@pceuropa.lt' },
        ],
      },
    ],
  },
  {
    slug: 'about',
    title: 'Apie mus',
    navLabel: 'Apie mus',
    description: 'Istorija, faktai ir skaičiai apie pirkimų centrą',
    previewUrl: '/about',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          { key: 'heading', label: 'Antraštė', type: 'text', placeholder: 'Apie PC Europa' },
          {
            key: 'tagline',
            label: 'Šūkis',
            type: 'text',
            placeholder: 'Jūsų mėgstamiausias pirkimų centras',
          },
          { key: 'image_url', label: 'Viršelio nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'story',
        title: 'Mūsų istorija',
        fields: [
          { key: 'heading', label: 'Antraštė', type: 'text', placeholder: 'Mūsų istorija' },
          {
            key: 'description',
            label: 'Tekstas',
            type: 'textarea',
            placeholder: 'PC Europa įkurta...',
          },
          { key: 'image_url', label: 'Nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'stats',
        title: 'Skaičiai ir faktai',
        fields: [
          { key: 'stat1_value', label: '1 skaičius (reikšmė)', type: 'text', placeholder: '15+' },
          { key: 'stat1_label', label: '1 skaičius (pavadinimas)', type: 'text', placeholder: 'Metai rinkoje' },
          { key: 'stat2_value', label: '2 skaičius (reikšmė)', type: 'text', placeholder: '80+' },
          { key: 'stat2_label', label: '2 skaičius (pavadinimas)', type: 'text', placeholder: 'Parduotuvių' },
          { key: 'stat3_value', label: '3 skaičius (reikšmė)', type: 'text', placeholder: '2M+' },
          { key: 'stat3_label', label: '3 skaičius (pavadinimas)', type: 'text', placeholder: 'Lankytojų per metus' },
        ],
      },
    ],
  },
  {
    slug: 'contact',
    title: 'Kontaktai',
    navLabel: 'Kontaktai',
    description: 'Adresas, telefonas, el. paštas ir žemėlapis',
    previewUrl: '/contact',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          {
            key: 'heading',
            label: 'Antraštė',
            type: 'text',
            placeholder: 'Susisiekite su mumis',
          },
          {
            key: 'subtitle',
            label: 'Paantraštė',
            type: 'textarea',
            placeholder: 'Esame pasiruošę atsakyti į Jūsų klausimus...',
          },
        ],
      },
      {
        key: 'info',
        title: 'Kontaktinė informacija',
        fields: [
          { key: 'address', label: 'Adresas', type: 'text', placeholder: 'Naugarduko g. 76, Vilnius' },
          { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 5 123 4567' },
          { key: 'email', label: 'El. paštas', type: 'text', placeholder: 'info@pceuropa.lt' },
          {
            key: 'hours',
            label: 'Darbo laikas',
            type: 'text',
            placeholder: 'I–VII: 10:00–21:00',
          },
        ],
      },
      {
        key: 'map',
        title: 'Žemėlapis',
        fields: [
          {
            key: 'embed_url',
            label: 'Google Maps embed URL',
            type: 'text',
            placeholder: 'https://www.google.com/maps/embed?...',
          },
          {
            key: 'note',
            label: 'Pastaba',
            type: 'text',
            placeholder: 'Nemokamas parkavimas 3 val.',
          },
        ],
      },
    ],
  },
  {
    slug: 'events',
    title: 'Renginiai',
    navLabel: 'Renginiai',
    description: 'Artėjantys renginiai ir akcijos',
    previewUrl: '/events',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          { key: 'heading', label: 'Antraštė', type: 'text', placeholder: 'Renginiai ir akcijos' },
          {
            key: 'subtitle',
            label: 'Paantraštė',
            type: 'textarea',
            placeholder: 'Sekite naujausias akcijas ir renginius...',
          },
        ],
      },
      {
        key: 'event1',
        title: '1 renginys',
        fields: [
          { key: 'title', label: 'Pavadinimas', type: 'text', placeholder: 'Vasaros išpardavimas' },
          { key: 'date', label: 'Data', type: 'text', placeholder: '2025-07-01 – 2025-07-31' },
          {
            key: 'description',
            label: 'Aprašymas',
            type: 'textarea',
            placeholder: 'Iki 50% nuolaida daugelyje parduotuvių...',
          },
          { key: 'image_url', label: 'Nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'event2',
        title: '2 renginys',
        fields: [
          { key: 'title', label: 'Pavadinimas', type: 'text', placeholder: '' },
          { key: 'date', label: 'Data', type: 'text', placeholder: '' },
          { key: 'description', label: 'Aprašymas', type: 'textarea', placeholder: '' },
          { key: 'image_url', label: 'Nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
      {
        key: 'event3',
        title: '3 renginys',
        fields: [
          { key: 'title', label: 'Pavadinimas', type: 'text', placeholder: '' },
          { key: 'date', label: 'Data', type: 'text', placeholder: '' },
          { key: 'description', label: 'Aprašymas', type: 'textarea', placeholder: '' },
          { key: 'image_url', label: 'Nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'hours',
    title: 'Darbo laikas',
    navLabel: 'Darbo laikas',
    description: 'Pirkimų centro darbo valandos',
    previewUrl: '/hours',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          { key: 'heading', label: 'Antraštė', type: 'text', placeholder: 'Darbo laikas' },
          {
            key: 'subtitle',
            label: 'Paantraštė',
            type: 'text',
            placeholder: 'Laukiame Jūsų kiekvieną dieną',
          },
          {
            key: 'note',
            label: 'Pastaba',
            type: 'textarea',
            placeholder: 'Švenčių dienomis darbo laikas gali keistis.',
          },
        ],
      },
      {
        key: 'schedule',
        title: 'Tvarkaraštis',
        fields: [
          { key: 'weekdays_label', label: 'Darbo dienos (pavadinimas)', type: 'text', placeholder: 'Pirmadienis – Penktadienis' },
          { key: 'weekdays_hours', label: 'Darbo dienos (laikas)', type: 'text', placeholder: '10:00 – 21:00' },
          { key: 'saturday_label', label: 'Šeštadienis (pavadinimas)', type: 'text', placeholder: 'Šeštadienis' },
          { key: 'saturday_hours', label: 'Šeštadienis (laikas)', type: 'text', placeholder: '10:00 – 21:00' },
          { key: 'sunday_label', label: 'Sekmadienis (pavadinimas)', type: 'text', placeholder: 'Sekmadienis' },
          { key: 'sunday_hours', label: 'Sekmadienis (laikas)', type: 'text', placeholder: '10:00 – 20:00' },
          { key: 'holidays_label', label: 'Šventės (pavadinimas)', type: 'text', placeholder: 'Valstybinės šventės' },
          { key: 'holidays_hours', label: 'Šventės (laikas)', type: 'text', placeholder: '11:00 – 18:00' },
        ],
      },
    ],
  },
]

export function getPageConfig(slug: string): PageConfig | undefined {
  return PAGES_CONFIG.find((p) => p.slug === slug)
}
