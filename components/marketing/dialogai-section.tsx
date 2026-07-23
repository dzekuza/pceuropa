import Link from 'next/link'
import { DisplayHeading } from './ui/typography'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

const DIALOGAI_IMAGES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/dialogai/1.png',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/dialogai/2.png',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/dialogai/3.png',
]

const RESTORANAI_IMAGES = [
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/dialogai/restoranai-1.jpg',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/dialogai/restoranai-2.jpg',
  'https://ybyyxcuvxuzrledbitky.supabase.co/storage/v1/object/public/marketing-assets/dialogai/restoranai-3.jpg',
]

export interface DialogaiSectionProps {
  images?: string[]
  heading?: string
  body?: string
  buttonLabel?: string
  buttonHref?: string
}

export const RESTORANAI_SECTION_PROPS: DialogaiSectionProps = {
  images: RESTORANAI_IMAGES,
  heading: 'Ieškote daugiau skonių?',
  body: 'PC Europa rasite didelį restoranų ir kavinių pasirinkimą iš daugumos pasaulio virtuvių. Atraskite savo mėgstamiausias vietas ir sutikime ten.',
  buttonLabel: 'Restoranai / Kavinės',
  buttonHref: '/restoranai',
}

export function DialogaiSection({
  images = DIALOGAI_IMAGES,
  heading = 'Dialogai – atraskite vietas, kur norisi sugrįžti',
  body = 'Lorem ipsum dolor sit amet consectetur. Condimentum ullamcorper scelerisque pellentesque et amet ut nisl ipsum cursus. Ac amet non facilisi malesuada consequat enim interdum imperdiet. Velit faucibus diam sit in vitae.',
  buttonLabel = 'Dialogai',
  buttonHref = '/dialogai',
}: DialogaiSectionProps = {}) {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1332px] mx-auto px-4 py-16 lg:py-[104px] flex flex-col lg:flex-row items-center gap-10 lg:gap-10">
        {/* Photos */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {images.map((src, i) => (
            <div key={i} className="relative h-[220px] lg:h-[344px] w-[120px] lg:w-[200px] rounded-[20px] lg:rounded-[24px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resizeSupabaseImage(src, { width: 400, height: 688, quality: 90 })} alt="" className="size-full object-cover" />
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-8 lg:max-w-[648px]">
          <div className="flex flex-col gap-4">
            <DisplayHeading>{heading}</DisplayHeading>
            <p className="text-[#575757] text-[15px] lg:text-[16px] leading-[24px]">
              {body}
            </p>
          </div>
          <Link
            href={buttonHref}
            prefetch={false}
            className="self-start bg-black text-white text-[16px] lg:text-[18px] font-medium leading-[24px] rounded-full px-7 py-4 hover:opacity-80 active:scale-[0.97] transition-[opacity,transform] duration-150"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
