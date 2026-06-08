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
  description: string
  sections: SectionConfig[]
}

export const PAGES_CONFIG: PageConfig[] = [
  {
    slug: 'landing',
    title: 'Pagrindinis puslapis',
    description: 'Viešas pirkimų centro puslapis — antraštė, aprašymas, kontaktai',
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
          {
            key: 'image_url',
            label: 'Fono nuotrauka',
            type: 'image',
            placeholder: 'https://...',
          },
        ],
      },
      {
        key: 'about',
        title: 'Apie mus',
        fields: [
          {
            key: 'heading',
            label: 'Antraštė',
            type: 'text',
            placeholder: 'Apie PC Europa',
          },
          {
            key: 'description',
            label: 'Aprašymas',
            type: 'textarea',
            placeholder: 'PC Europa yra modernus pirkimų centras...',
          },
          {
            key: 'image_url',
            label: 'Nuotrauka',
            type: 'image',
            placeholder: 'https://...',
          },
        ],
      },
      {
        key: 'contact',
        title: 'Kontaktai',
        fields: [
          {
            key: 'heading',
            label: 'Antraštė',
            type: 'text',
            placeholder: 'Susisiekite su mumis',
          },
          {
            key: 'address',
            label: 'Adresas',
            type: 'text',
            placeholder: 'Naugarduko g. 76, Vilnius',
          },
          {
            key: 'phone',
            label: 'Telefonas',
            type: 'text',
            placeholder: '+370 5 123 4567',
          },
          {
            key: 'email',
            label: 'El. paštas',
            type: 'text',
            placeholder: 'info@pceuropa.lt',
          },
        ],
      },
    ],
  },
]

export function getPageConfig(slug: string): PageConfig | undefined {
  return PAGES_CONFIG.find((p) => p.slug === slug)
}
