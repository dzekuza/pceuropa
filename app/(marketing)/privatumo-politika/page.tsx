import type { Metadata } from 'next'
import { Shield, Cookie } from 'lucide-react'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PRIVATUMO_POLITIKA_STRINGS } from '@/lib/strings'

export const metadata: Metadata = {
  title: PRIVATUMO_POLITIKA_STRINGS.pageTitle,
  description: PRIVATUMO_POLITIKA_STRINGS.pageDescription,
}

const DOCUMENT_ICONS = [Shield, Cookie]

export default function PrivatumoPoliitkaPage() {
  const s = PRIVATUMO_POLITIKA_STRINGS

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <div className="w-full max-w-[1332px] mx-auto px-4 py-10 md:py-14">
        <h1 className="font-bold text-[36px] md:text-[48px] leading-tight text-black mb-10">
          {s.heading}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {s.documents.map((doc, index) => {
            const Icon = DOCUMENT_ICONS[index]
            const isLight = doc.variant === 'light'

            return (
              <a
                key={doc.href + index}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between h-[300px] rounded-2xl p-8 transition-transform hover:-translate-y-1 ${
                  isLight ? 'bg-[#efe9e2] text-black' : 'bg-[#8b8378] text-[#f7f7f5]'
                }`}
              >
                <span className="font-bold text-[22px] leading-tight whitespace-pre-line">
                  {doc.title}
                </span>
                <Icon
                  className={`self-end size-16 ${isLight ? 'text-[#8b8378]' : 'text-[#f7f7f5]/90'}`}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            )
          })}
        </div>
      </div>

      <Footer />
    </main>
  )
}
