'use client'

import type { Config } from '@measured/puck'
import { Hero } from '@/components/marketing/hero'
import { QuickLinks } from '@/components/marketing/quick-links'
import { CategoriesSection } from '@/components/marketing/categories-section'
import { ActivitiesSection } from '@/components/marketing/activities-section'
import { SocialSection } from '@/components/marketing/social-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { ImageUploadField } from '@/components/admin/image-upload-field'

function SectionPreview({
  label,
  bg = '#f8f8f8',
  height = 120,
}: {
  label: string
  bg?: string
  height?: number
}) {
  return (
    <div
      style={{ background: bg, minHeight: height, border: '1.5px dashed #d1d5db' }}
      className="flex items-center justify-center rounded-lg text-sm font-medium text-gray-400 w-full"
    >
      {label}
    </div>
  )
}

export type PuckBlocks = {
  PageBanner: { slide1: string; slide2: string; slide3: string; slide4: string }
  Hero: { title: string; subtitle: string }
  QuickLinks: {
    links: { label: string; href: string }[]
  }
  CategoriesSection: {
    heading: string
    categories: { title: string; href: string; image: string }[]
  }
  ActivitiesSection: {
    leisureTag: string
    leisureHeading: string
    leisureDescription: string
    leisureImage: string
    sportsHeading: string
    petsHeading: string
    petsDescription: string
    petImage: string
  }
  PartnerLogos: Record<string, never>
  NewsSection: Record<string, never>
  SocialSection: {
    heading: string
    socials: { label: string; href: string }[]
  }
  // Preview-only blocks for pages with DB/hardcoded content
  OpeningHoursBlock: Record<string, never>
  HowToGetHereBlock: Record<string, never>
  StoresDirectoryBlock: Record<string, never>
  LankytojamsBlock: Record<string, never>
  AkcijosGridBlock: Record<string, never>
  DialogaiFoodCourtBlock: Record<string, never>
}

