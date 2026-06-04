const IMAGES = [
  'https://www.figma.com/api/mcp/asset/ebfc79f4-21df-494c-a7e6-87244ff1711a',
  'https://www.figma.com/api/mcp/asset/07cf08c4-5eab-4cae-b2d5-354c817b1f8b',
  'https://www.figma.com/api/mcp/asset/c67b40b4-07e6-47f9-a304-5b3208a678e9',
]

export function DialogaiSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1332px] mx-auto px-4 py-16 lg:py-[104px] flex flex-col lg:flex-row items-center gap-10 lg:gap-10">
        {/* Photos */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {IMAGES.map((src, i) => (
            <div key={i} className="h-[220px] lg:h-[344px] w-[120px] lg:w-[200px] rounded-[20px] lg:rounded-[24px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-8 lg:max-w-[648px]">
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[32px] md:text-[40px] lg:text-[48px] leading-[1.1] tracking-[-2px] lg:tracking-[-2.5px] text-black">
              Dialogai – atraskite vietas, kur norisi sugrįžti
            </h2>
            <p className="text-[#575757] text-[15px] lg:text-[16px] leading-[24px]">
              Lorem ipsum dolor sit amet consectetur. Condimentum ullamcorper scelerisque
              pellentesque et amet ut nisl ipsum cursus. Ac amet non facilisi malesuada
              consequat enim interdum imperdiet. Velit faucibus diam sit in vitae.
            </p>
          </div>
          <button className="self-start bg-black text-white text-[16px] lg:text-[18px] font-medium leading-[24px] rounded-full px-7 py-4 hover:opacity-80 active:scale-[0.97] transition-[opacity,transform] duration-150">
            Dialogai
          </button>
        </div>
      </div>
    </section>
  )
}
