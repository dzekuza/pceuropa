'use client'

import { Puck } from '@measured/puck'
import '@measured/puck/puck.css'
import { puckConfig } from '@/lib/puck-config'
import type { Data } from '@measured/puck'
import { useRouter } from 'next/navigation'

const PAGES = [
  { slug: 'landing', label: 'Pagrindinis' },
  { slug: 'akcijos', label: 'Akcijos' },
  { slug: 'dialogai', label: 'Dialogai' },
  { slug: 'restoranai', label: 'Restoranai' },
  { slug: 'parduotuves', label: 'Parduotuvės' },
  { slug: 'sportas', label: 'Sportas' },
  { slug: 'laisvalaikis', label: 'Laisvalaikis' },
  { slug: 'darbo-laikas', label: 'Darbo laikas' },
  { slug: 'lankytojams', label: 'Lankytojams' },
]

interface PuckEditorProps {
  data: Data
  pageSlug: string
  previewUrl?: string
}

export function PuckEditor({ data, pageSlug, previewUrl }: PuckEditorProps) {
  const router = useRouter()

  return (
    <Puck
      config={puckConfig}
      data={data}
      iframe={{ enabled: false }}
      onPublish={async (published) => {
        const res = await fetch(`/api/puck/${pageSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(published),
        })

        if (!res.ok) {
          alert('Nepavyko išsaugoti. Bandykite dar kartą.')
          return
        }

        if (previewUrl) router.push(previewUrl)
      }}
      overrides={{
        headerActions: () => (
          <select
            value={pageSlug}
            onChange={(e) => router.push(`/admin/puck/${e.target.value}`)}
            className="text-[13px] px-2 py-1 rounded-md border border-gray-300 bg-white cursor-pointer h-8"
          >
            {PAGES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        ),
      }}
    />
  )
}