export const puckConfig: Config<PuckBlocks> = {
  components: {
    PageBanner: {
      label: 'Viršelio karuselė',
      fields: {
        slide1: {
          type: 'custom',
          label: 'Nuotrauka 1',
          render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
        },
        slide2: {
          type: 'custom',
          label: 'Nuotrauka 2',
          render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
        },
        slide3: {
          type: 'custom',
          label: 'Nuotrauka 3',
          render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
        },
        slide4: {
          type: 'custom',
          label: 'Nuotrauka 4',
          render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
        },
      },
      defaultProps: { slide1: '', slide2: '', slide3: '', slide4: '' },
      render: ({ slide1, slide2, slide3, slide4 }) => (
        <PageBannerCarousel slides={[slide1, slide2, slide3, slide4].filter(Boolean)} />
      ),
    },

    Hero: {
      label: 'Hero',
      fields: {
        title: { type: 'text', label: 'Antraštė', contentEditable: true },
        subtitle: { type: 'text', label: 'Paantraštė', contentEditable: true },
      },
      defaultProps: { title: '', subtitle: '' },
      render: ({ title, subtitle }) => (
        <Hero title={title || undefined} subtitle={subtitle || undefined} />
      ),
    },

    QuickLinks: {
      label: 'Greitos nuorodos',
      fields: {
        links: {
          type: 'array',
          label: 'Nuorodos',
          arrayFields: {
            label: { type: 'text', label: 'Tekstas' },
            href: { type: 'text', label: 'URL' },
          },
          defaultItemProps: { label: '', href: '/' },
          getItemSummary: (item) => item.label || 'Nuoroda',
        },
      },
      defaultProps: {
        links: [
          { label: 'Parkavimas', href: '/parkavimas' },
          { label: 'Prekybos centro planas', href: '/planas' },
          { label: 'Kontaktai', href: '/kontaktai' },
        ],
      },
      render: ({ links }) => <QuickLinks links={links} />,
    },

    CategoriesSection: {
      label: 'Kategorijos',
      fields: {
        heading: { type: 'text', label: 'Antraštė', contentEditable: true },
        categories: {
          type: 'array',
          label: 'Kategorijos',
          arrayFields: {
            title: { type: 'text', label: 'Pavadinimas' },
            href: { type: 'text', label: 'URL' },
            image: { type: 'text', label: 'Nuotraukos URL' },
          },
          defaultItemProps: { title: '', href: '/', image: '' },
          getItemSummary: (item) => item.title || 'Kategorija',
        },
      },
      defaultProps: {
        heading: 'Čia rasite',
        categories: [
          { title: 'Akcijos ir naujienos', href: '/akcijos', image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-1.jpg' },
          { title: 'Dialogai maisto erdvė', href: '/dialogai', image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-3.jpg' },
          { title: 'Restoranai ir kavinės', href: '/restoranai', image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-2.jpg' },
          { title: 'Parduotuvės ir paslaugos', href: '/parduotuves', image: 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-4.jpg' },
        ],
      },
      render: ({ heading, categories }) => (
        <CategoriesSection heading={heading} categories={categories} />
      ),
    },

    ActivitiesSection: {
      label: 'Veiklos',
      fields: {
        leisureTag: { type: 'text', label: 'Laisvalaikio žyma', contentEditable: true },
        leisureHeading: { type: 'textarea', label: 'Laisvalaikio antraštė', contentEditable: true },
        leisureDescription: { type: 'textarea', label: 'Laisvalaikio aprašymas', contentEditable: true },
        leisureImage: { type: 'text', label: 'Laisvalaikio nuotrauka (URL)' },
        sportsHeading: { type: 'text', label: 'Sporto kortelės antraštė', contentEditable: true },
        petsHeading: { type: 'text', label: 'Augintinių kortelės antraštė', contentEditable: true },
        petsDescription: { type: 'textarea', label: 'Augintinių aprašymas', contentEditable: true },
        petImage: { type: 'text', label: 'Augintinių nuotrauka (URL)' },
      },
      defaultProps: {
        leisureTag: 'Laisvalaikis ir pramogos',
        leisureHeading: 'Vieta ne tik apsipirkti, bet ir praleisti laiką – skoniai, veiklos ir patirtys vienoje vietoje.',
        leisureDescription: '',
        leisureImage: '',
        sportsHeading: 'Rūpestis savimi prasideda čia',
        petsHeading: 'PC EUROPA\ndraugiška augintiniams',
        petsDescription: 'Jūsų augintiniai – mūsų svečiai. Atvykite į PC Europa kartu su savo mažaisiais draugais, nepamiršdami jų priežiūros ir saugumo.',
        petImage: '',
      },
      render: (props) => <ActivitiesSection {...props} />,
    },

    PartnerLogos: {
      label: 'Partnerių logotipai',
      fields: {},
      render: () => <SectionPreview label="Partnerių logotipai" bg="#fefce8" height={120} />,
    },

    NewsSection: {
      label: 'Naujienos',
      fields: {},
      render: () => <SectionPreview label="Naujienos ir akcijos" bg="#fff7ed" height={320} />,
    },

    OpeningHoursBlock: {
      label: 'Darbo laikas (automatinis)',
      fields: {},
      render: () => <SectionPreview label="Darbo laikas — parduotuvių sąrašas (iš DB)" bg="#f0fdf4" height={400} />,
    },

    HowToGetHereBlock: {
      label: 'Kaip mus rasti (automatinis)',
      fields: {},
      render: () => <SectionPreview label="Kaip mus rasti — žemėlapis ir nurodymai" bg="#eff6ff" height={280} />,
    },

    StoresDirectoryBlock: {
      label: 'Parduotuvių sąrašas (automatinis)',
      fields: {},
      render: () => <SectionPreview label="Parduotuvių / restoranų sąrašas (iš DB)" bg="#fafaf9" height={500} />,
    },

    LankytojamsBlock: {
      label: 'Lankytojų informacija (automatinė)',
      fields: {},
      render: () => <SectionPreview label="Parkavimas, patogumai, paslaugos (statinis)" bg="#fdf4ff" height={400} />,
    },

    AkcijosGridBlock: {
      label: 'Akcijų tinklelis (automatinis)',
      fields: {},
      render: () => <SectionPreview label="Akcijų kortelės — iš duomenų bazės" bg="#fff7ed" height={480} />,
    },

    DialogaiFoodCourtBlock: {
      label: 'Dialogai Food Court (automatinis)',
      fields: {},
      render: () => <SectionPreview label="Dialogai restoranų sąrašas (iš DB)" bg="#fef9c3" height={480} />,
    },

    SocialSection: {
      label: 'Socialiniai tinklai',
      fields: {
        heading: { type: 'text', label: 'Antraštė', contentEditable: true },
        socials: {
          type: 'array',
          label: 'Socialiniai tinklai',
          arrayFields: {
            label: { type: 'text', label: 'Pavadinimas' },
            href: { type: 'text', label: 'URL' },
          },
          defaultItemProps: { label: '', href: 'https://' },
          getItemSummary: (item) => item.label || 'Tinklas',
        },
      },
      defaultProps: {
        heading: 'Sekite mus',
        socials: [
          { label: 'Instagram', href: 'https://instagram.com' },
          { label: 'Facebook', href: 'https://facebook.com' },
          { label: 'Tik Tok', href: 'https://tiktok.com' },
        ],
      },
      render: ({ heading, socials }) => (
        <SocialSection heading={heading} socials={socials} />
      ),
    },
  },
}
