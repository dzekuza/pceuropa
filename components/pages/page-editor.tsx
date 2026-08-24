'use client'
// components/pages/page-editor.tsx — Editable sections for a single page
import { useState, useTransition } from 'react'
import { savePageContent } from '@/actions/pages'
import type { PageConfig, PageField } from '@/lib/page-config'
import type { PageContentMap } from '@/types/database'
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageIcon, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

type Locale = 'lt' | 'en'

interface PageEditorProps {
  pageConfig: PageConfig
  initialContentByLocale: Record<Locale, PageContentMap>
}

export function PageEditor({ pageConfig, initialContentByLocale }: PageEditorProps) {
  const [locale, setLocale] = useState<Locale>('lt')
  const [contentByLocale, setContentByLocale] = useState(initialContentByLocale)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [sectionStatus, setSectionStatus] = useState<
    Record<string, 'success' | 'error'>
  >({})
  const [, startTransition] = useTransition()

  const content = contentByLocale[locale]

  function handleChange(sectionKey: string, contentKey: string, value: string) {
    setContentByLocale((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [sectionKey]: { ...(prev[locale][sectionKey] ?? {}), [contentKey]: value },
      },
    }))
    setSectionStatus((prev) => {
      const next = { ...prev }
      delete next[sectionKey]
      return next
    })
  }

  function handleSaveSection(sectionKey: string) {
    setSavingSection(sectionKey)
    const sectionFields = pageConfig.sections.find((s) => s.key === sectionKey)?.fields ?? []
    const updates = sectionFields.map((field) => ({
      section_key: sectionKey,
      content_key: field.key,
      value: content[sectionKey]?.[field.key] ?? '',
    }))

    startTransition(async () => {
      const result = await savePageContent(pageConfig.slug, updates, locale)
      setSectionStatus((prev) => ({
        ...prev,
        [sectionKey]: 'error' in result ? 'error' : 'success',
      }))
      setSavingSection(null)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <TabsList>
          <TabsTrigger value="lt">LT</TabsTrigger>
          <TabsTrigger value="en">EN</TabsTrigger>
        </TabsList>
      </Tabs>

      {pageConfig.sections.map((section) => {
        const isSaving = savingSection === section.key
        const status = sectionStatus[section.key]

        return (
          <Card key={section.key}>
            <CardHeader>
              <CardHeading>
                <CardTitle>{section.title}</CardTitle>
              </CardHeading>
              <CardToolbar>
                {status === 'success' && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Išsaugota
                  </span>
                )}
                {status === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Nepavyko išsaugoti
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => handleSaveSection(section.key)}
                  disabled={isSaving}
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {isSaving ? 'Saugoma...' : 'Išsaugoti'}
                </Button>
              </CardToolbar>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {section.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={content[section.key]?.[field.key] ?? ''}
                  onChange={(value) => handleChange(section.key, field.key, value)}
                />
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface FieldInputProps {
  field: PageField
  value: string
  onChange: (value: string) => void
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={field.key}>
        {field.label}
        {field.type === 'image' && (
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
            (nuotraukos URL)
          </span>
        )}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="resize-y"
        />
      ) : field.type === 'image' ? (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id={field.key}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder ?? 'https://...'}
              className="pl-9"
            />
          </div>
          {value && (
            <div className="relative h-36 w-full overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resizeSupabaseImage(value, { width: 800, height: 288 })}
                alt="Peržiūra"
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <Input
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  )
}
