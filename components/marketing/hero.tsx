const heroImageUrl = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/hero-bg.jpg'

export function Hero() {
  return (
    <div className="relative h-[260px] md:h-[340px] lg:h-[460px] w-full overflow-hidden md:rounded-b-[16px]">
      <img
        src={heroImageUrl}
        alt="PC Europa"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Slider indicator — desktop only */}
      <div className="hidden lg:flex absolute left-[71px] top-1/2 -translate-y-1/2 flex-col gap-2 w-[14px]">
        <div className="bg-[rgba(181,181,181,0.3)] border border-[#d9d9d9] h-[14px] rounded-[16px] w-full" />
        <div className="bg-[#fdf567] border border-white h-[97px] rounded-[16px] w-full" />
        <div className="bg-[rgba(181,181,181,0.3)] border border-[#d9d9d9] h-[14px] rounded-[16px] w-full" />
        <div className="bg-[rgba(181,181,181,0.3)] border border-[#d9d9d9] h-[14px] rounded-[16px] w-full" />
      </div>

      {/* Mobile dots indicator */}
      <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`rounded-full transition-[width,background-color] duration-200 ${i === 1 ? 'w-6 h-2 bg-[#fdf567]' : 'w-2 h-2 bg-white/50'}`}
            style={{ transitionTimingFunction: 'var(--ease-out)' }}
          />
        ))}
      </div>
    </div>
  )
}
