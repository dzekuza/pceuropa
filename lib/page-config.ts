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
  navLabel: string
  description: string
  previewUrl: string
  sections: SectionConfig[]
}

export const PAGES_CONFIG: PageConfig[] = [
  {
    slug: 'landing',
    title: 'Pagrindinis puslapis',
    navLabel: 'Pagrindinis',
    description: 'Pagrindinės svetainės hero nuotraukos ir antraštės',
    previewUrl: '/',
    sections: [
      {
        key: 'hero',
        title: 'Hero karuselė',
        fields: [
          { key: 'title', label: 'Antraštė (overlay)', type: 'text', placeholder: '' },
          { key: 'subtitle', label: 'Paantraštė (overlay)', type: 'textarea', placeholder: '' },
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
          { key: 'slide_2', label: 'Nuotrauka 2', type: 'image', placeholder: 'https://...' },
          { key: 'slide_3', label: 'Nuotrauka 3', type: 'image', placeholder: 'https://...' },
          { key: 'slide_4', label: 'Nuotrauka 4', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'akcijos',
    title: 'Akcijos ir Naujienos',
    navLabel: 'Akcijos',
    description: 'Akcijų puslapio viršelio nuotraukos',
    previewUrl: '/akcijos',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotraukos',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
          { key: 'slide_2', label: 'Nuotrauka 2', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'parduotuves',
    title: 'Parduotuvės ir Paslaugos',
    navLabel: 'Parduotuvės',
    description: 'Parduotuvių puslapio viršelio nuotrauka',
    previewUrl: '/parduotuves',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotrauka',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'restoranai',
    title: 'Restoranai ir Kavinės',
    navLabel: 'Restoranai',
    description: 'Restoranų puslapio viršelio nuotraukos',
    previewUrl: '/restoranai',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotraukos',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
          { key: 'slide_2', label: 'Nuotrauka 2', type: 'image', placeholder: 'https://...' },
          { key: 'slide_3', label: 'Nuotrauka 3', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'dialogai',
    title: 'Dialogai Food Court',
    navLabel: 'Dialogai',
    description: 'Dialogai puslapio viršelio nuotraukos',
    previewUrl: '/dialogai',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotraukos',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
          { key: 'slide_2', label: 'Nuotrauka 2', type: 'image', placeholder: 'https://...' },
          { key: 'slide_3', label: 'Nuotrauka 3', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'sportas',
    title: 'Sportas ir Sveikatingumas',
    navLabel: 'Sportas',
    description: 'Sporto puslapio viršelio nuotrauka',
    previewUrl: '/sportas',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotrauka',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'laisvalaikis',
    title: 'Laisvalaikis ir Pramogos',
    navLabel: 'Laisvalaikis',
    description: 'Laisvalaikio puslapio viršelio nuotraukos',
    previewUrl: '/laisvalaikis',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotraukos',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
          { key: 'slide_2', label: 'Nuotrauka 2', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'darbo-laikas',
    title: 'Darbo laikas',
    navLabel: 'Darbo laikas',
    description: 'Puslapio antraštė ir darbo valandų aprašymas',
    previewUrl: '/darbo-laikas',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          { key: 'heading', label: 'Antraštė', type: 'text', placeholder: 'Darbo laikas' },
          { key: 'subtitle', label: 'Paantraštė', type: 'text', placeholder: 'Laukiame Jūsų kiekvieną dieną' },
          { key: 'note', label: 'Pastaba', type: 'textarea', placeholder: 'Švenčių dienomis darbo laikas gali keistis.' },
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
        ],
      },
    ],
  },
  {
    slug: 'naujienos',
    title: 'Naujienos',
    navLabel: 'Naujienos',
    description: 'Naujienų puslapio viršelio nuotraukos',
    previewUrl: '/naujienos',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotraukos',
        fields: [
          { key: 'slide_1', label: 'Nuotrauka 1', type: 'image', placeholder: 'https://...' },
          { key: 'slide_2', label: 'Nuotrauka 2', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'nuoma-reklama',
    title: 'Nuoma / Reklama',
    navLabel: 'Nuoma / Reklama',
    description: 'Nuoma / Reklama puslapio viršelio nuotrauka',
    previewUrl: '/nuoma-reklama',
    sections: [
      {
        key: 'banner',
        title: 'Viršelio nuotrauka',
        fields: [
          { key: 'cover', label: 'Nuotrauka', type: 'image', placeholder: 'https://...' },
        ],
      },
    ],
  },
  {
    slug: 'kontaktai',
    title: 'Kontaktai',
    navLabel: 'Kontaktai',
    description: 'Kontaktų puslapio antraštė, adresas ir darbo laikas',
    previewUrl: '/kontaktai',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          { key: 'heading', label: 'Puslapio antraštė', type: 'text', placeholder: 'Kontaktai' },
        ],
      },
      {
        key: 'contact',
        title: 'Adresas ir darbo laikas',
        fields: [
          { key: 'address', label: 'Adresas', type: 'textarea', placeholder: '' },
          { key: 'hours_weekdays', label: 'Darbo laikas I–V', type: 'text', placeholder: '' },
          { key: 'hours_saturday', label: 'Darbo laikas VI', type: 'text', placeholder: '' },
          { key: 'hours_sunday', label: 'Darbo laikas VII', type: 'text', placeholder: '' },
          { key: 'admin_hours', label: 'Administracijos darbo laikas', type: 'text', placeholder: '' },
        ],
      },
    ],
  },
  {
    slug: 'lankytojams',
    title: 'Informacija lankytojams',
    navLabel: 'Lankytojams',
    description: 'Lankytojų informacijos puslapio antraštės ir turinys',
    previewUrl: '/lankytojams',
    sections: [
      {
        key: 'hero',
        title: 'Antraštė',
        fields: [
          { key: 'heading', label: 'Puslapio antraštė', type: 'text', placeholder: 'Informacija lankytojams' },
        ],
      },
      {
        key: 'parking',
        title: 'Parkavimas',
        fields: [
          { key: 'title', label: 'Skyriaus antraštė', type: 'text', placeholder: 'Parkavimas' },
          { key: 'body', label: 'Tekstas', type: 'textarea', placeholder: '' },
        ],
      },
      {
        key: 'amenities',
        title: 'Patogumai',
        fields: [
          { key: 'title', label: 'Skyriaus antraštė', type: 'text', placeholder: 'Patogumai' },
        ],
      },
      {
        key: 'services',
        title: 'Paslaugos',
        fields: [
          { key: 'title', label: 'Skyriaus antraštė', type: 'text', placeholder: 'Papildomos paslaugos' },
        ],
      },
    ],
  },
]

export function getPageConfig(slug: string): PageConfig | undefined {
  return PAGES_CONFIG.find((p) => p.slug === slug)
}
