const imgGiven = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/partner-given.png'
const imgGeraDovana = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/partner-gera-dovana.png'
const imgLemonGym = 'https://hfnsbhovdjqnfzjpugwa.supabase.co/storage/v1/object/public/marketing-assets/partner-lemon-gym.png'

const LOGOS = [
  { key: 'given-1',     content: <img src={imgGiven} alt="GIVEN" style={{ width: 95.5, height: 17.9 }} /> },
  { key: 'gera-1',      content: <div style={{ width: 127, height: 28, overflow: 'hidden' }}><img src={imgGeraDovana} alt="Gera dovana" className="w-full h-full object-contain" /></div> },
  { key: 'lemon',       content: <div style={{ width: 86, height: 86, overflow: 'hidden' }}><img src={imgLemonGym} alt="Lemon Gym" className="w-full h-full object-contain" /></div> },
  { key: 'gera-2',      content: <div style={{ width: 127, height: 28, overflow: 'hidden' }}><img src={imgGeraDovana} alt="Gera dovana" className="w-full h-full object-contain" /></div> },
  { key: 'given-2',     content: <img src={imgGiven} alt="GIVEN" style={{ width: 95.5, height: 17.9 }} /> },
]

function MobileCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f9f9f9] rounded-[16px] flex items-center justify-center h-[120px] w-[160px] shrink-0 overflow-hidden">
      {children}
    </div>
  )
}

function DesktopCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f9f9f9] relative rounded-[20px] flex items-center justify-center h-[220px] overflow-hidden flex-1 min-w-0">
      {children}
    </div>
  )
}

export function PartnerLogos() {
  return (
    <section className="w-full max-w-[1300px] mx-auto px-4 lg:px-0 py-6 md:py-8 lg:py-12">
      {/* Mobile / tablet: auto-scroll marquee */}
      <div className="lg:hidden overflow-hidden w-full">
        <div
          className="marquee-track flex gap-3 hover:[animation-play-state:paused]"
          style={{ animation: 'marquee 18s linear infinite', width: 'max-content' }}
        >
          {/* duplicate for seamless loop */}
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <MobileCard key={`${logo.key}-${i}`}>{logo.content}</MobileCard>
          ))}
        </div>
      </div>

      {/* Desktop: static row */}
      <div className="hidden lg:flex gap-3">
        {LOGOS.map((logo) => (
          <DesktopCard key={logo.key}>{logo.content}</DesktopCard>
        ))}
      </div>
    </section>
  )
}
