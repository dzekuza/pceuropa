'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ContentField } from '@/components/admin/content-fields'
import { PAGES, SECTION_DEFS, type ContentBlock } from '@/lib/content-sections'

interface ContentEditorProps {
  content: ContentBlock[]
  pageSlug: string
  previewUrl?: string
}

export function ContentEditor({ content, pageSlug, previewUrl }: ContentEditorProps) {
  const router = useRouter()
  const [blocks, setBlocks] = useState(content)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const updateProp = (blockIndex: number, key: string, value: unknown) => {
    setBlocks((prev) =>
      prev.map((block, i) => (i === blockIndex ? { ...block, props: { ...block.props, [key]: value } } : block))
    )
    setDirty(true)
  }

  const handlePublish = async () => {
    setSaving(true)
    const res = await fetch(`/api/puck/${pageSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: blocks, root: { props: {} }, zones: {} }),
    })
    setSaving(false)

    if (!res.ok) {
      toast.error('Nepavyko išsaugoti. Bandykite dar kartą.')
      return
    }

    setDirty(false)
    toast.success('Puslapis paskelbtas')
    if (previewUrl) router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/pages">
              <ArrowLeft />
              Puslapiai
            </Link>
          </Button>
          <select
            value={pageSlug}
            onChange={(e) => router.push(`/admin/content/${e.target.value}`)}
            className="text-sm h-9 px-3 rounded-md border border-input bg-background cursor-pointer"
          >
            {PAGES.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {previewUrl && (
          <Button asChild variant="ghost" size="sm">
            <Link href={previewUrl} target="_blank">
              Peržiūrėti puslapį
            </Link>
          </Button>
        )}
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Šiam puslapiui sekcijų nėra.</p>
      ) : (
        <Accordion type="multiple" defaultValue={blocks.map((_, i) => `block-${i}`)} className="rounded-lg border px-4">
          {blocks.map((block, index) => {
            const def = SECTION_DEFS[block.type]
            if (!def) return null

            return (
              <AccordionItem key={`${block.type}-${index}`} value={`block-${index}`}>
                <AccordionTrigger>{def.label}</AccordionTrigger>
                <AccordionContent>
                  {def.editable ? (
                    <div className="flex flex-col gap-4">
                      {def.fields.map((field) => (
                        <ContentField
                          key={field.key}
                          field={field}
                          value={block.props[field.key]}
                          onChange={(value) => updateProp(index, field.key, value)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{def.note}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      <div className="sticky bottom-4 z-10 self-end rounded-lg border bg-background/95 backdrop-blur px-4 py-3 shadow-sm">
        <Button onClick={handlePublish} disabled={!dirty || saving}>
          {saving ? 'Skelbiama…' : 'Paskelbti'}
        </Button>
      </div>
    </div>
  )
}
