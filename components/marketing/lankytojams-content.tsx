import { getTranslations } from 'next-intl/server'

export type FaqItem = { question: string; answer: string }

type LankytojamsContentProps = {
  heading?: string
  parkingTitle?: string
  parkingBody?: string
  accessTitle?: string
  accessPublicTransport?: string
  accessByCar?: string
  amenitiesTitle?: string
  amenities?: string[]
  faqTitle?: string
  faqItems?: FaqItem[]
}

export async function LankytojamsContent({
  heading: headingProp,
  parkingTitle: parkingTitleProp,
  parkingBody: parkingBodyProp,
  accessTitle: accessTitleProp,
  accessPublicTransport: accessPublicTransportProp,
  accessByCar: accessByCarProp,
  amenitiesTitle: amenitiesTitleProp,
  amenities: amenitiesProp,
  faqTitle: faqTitleProp,
  faqItems: faqItemsProp,
}: LankytojamsContentProps) {
  const t = await getTranslations('lankytojams')

  const heading = headingProp ?? t('heading')
  const parkingTitle = parkingTitleProp ?? t('parkingTitle')
  const parkingBody = parkingBodyProp ?? t('parkingBody')
  const accessTitle = accessTitleProp ?? t('accessTitle')
  const accessPublicTransport = accessPublicTransportProp ?? t('accessPublicTransport')
  const accessByCar = accessByCarProp ?? t('accessByCar')
  const amenitiesTitle = amenitiesTitleProp ?? t('amenitiesTitle')
  const amenities = amenitiesProp ?? (t.raw('amenities') as string[])
  const faqTitle = faqTitleProp ?? t('faqTitle')
  const faqItems = faqItemsProp ?? (t.raw('faqItems') as FaqItem[])

  return (
    <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14 flex flex-col gap-12">
      <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black">
        {heading}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Parking */}
        <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
          <h2 className="font-bold text-[22px] text-black">{parkingTitle}</h2>
          <p className="text-[#575757] leading-relaxed whitespace-pre-line">{parkingBody}</p>
        </section>

        {/* Amenities */}
        <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
          <h2 className="font-bold text-[22px] text-black">{amenitiesTitle}</h2>
          <ul className="flex flex-col gap-2">
            {amenities.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[#575757]">
                <span className="size-2 rounded-full bg-black shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* How to get here */}
      <section className="bg-white rounded-[24px] p-8 flex flex-col gap-4">
        <h2 className="font-bold text-[22px] text-black">{accessTitle}</h2>
        <p className="text-[#575757] leading-relaxed whitespace-pre-line">{accessPublicTransport}</p>
        <p className="text-[#575757] leading-relaxed whitespace-pre-line">{accessByCar}</p>
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-6">
        <h2 className="font-bold text-[28px] text-black">{faqTitle}</h2>
        <div className="flex flex-col gap-4">
          {faqItems.map((item) => (
            <div key={item.question} className="bg-white rounded-[24px] p-8 flex flex-col gap-3">
              <p className="font-bold text-[18px] text-black">{item.question}</p>
              <p className="text-[#575757] leading-relaxed whitespace-pre-line">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
