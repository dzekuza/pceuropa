import type React from 'react'
import { Link } from '@/i18n/navigation'
import { DisplayHeading, BodyText } from './ui/typography'
import { resizeSupabaseImage, STORAGE_PUBLIC_BASE } from '@/lib/utils/supabase-image'

const coffeeImg = `${STORAGE_PUBLIC_BASE}/marketing-assets/activities-coffee.jpg`
const sportsAd1 = `${STORAGE_PUBLIC_BASE}/marketing-assets/activities-sports-1.jpg`
const sportsAd2 = `${STORAGE_PUBLIC_BASE}/marketing-assets/activities-sports-2.jpg`
const sportsAd3 = `${STORAGE_PUBLIC_BASE}/marketing-assets/activities-sports-3.jpg`
const petImg = `${STORAGE_PUBLIC_BASE}/marketing-assets/activities-pet.png`

export interface ActivitiesSectionProps {
  leisureTag?: React.ReactNode
  leisureHeading?: React.ReactNode
  leisureDescription?: React.ReactNode
  leisureImage?: string
  sportsHeading?: React.ReactNode
  sportsImage1?: string
  sportsImage2?: string
  sportsImage3?: string
  petsHeading?: React.ReactNode
  petsDescription?: React.ReactNode
  petImage?: string
}

export function ActivitiesSection({
  leisureTag,
  leisureHeading,
  leisureDescription,
  leisureImage,
  sportsHeading,
  sportsImage1,
  sportsImage2,
  sportsImage3,
  petsHeading,
  petsDescription,
  petImage,
}: ActivitiesSectionProps = {}) {
  return (
    <section className="flex flex-col gap-4 md:gap-5 w-full max-w-[1332px] mx-auto px-4 py-6 md:py-8 lg:py-12">
      {/* Leisure card */}
      <div className="bg-[rgba(231,14,127,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 p-6 md:p-10 lg:p-[50px] rounded-[20px] lg:rounded-[24px]">
        <div className="flex flex-col justify-between gap-6 lg:gap-0 lg:h-[379px] w-full md:max-w-[60%] lg:max-w-[710px]">
          <div className="flex flex-col gap-3 lg:gap-4">
            <span className="inline-flex items-center bg-black/10 rounded-full px-3 py-[5px] text-[14px] lg:text-[16px] font-medium text-black w-fit">
              {leisureTag || 'Laisvalaikis ir pramogos'}
            </span>
            <DisplayHeading className="max-w-full lg:w-[679px]">
              {leisureHeading || 'Vieta ne tik apsipirkti, bet ir praleisti laiką – skoniai, veiklos ir patirtys vienoje vietoje.'}
            </DisplayHeading>
          </div>
          <Link
            href="/laisvalaikis"
            prefetch={false}
            className="inline-flex items-center bg-black text-white rounded-full px-5 py-3 lg:py-[15px] text-[14px] lg:text-[16px] font-medium w-fit transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
          >
            Daugiau
          </Link>
        </div>
        <img
          src={resizeSupabaseImage(leisureImage || coffeeImg, { width: 425, height: 379, quality: 90 })}
          alt="Laisvalaikis PC Europa"
          className="w-full md:w-[280px] lg:w-[425px] md:h-[280px] lg:h-[379px] rounded-[12px] object-cover shrink-0"
        />
      </div>

      {/* Bottom two cards */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-5">
        {/* Sports card */}
        <div className="bg-black flex flex-col justify-between py-5 xl:py-6 rounded-[20px] md:w-[340px] lg:w-[460px] xl:w-[650px] shrink-0 overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4 md:gap-0 px-5 xl:px-6">
            <h3 className="font-bold text-[22px] md:text-[26px] xl:text-[32px] leading-[1.3] xl:leading-[40px] tracking-[-0.5px] xl:tracking-[-1.5px] text-white xl:w-[315px]">
              {sportsHeading || 'Rūpestis savimi prasideda čia'}
            </h3>
            <Link
              href="/sportas"
              prefetch={false}
              className="bg-[#b4e5ff] text-black rounded-full px-4 py-3 text-[13px] xl:text-[16px] font-medium leading-[24px] whitespace-nowrap transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97] shrink-0"
            >
              Sportas / Sveikatingumas
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 xl:gap-3 px-5 xl:px-6 mt-4 xl:mt-0 h-[180px] md:h-[200px] lg:h-[240px] xl:h-[299px]">
            <img src={resizeSupabaseImage(sportsImage1 || sportsAd1, { width: 300, height: 400, quality: 90 })} alt="" className="w-1/4 h-[calc(100%-90px)] my-[45px] aspect-[3/4] rounded-[6px] object-contain shrink-0" />
            <img src={resizeSupabaseImage(sportsImage2 || sportsAd2, { width: 300, height: 400, quality: 90 })} alt="" className="h-full aspect-[3/4] rounded-[9px] object-contain shrink-0" />
            <img src={resizeSupabaseImage(sportsImage3 || sportsAd3, { width: 300, height: 400, quality: 90 })} alt="" className="w-1/4 h-[calc(100%-90px)] my-[45px] aspect-[3/4] rounded-[6px] object-contain shrink-0" />
          </div>
        </div>

        {/* Pets card */}
        <div className="bg-[#ffe8dc] flex flex-col md:flex-1 overflow-hidden p-6 md:p-8 xl:p-[50px] relative rounded-[20px] min-h-[300px] xl:min-h-0 xl:h-[480px]">
          <div className="flex flex-col gap-3 xl:gap-4 w-full xl:max-w-[530px]">
            <DisplayHeading>
              {petsHeading || 'PC EUROPA\ndraugiška augintiniams'}
            </DisplayHeading>
            <BodyText className="md:max-w-[320px] xl:max-w-[378px] text-neutral-600 whitespace-pre-line">
              {petsDescription || 'Jūsų augintiniai – mūsų svečiai. Atvykite į PC Europa kartu su savo mažaisiais draugais, nepamiršdami jų priežiūros ir saugumo.'}
            </BodyText>
          </div>
          <img
            src={resizeSupabaseImage(petImage || petImg, { width: 360, height: 360, quality: 90 })}
            alt=""
            className="hidden md:block absolute right-0 bottom-0 w-[40%] xl:w-[360px] xl:h-[360px] object-cover"
          />
        </div>
      </div>
    </section>
  )
}
