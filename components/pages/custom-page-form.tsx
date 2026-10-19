'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextField } from '@/components/admin/rich-text-field'
import { RichContentEditor } from '@/components/admin/rich-content-editor'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { createCustomPage, updateCustomPage } from '@/actions/custom-pages'
import { customPageFormSchema, type CustomPageFormValues } from '@/lib/validations/custom-page'
import { slugify } from '@/lib/slugify'
import { CUSTOM_PAGES_STRINGS } from '@/lib/strings'
import type { CustomPage } from '@/types/database'

interface CustomPageFormProps {
  page?: CustomPage
}

export function CustomPageForm({ page }: CustomPageFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomPageFormValues>({
    resolver: zodResolver(customPageFormSchema) as Resolver<CustomPageFormValues>,
    defaultValues: {
      title: page?.title ?? '',
      slug: page?.slug ?? '',
      content: page?.content ?? '',
      title_en: page?.title_en ?? '',
      content_en: page?.content_en ?? '',
      cover_image: page?.cover_image ?? null,
      published: page?.published ?? false,
    },
  })

  const title = watch('title')

  // Auto-generate slug from title only when creating a new page
  useEffect(() => {
    if (!page && title) {
      setValue('slug', slugify(title))
    }
  }, [title, page, setValue])

  function onSave(published: boolean) {
    setValue('published', published)
    setSaveError(null)
    handleSubmit((data) => {
      startTransition(async () => {
        const payload = { ...data, published }
        const result = page
          ? await updateCustomPage(page.id, payload)
          : await createCustomPage(payload)
        if ('error' in result) {
          setSaveError(result.error)
          return
        }
        router.push('/admin/pages')
      })
    })()
  }

  return (
    <div className="flex flex-col gap-0 min-h-screen -mx-4 -mt-4 -mb-20 md:-mb-4">
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/pages')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          {...register('title')}
          placeholder={CUSTOM_PAGES_STRINGS.titlePlaceholder}
          className="flex-1 text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onSave(false)}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : CUSTOM_PAGES_STRINGS.saveDraft}
        </Button>
        <Button size="sm" disabled={isPending} onClick={() => onSave(true)} type="button">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : CUSTOM_PAGES_STRINGS.publish}
        </Button>
      </div>

      <div className="flex flex-1 flex-col md:flex-row gap-0">
        <div className="flex-1 flex flex-col">
          {(saveError || errors.title) && (
            <div className="border-b px-6 py-3">
              <p className="text-sm text-destructive">{saveError ?? errors.title?.message}</p>
            </div>
          )}

          <Tabs defaultValue="lt" className="flex-1 flex flex-col gap-0">
            <div className="border-b px-6 py-2">
              <TabsList>
                <TabsTrigger value="lt">{CUSTOM_PAGES_STRINGS.tabLt}</TabsTrigger>
                <TabsTrigger value="en">{CUSTOM_PAGES_STRINGS.tabEn}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="lt" className="flex-1 flex flex-col mt-0">
              <RichContentEditor
                initialContent={page?.content ?? ''}
                onChange={(html) => setValue('content', html)}
                placeholder={CUSTOM_PAGES_STRINGS.editorPlaceholder}
                uploadFolder="pages"
                onUploadError={(error) => {
                  console.error('Custom page image upload error:', error)
                  setSaveError(CUSTOM_PAGES_STRINGS.errorUpload)
                }}
              />
            </TabsContent>

            <TabsContent value="en" className="flex-1 flex flex-col gap-4 px-6 py-4 mt-0">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {CUSTOM_PAGES_STRINGS.titleEnLabel}
                </Label>
                <Input {...register('title_en')} placeholder={CUSTOM_PAGES_STRINGS.titleEnPlaceholder} />
              </div>
              <RichTextField
                label={CUSTOM_PAGES_STRINGS.contentEnLabel}
                value={watch('content_en') ?? ''}
                onChange={(value) => setValue('content_en', value)}
              />
            </TabsContent>
          </Tabs>
        </div>

        <aside className="w-full md:w-72 border-t md:border-t-0 md:border-l px-4 py-4 flex flex-col gap-5">
          <ImageUploadField
            label={CUSTOM_PAGES_STRINGS.coverLabel}
            value={watch('cover_image') ?? ''}
            onChange={(url) => setValue('cover_image', url || null)}
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">{CUSTOM_PAGES_STRINGS.slugLabel}</Label>
            <Input id="slug" {...register('slug')} />
            <p className="text-xs text-muted-foreground">
              {CUSTOM_PAGES_STRINGS.slugHint}
              {watch('slug')}
            </p>
            {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
          </div>

          <div>
            {watch('published') ? (
              <Badge variant="default">{CUSTOM_PAGES_STRINGS.statusPublished}</Badge>
            ) : (
              <Badge variant="secondary">{CUSTOM_PAGES_STRINGS.statusDraft}</Badge>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
