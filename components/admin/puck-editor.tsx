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
            style={{
              fontSize: 13,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              height: 32,
            }}
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
