import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { DisplayHeading } from './ui/typography'
import { resizeSupabaseImage, STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

const DIALOGAI_IMAGES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/dialogai/1.png`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/dialogai/2.png`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/dialogai/3.png`,
]

const RESTORANAI_IMAGES = [
  `${STORAGE_PUBLIC_BASE}/marketing-assets/dialogai/restoranai-1.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/dialogai/restoranai-2.jpg`,
  `${STORAGE_PUBLIC_BASE}/marketing-assets/dialogai/restoranai-3.jpg`,
]

export interface DialogaiSectionProps {
  images?: string[]
  heading?: string
  body?: string
  buttonLabel?: string
  buttonHref?: string
}

// Non-text defaults for the restoranai/page.tsx variant — translated text is
// resolved there via getTranslations('dialogaiSection') and passed explicitly.
export const RESTORANAI_SECTION_IMAGES = RESTORANAI_IMAGES

export async function DialogaiSection({
  images = DIALOGAI_IMAGES,
  heading: headingProp,
  body: bodyProp,
  buttonLabel: buttonLabelProp,
  buttonHref = '/dialogai',
}: DialogaiSectionProps = {}) {
  const t = await getTranslations('dialogaiSection')
  const heading = headingProp ?? t('dialogaiHeading')
  const body = bodyProp ?? ''
  const buttonLabel = buttonLabelProp ?? t('dialogaiButtonLabel')

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
            {body && (
              <p className="text-[#575757] text-[15px] lg:text-[16px] leading-[24px]">
                {body}
              </p>
            )}
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
