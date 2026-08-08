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
import { PAGES, SECTION_DEFS, type ContentBlock, type SectionField } from '@/lib/content-sections'

type FieldGroup =
  | { kind: 'row'; fields: SectionField[] }
  | { kind: 'single'; field: SectionField }

// Runs of 2+ consecutive image fields (e.g. PageBanner's 4 slides) render as a
// row instead of stacking full-width — a single image field (e.g. a cover
// photo) stays full-width since a row of one looks identical either way.
function groupFields(fields: SectionField[]): FieldGroup[] {
  const groups: FieldGroup[] = []
  let run: SectionField[] = []

  const flushRun = () => {
    if (run.length > 1) groups.push({ kind: 'row', fields: run })
    else if (run.length === 1) groups.push({ kind: 'single', field: run[0] })
    run = []
  }

  for (const field of fields) {
    if (field.kind === 'image') {
      run.push(field)
    } else {
      flushRun()
      groups.push({ kind: 'single', field })
    }
  }
  flushRun()

  return groups
}

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
                      {groupFields(def.fields).map((group, groupIndex) =>
                        group.kind === 'row' ? (
                          <div key={groupIndex} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {group.fields.map((field) => (
                              <ContentField
                                key={field.key}
                                field={field}
                                value={block.props[field.key]}
                                onChange={(value) => updateProp(index, field.key, value)}
                              />
                            ))}
                          </div>
                        ) : (
                          <ContentField
                            key={group.field.key}
                            field={group.field}
                            value={block.props[group.field.key]}
                            onChange={(value) => updateProp(index, group.field.key, value)}
                          />
                        )
                      )}
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
