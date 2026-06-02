import Link from 'next/link'
import { DisplayHeading, BodyText } from './ui/typography'
import { ArrowIcon } from './ui/arrow-icon'

const imgLeft1 = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-1.jpg'
const imgLeft2 = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-2.jpg'
const imgRight1 = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-3.jpg'
const imgRight2 = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/categories-4.jpg'

const CATEGORIES = [
  {
    title: 'Parduotuvės ir paslaugos',
    description:
      'Platus parduotuvių pasirinkimas – mada, grožis, technologijos ir kasdieniai atradimai. Kasdieniai patogumai vienoje vietoje – nuo grožio iki finansinių ir kitų paslaugų.',
    href: '/parduotuves',
    showButton: true,
  },
  {
    title: 'Restoranai ir kavinės',
    description: 'Atrask įvairius skonius – nuo greitų užkandžių iki jaukių vakarienių miesto centre.',
    href: '/restoranai',
    showButton: false,
  },
  {
    title: 'Akcijos ir naujienos',
    description:
      'Nuolatos vykstančios akcijos, renginiai, naujienos ir pasiūlymai, kurie suteikia daugiau nei tik apsipirkimą.',
    href: '/akcijos',
    showButton: false,
  },
]

export function CategoriesSection() {
  return (
    <section className="w-full max-w-[1300px] mx-auto px-4 lg:px-0 py-6 md:py-8 lg:py-12">
      {/* Badge */}
      <div className="flex justify-center mb-8 lg:mb-0">
        <span className="inline-flex items-center bg-black/10 rounded-full px-6 lg:px-8 py-[5px] text-[14px] lg:text-[16px] font-medium leading-[22.4px] text-black whitespace-nowrap">
          Čia rasite
        </span>
      </div>

      {/* Layout: normal flow on mobile/tablet, absolute on desktop */}
      <div className="lg:relative lg:h-[783px]">

        {/* Floating side images — desktop only */}
        <div className="hidden lg:block absolute inset-x-[-15px]">
          <img src={imgLeft1} alt="" className="absolute left-[15px] top-[160px] size-[198px] rounded-[16px] object-cover" />
          <img src={imgLeft2} alt="" className="absolute left-[60px] top-[488px] size-[198px] rounded-[16px] object-cover" />
          <img src={imgRight1} alt="" className="absolute right-[15px] top-[150px] size-[198px] rounded-[16px] object-cover" />
          <img src={imgRight2} alt="" className="absolute right-[60px] top-[498px] size-[198px] rounded-[16px] object-cover" />
        </div>

        {/* Category list */}
        <div className="flex flex-col gap-6 md:gap-8 lg:gap-[46px] lg:absolute lg:left-[305px] lg:top-[82px] lg:w-[690px]">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.href}
              className="border-b border-[#d6d6d6] flex flex-col gap-4 lg:gap-6 items-center pb-6 lg:pb-[30px] text-center"
            >
              <DisplayHeading>{cat.title}</DisplayHeading>
              <BodyText className="max-w-[560px]">{cat.description}</BodyText>
              {cat.showButton && (
                <Link
                  href={cat.href}
                  className="inline-flex items-center gap-3 lg:gap-[18px] bg-[#fdf567] rounded-full px-4 lg:px-5 py-3 lg:py-[15px] text-[14px] lg:text-[16px] font-semibold leading-[24px] text-black transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
                >
                  Daugiau
                  <ArrowIcon />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Tablet image row — between mobile and desktop */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 mt-8">
          <img src={imgLeft1} alt="" className="w-full aspect-square rounded-[16px] object-cover" />
          <img src={imgRight1} alt="" className="w-full aspect-square rounded-[16px] object-cover" />
        </div>
      </div>
    </section>
  )
}
