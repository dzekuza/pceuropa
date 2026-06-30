import { DisplayHeading } from './ui/typography'

const IMAGES: (string | null)[] = [null, null, null]

export function DialogaiSection() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-[1332px] mx-auto px-4 py-16 lg:py-[104px] flex flex-col lg:flex-row items-center gap-10 lg:gap-10">
        {/* Photos */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {IMAGES.map((src, i) => (
            <div key={i} className="relative h-[220px] lg:h-[344px] w-[120px] lg:w-[200px] rounded-[20px] lg:rounded-[24px] overflow-hidden">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="size-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-[#e8e8e5]" />
              )}
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="flex flex-col gap-8 lg:max-w-[648px]">
          <div className="flex flex-col gap-4">
            <DisplayHeading>
              Dialogai – atraskite vietas, kur norisi sugrįžti
            </DisplayHeading>
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
