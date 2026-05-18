import Link from 'next/link'
import { DisplayHeading, BodyText } from './ui/typography'

const coffeeImg = 'https://www.figma.com/api/mcp/asset/61e78c46-03bf-4bd5-a8ce-e26043e69289'
const sportsAd1 = 'https://www.figma.com/api/mcp/asset/87a702c6-eb2d-439c-8d59-d0cf62c79ba0'
const sportsAd2 = 'https://www.figma.com/api/mcp/asset/1846be44-c3b0-45e5-a0bc-5add0fcb6506'
const sportsAd3 = 'https://www.figma.com/api/mcp/asset/2c08ca71-cb53-43d1-b48f-e65027dd1443'
const petImg = 'https://www.figma.com/api/mcp/asset/bd0f535d-6601-493c-8c3a-8987ba44ca79'

export function ActivitiesSection() {
  return (
    <section className="flex flex-col gap-4 md:gap-5 px-4 md:px-6 lg:px-[55px] w-full max-w-[1410px] mx-auto py-6 md:py-8 lg:py-12">
      {/* Leisure card */}
      <div className="bg-[rgba(231,14,127,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 p-6 md:p-10 lg:p-[50px] rounded-[20px] lg:rounded-[24px]">
        <div className="flex flex-col justify-between gap-6 lg:gap-0 lg:h-[379px] w-full md:max-w-[60%] lg:max-w-[710px]">
          <div className="flex flex-col gap-3 lg:gap-4">
            <span className="inline-flex items-center bg-black/10 rounded-full px-3 py-[5px] text-[14px] lg:text-[16px] font-medium text-black w-fit">
              Laisvalaikis ir pramogos
            </span>
            <DisplayHeading className="max-w-full lg:w-[679px]">
              Vieta ne tik apsipirkti, bet ir praleisti laiką – poilsis, susitikimai ir įspūdžiai.
            </DisplayHeading>
          </div>
          <Link
            href="/laisvalaikis"
            className="inline-flex items-center bg-black text-white rounded-full px-5 py-3 lg:py-[15px] text-[14px] lg:text-[16px] font-medium w-fit transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
          >
            Visos veiklos
          </Link>
        </div>
        <img
          src={coffeeImg}
          alt="Laisvalaikis PC Europa"
          className="w-full md:w-[280px] lg:w-[425px] md:h-[280px] lg:h-[379px] rounded-[12px] object-cover shrink-0"
        />
      </div>

      {/* Bottom two cards */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
        {/* Sports card */}
        <div className="bg-black flex flex-col justify-between py-5 lg:py-6 rounded-[20px] lg:w-[650px] shrink-0 overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-4 md:gap-0 px-5 lg:px-6">
            <h3 className="font-bold text-[22px] md:text-[26px] lg:text-[32px] leading-[1.3] lg:leading-[40px] tracking-[-0.5px] lg:tracking-[-1.5px] text-white lg:w-[315px]">
              Sportuok ir prižiūrėk savo kūną PC Europoje
            </h3>
            <Link
              href="/sportas"
              className="bg-[#b4e5ff] text-black rounded-full px-4 py-3 text-[13px] lg:text-[16px] font-medium leading-[24px] whitespace-nowrap transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97] shrink-0"
            >
              Sportas / Sveikatingumas
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 lg:gap-3 px-5 lg:px-6 mt-4 lg:mt-0 h-[180px] md:h-[220px] lg:h-[299px]">
            <img src={sportsAd1} alt="" className="w-1/4 h-1/2 rounded-[6px] object-cover shrink-0" />
            <img src={sportsAd2} alt="" className="flex-1 h-full rounded-[9px] object-cover" />
            <img src={sportsAd3} alt="" className="w-1/4 h-1/2 rounded-[6px] object-cover shrink-0" />
          </div>
        </div>

        {/* Pets card */}
        <div className="bg-[#ffe8dc] flex flex-col lg:flex-1 overflow-hidden p-6 md:p-8 lg:p-[50px] relative rounded-[20px] min-h-[300px] lg:min-h-0 lg:h-[480px]">
          <div className="flex flex-col gap-3 lg:gap-4 w-full lg:w-[530px]">
            <DisplayHeading className="lg:w-[530px]">
              PC EUROPA<br />draugiška augintiniams
            </DisplayHeading>
            <BodyText className="md:w-[320px] lg:w-[378px]">
              Jūsų augintiniai - mūsų draugai. Kviečiame atvykti į PC Europa su savo mažaisiais draugais.
            </BodyText>
          </div>
          <Link
            href="/augintiniai"
            className="inline-flex items-center bg-black text-white rounded-full px-5 py-3 lg:py-[15px] text-[14px] lg:text-[16px] font-medium w-fit mt-6 lg:mt-auto transition-[transform,opacity] duration-150 hover:opacity-80 active:scale-[0.97]"
          >
            Sužinokite daugiau
          </Link>
          <img
            src={petImg}
            alt=""
            className="hidden md:block absolute right-0 bottom-0 w-[40%] lg:w-[360px] lg:h-[360px] object-cover"
          />
        </div>
      </div>
    </section>
  )
}
