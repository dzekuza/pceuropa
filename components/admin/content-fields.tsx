'use client'

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import type { ArraySubField, SectionField } from '@/lib/content-sections'

interface FieldProps {
  field: SectionField
  value: unknown
  onChange: (value: unknown) => void
}

export function ContentField({ field, value, onChange }: FieldProps) {
  if (field.kind === 'text') {
    return (
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>
        <Input value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
      </div>
    )
  }

  if (field.kind === 'textarea') {
    return (
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>
        <Textarea rows={3} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />
      </div>
    )
  }

  if (field.kind === 'image') {
    return <ImageUploadField label={field.label} value={value as string} onChange={onChange} />
  }

  return (
    <ArrayField
      label={field.label}
      arrayFields={field.arrayFields ?? []}
      defaultItem={field.defaultItem ?? {}}
      itemLabelKey={field.itemLabelKey}
      itemLabelFallback={field.itemLabelFallback ?? 'Elementas'}
      max={field.max}
      value={(value as Record<string, unknown>[]) ?? []}
      onChange={onChange}
    />
  )
}

interface ArrayFieldProps {
  label: string
  arrayFields: ArraySubField[]
  defaultItem: Record<string, string>
  itemLabelKey?: string
  itemLabelFallback: string
  max?: number
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
}

function ArrayField({ label, arrayFields, defaultItem, itemLabelKey, itemLabelFallback, max, value, onChange }: ArrayFieldProps) {
  const items = value ?? []

  const updateItem = (index: number, key: string, itemValue: unknown) => {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: itemValue } : item))
    onChange(next)
  }

  const addItem = () => onChange([...items, { ...defaultItem }])
  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index))
  const moveItem = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {(!max || items.length < max) && (
          <Button type="button" variant="outline" size="xs" onClick={addItem}>
            <Plus /> Pridėti
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                {(itemLabelKey && (item[itemLabelKey] as string)) || itemLabelFallback} #{index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                  <ChevronUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}>
                  <ChevronDown />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeItem(index)}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {arrayFields.map((sub) => (
                <div key={sub.key} className={sub.kind === 'image' ? 'sm:col-span-2' : undefined}>
                  <ContentField
                    field={{ ...sub, kind: sub.kind }}
                    value={item[sub.key]}
                    onChange={(v) => updateItem(index, sub.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-muted-foreground">Nėra elementų.</p>
        )}
      </div>
    </div>
  )
}
