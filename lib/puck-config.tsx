'use client'

import type { Config } from '@measured/puck'
import { Hero, HERO_DEFAULT_SLIDES } from '@/components/marketing/hero'
import { QuickLinks } from '@/components/marketing/quick-links'
import { CategoriesSection } from '@/components/marketing/categories-section'
import { ActivitiesSection } from '@/components/marketing/activities-section'
import { SocialSection } from '@/components/marketing/social-section'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { NewsSection } from '@/components/marketing/news-section'
import { HowToGetHereSection } from '@/components/marketing/how-to-get-here-section'
import { OpeningHoursSection } from '@/components/marketing/opening-hours-section'
import { LankytojamsContent } from '@/components/marketing/lankytojams-content'
import { AkcijosGrid } from '@/components/marketing/akcijos-grid'
import { NEWS_SECTION_STRINGS, DARBO_LAIKAS_STRINGS, LANKYTOJAMS_STRINGS, AKCIJOS_STRINGS } from '@/lib/strings'

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
  Hero: { title: string; subtitle: string; slides: { src: string; alt: string }[] }
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
  NewsSection: {
    heading: string
    ctaLabel: string
    items: { image: string; title: string; date: string; href: string }[]
  }
  SocialSection: {
    heading: string
    socials: { label: string; href: string }[]
  }
  // Preview-only blocks for pages with DB/hardcoded content
  OpeningHoursBlock: {
    heroHeading: string
    heroSubtext1: string
    heroSubtext2: string
    heroSubtext3: string
    searchPlaceholder: string
    loadMoreButton: string
  }
  HowToGetHereBlock: {
    heading: string
    subtext: string
    mapEmbedUrl: string
    mapLinkUrl: string
    viewRouteLabel: string
    transportCards: { title: string; subtitle: string }[]
  }
  StoresDirectoryBlock: Record<string, never>
  LankytojamsBlock: {
    heading: string
    parkingTitle: string
    parkingBody: string
    accessTitle: string
    accessPublicTransport: string
    accessByCar: string
    amenitiesTitle: string
    amenities: { value: string }[]
    faqTitle: string
    faqItems: { question: string; answer: string }[]
  }
  AkcijosGridBlock: {
    filterAllLabel: string
    filterStoresLabel: string
    filterServicesLabel: string
    filterFoodLabel: string
    searchPlaceholder: string
    loadMoreLabel: string
  }
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
        slides: {
          type: 'array',
          label: 'Karuselės nuotraukos',
          arrayFields: {
            src: {
              type: 'custom',
              label: 'Nuotrauka',
              render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
            },
            alt: { type: 'text', label: 'Aprašymas (alt)' },
          },
          defaultItemProps: { src: '', alt: 'PC Europa' },
          getItemSummary: (item) => item.alt || 'Skaidrė',
        },
      },
      defaultProps: { title: '', subtitle: '', slides: HERO_DEFAULT_SLIDES.map((s) => ({ ...s })) },
      render: ({ title, subtitle, slides }) => (
        <Hero title={title || undefined} subtitle={subtitle || undefined} slides={slides} />
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
            image: {
              type: 'custom',
              label: 'Nuotrauka',
              render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
            },
          },
          defaultItemProps: { title: '', href: '/', image: '' },
          getItemSummary: (item) => item.title || 'Kategorija',
        },
      },
      defaultProps: {
        heading: 'Čia rasite',
        categories: [
          { title: 'Akcijos ir naujienos', href: '/akcijos', image: 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/categories-1.jpg' },
          { title: 'Dialogai maisto erdvė', href: '/dialogai', image: 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/categories-3.jpg' },
          { title: 'Restoranai ir kavinės', href: '/restoranai', image: 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/categories-2.jpg' },
          { title: 'Parduotuvės ir paslaugos', href: '/parduotuves', image: 'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/categories-4.jpg' },
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
        leisureImage: {
          type: 'custom',
          label: 'Laisvalaikio nuotrauka',
          render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
        },
        sportsHeading: { type: 'text', label: 'Sporto kortelės antraštė', contentEditable: true },
        petsHeading: { type: 'text', label: 'Augintinių kortelės antraštė', contentEditable: true },
        petsDescription: { type: 'textarea', label: 'Augintinių aprašymas', contentEditable: true },
        petImage: {
          type: 'custom',
          label: 'Augintinių nuotrauka',
          render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
        },
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
      fields: {
        heading: { type: 'text', label: 'Antraštė', contentEditable: true },
        ctaLabel: { type: 'text', label: 'Mygtuko tekstas', contentEditable: true },
        items: {
          type: 'array',
          label: 'Naujienos',
          arrayFields: {
            image: {
              type: 'custom',
              label: 'Nuotrauka',
              render: ({ value, onChange }) => <ImageUploadField value={value as string} onChange={onChange} />,
            },
            title: { type: 'text', label: 'Pavadinimas' },
            date: { type: 'text', label: 'Data' },
            href: { type: 'text', label: 'URL' },
          },
          defaultItemProps: { image: '', title: '', date: '', href: '/akcijos' },
          getItemSummary: (item) => item.title || 'Naujiena',
        },
      },
      defaultProps: {
        heading: NEWS_SECTION_STRINGS.heading,
        ctaLabel: NEWS_SECTION_STRINGS.ctaLabel,
        items: NEWS_SECTION_STRINGS.items.map((item) => ({ ...item })),
      },
      render: ({ heading, ctaLabel, items }) => (
        <NewsSection heading={heading} ctaLabel={ctaLabel} items={items} />
      ),
    },

    OpeningHoursBlock: {
      label: 'Darbo laikas',
      fields: {
        heroHeading: { type: 'text', label: 'Antraštė', contentEditable: true },
        heroSubtext1: { type: 'text', label: 'Eilutė 1 (prekybos centras)', contentEditable: true },
        heroSubtext2: { type: 'text', label: 'Eilutė 2 (parduotuvės)', contentEditable: true },
        heroSubtext3: { type: 'text', label: 'Eilutė 3 (sporto klubai)', contentEditable: true },
        searchPlaceholder: { type: 'text', label: 'Paieškos placeholder', contentEditable: true },
        loadMoreButton: { type: 'text', label: '"Rodyti daugiau" mygtukas', contentEditable: true },
      },
      defaultProps: {
        heroHeading: DARBO_LAIKAS_STRINGS.heroHeading,
        heroSubtext1: DARBO_LAIKAS_STRINGS.heroSubtext1,
        heroSubtext2: DARBO_LAIKAS_STRINGS.heroSubtext2,
        heroSubtext3: DARBO_LAIKAS_STRINGS.heroSubtext3,
        searchPlaceholder: DARBO_LAIKAS_STRINGS.searchPlaceholder,
        loadMoreButton: DARBO_LAIKAS_STRINGS.loadMoreButton,
      },
      render: (props) => <OpeningHoursSection stores={[]} {...props} />,
    },

    HowToGetHereBlock: {
      label: 'Kaip mus rasti',
      fields: {
        heading: { type: 'text', label: 'Antraštė', contentEditable: true },
        subtext: { type: 'textarea', label: 'Paantraštė', contentEditable: true },
        mapEmbedUrl: { type: 'text', label: 'Žemėlapio embed URL' },
        mapLinkUrl: { type: 'text', label: 'Maršruto nuoroda' },
        viewRouteLabel: { type: 'text', label: 'Mygtuko tekstas', contentEditable: true },
        transportCards: {
          type: 'array',
          label: 'Transporto kortelės',
          arrayFields: {
            title: { type: 'text', label: 'Pavadinimas' },
            subtitle: { type: 'text', label: 'Paaiškinimas' },
          },
          defaultItemProps: { title: '', subtitle: '' },
          getItemSummary: (item) => item.title || 'Kortelė',
          max: 4,
        },
      },
      defaultProps: {
        heading: DARBO_LAIKAS_STRINGS.howToGetHereHeading,
        subtext: DARBO_LAIKAS_STRINGS.howToGetHereSubtext,
        mapEmbedUrl: 'https://maps.google.com/maps?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308&t=&z=15&ie=UTF8&iwloc=&output=embed',
        mapLinkUrl: 'https://maps.google.com/?q=Europa,+Konstitucijos+pr.+7A,+Vilnius,+09308',
        viewRouteLabel: DARBO_LAIKAS_STRINGS.viewRouteButton,
        transportCards: DARBO_LAIKAS_STRINGS.transportCards.map((c) => ({ ...c })),
      },
      render: (props) => <HowToGetHereSection {...props} />,
    },

    StoresDirectoryBlock: {
      label: 'Parduotuvių sąrašas (automatinis)',
      fields: {},
      render: () => <SectionPreview label="Parduotuvių / restoranų sąrašas (iš DB)" bg="#fafaf9" height={500} />,
    },

    LankytojamsBlock: {
      label: 'Lankytojų informacija',
      fields: {
        heading: { type: 'text', label: 'Antraštė', contentEditable: true },
        parkingTitle: { type: 'text', label: 'Parkavimo antraštė', contentEditable: true },
        parkingBody: { type: 'textarea', label: 'Parkavimo aprašymas', contentEditable: true },
        accessTitle: { type: 'text', label: 'Pasiekiamumo antraštė', contentEditable: true },
        accessPublicTransport: { type: 'textarea', label: 'Viešasis transportas', contentEditable: true },
        accessByCar: { type: 'textarea', label: 'Automobiliu', contentEditable: true },
        amenitiesTitle: { type: 'text', label: 'Patogumų antraštė', contentEditable: true },
        amenities: {
          type: 'array',
          label: 'Patogumai',
          arrayFields: {
            value: { type: 'text', label: 'Punktas' },
          },
          defaultItemProps: { value: '' },
          getItemSummary: (item) => item.value || 'Punktas',
        },
        faqTitle: { type: 'text', label: 'D.U.K. antraštė', contentEditable: true },
        faqItems: {
          type: 'array',
          label: 'Klausimai',
          arrayFields: {
            question: { type: 'text', label: 'Klausimas' },
            answer: { type: 'textarea', label: 'Atsakymas' },
          },
          defaultItemProps: { question: '', answer: '' },
          getItemSummary: (item) => item.question || 'Klausimas',
        },
      },
      defaultProps: {
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
      },
      render: ({ amenities, faqItems, ...rest }) => (
        <LankytojamsContent {...rest} amenities={amenities.map((a) => a.value)} faqItems={faqItems} />
      ),
    },

    AkcijosGridBlock: {
      label: 'Akcijų tinklelis',
      fields: {
        filterAllLabel: { type: 'text', label: 'Filtras: Visi', contentEditable: true },
        filterStoresLabel: { type: 'text', label: 'Filtras: Parduotuvės', contentEditable: true },
        filterServicesLabel: { type: 'text', label: 'Filtras: Paslaugos', contentEditable: true },
        filterFoodLabel: { type: 'text', label: 'Filtras: Maistas', contentEditable: true },
        searchPlaceholder: { type: 'text', label: 'Paieškos placeholder', contentEditable: true },
        loadMoreLabel: { type: 'text', label: '"Rodyti daugiau" mygtukas', contentEditable: true },
      },
      defaultProps: {
        filterAllLabel: AKCIJOS_STRINGS.filterAll,
        filterStoresLabel: AKCIJOS_STRINGS.filterStores,
        filterServicesLabel: AKCIJOS_STRINGS.filterServices,
        filterFoodLabel: AKCIJOS_STRINGS.filterFood,
        searchPlaceholder: AKCIJOS_STRINGS.searchPlaceholder,
        loadMoreLabel: AKCIJOS_STRINGS.loadMore,
      },
      render: (props) => <AkcijosGrid items={[]} {...props} />,
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
