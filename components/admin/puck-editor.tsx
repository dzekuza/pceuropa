'use client'

import { Puck } from '@measured/puck'
import '@measured/puck/puck.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
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
  { slug: 'naujienos', label: 'Naujienos' },
  { slug: 'nuoma-reklama', label: 'Nuoma / Reklama' },
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
          toast.error('Nepavyko išsaugoti. Bandykite dar kartą.')
          return
        }

        toast.success('Puslapis paskelbtas')
        if (previewUrl) router.push(previewUrl)
      }}
      overrides={{
        components: () => <></>,
        headerActions: ({ children }) => (
          <>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[13px] px-2.5 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-8"
            >
              <ArrowLeft className="size-3.5" />
              Skydelis
            </Link>
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
            {children}
          </>
        ),
      }}
    />
  )
}
