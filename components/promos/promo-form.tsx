'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'
import { createPromo, updatePromo } from '@/actions/promos'
import {
  promoFormSchema,
  PROMO_CATEGORIES,
  type PromoFormValues,
} from '@/lib/validations/promo'
import { slugify } from '@/lib/slugify'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import type { Promo } from '@/types/database'

const CATEGORY_LABEL: Record<(typeof PROMO_CATEGORIES)[number], string> = {
  stores: ADMIN_PROMOS_STRINGS.categoryStores,
  services: ADMIN_PROMOS_STRINGS.categoryServices,
  food: ADMIN_PROMOS_STRINGS.categoryFood,
}

interface PromoFormProps {
  promo?: Promo
}

export function PromoForm({ promo }: PromoFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(
    promo?.image ?? null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PromoFormValues>({
    resolver: zodResolver(promoFormSchema) as Resolver<PromoFormValues>,
    defaultValues: {
      title: promo?.title ?? '',
      slug: promo?.slug ?? '',
      image: promo?.image ?? null,
      starts_at: promo?.starts_at ?? '',
      ends_at: promo?.ends_at ?? '',
      category: promo?.category ?? 'stores',
      published: promo?.published ?? false,
    },
  })

  const title = watch('title')

  // Auto-generate slug from title only when creating a new promo
  useEffect(() => {
    if (!promo && title) {
      setValue('slug', slugify(title))
    }
  }, [title, promo, setValue])

  async function uploadImage(file: File) {
    setUploadingImage(true)
    const compressed = await compressImageFile(file)
    const supabase = createClient()
    const path = `akcijos/${Date.now()}.${imageExtension(compressed)}`
    const { error } = await supabase.storage
      .from('marketing-assets')
      .upload(path, compressed, { contentType: compressed.type })
    if (error) {
      setUploadingImage(false)
      return
    }
    const { data } = supabase.storage
      .from('marketing-assets')
      .getPublicUrl(path)
    setValue('image', data.publicUrl)
    setImagePreview(data.publicUrl)
    setUploadingImage(false)
  }

  function onSave(published: boolean) {
    setValue('published', published)
    setSaveError(null)
    handleSubmit(
      (data) => {
        startTransition(async () => {
          const payload = { ...data, published }
          const result = promo
            ? await updatePromo(promo.id, payload)
            : await createPromo(payload)
          if ('error' in result) {
            setSaveError(result.error)
            return
          }
          router.push('/admin/articles?tab=akcijos')
        })
      },
      () => setSaveError(ADMIN_PROMOS_STRINGS.errorSave)
    )()
  }

  return (
    <div className="flex flex-col gap-0 min-h-screen -mx-4 -mt-4 -mb-20 md:-mb-4">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/articles?tab=akcijos')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          {...register('title')}
          placeholder={ADMIN_PROMOS_STRINGS.titlePlaceholder}
          className="flex-1 text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onSave(false)}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : ADMIN_PROMOS_STRINGS.saveDraft}
        </Button>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => onSave(true)}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : ADMIN_PROMOS_STRINGS.publish}
        </Button>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Main column */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-5 max-w-xl">
          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
          )}

          <div className="flex flex-col gap-2">
            <Label>{ADMIN_PROMOS_STRINGS.slugLabel}</Label>
            <Input {...register('slug')} />
            {errors.slug && (
              <p className="text-destructive text-xs">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label>{ADMIN_PROMOS_STRINGS.startsAtLabel}</Label>
              <Input type="date" {...register('starts_at')} />
              {errors.starts_at && (
                <p className="text-destructive text-xs">{errors.starts_at.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label>{ADMIN_PROMOS_STRINGS.endsAtLabel}</Label>
              <Input type="date" {...register('ends_at')} />
              {errors.ends_at && (
                <p className="text-destructive text-xs">{errors.ends_at.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-72 border-l px-4 py-4 flex flex-col gap-5">
          {/* Image */}
          <div className="flex flex-col gap-2">
            <Label>{ADMIN_PROMOS_STRINGS.imageLabel}</Label>
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt=""
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-6 text-xs"
                  onClick={() => {
                    setImagePreview(null)
                    setValue('image', null)
                  }}
                  type="button"
                >
                  {ADMIN_PROMOS_STRINGS.removeImage}
                </Button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer text-muted-foreground transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f && f.type.startsWith('image/')) uploadImage(f)
                }}
              >
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{ADMIN_PROMOS_STRINGS.uploadImage}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadImage(f)
                  }}
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label>{ADMIN_PROMOS_STRINGS.categoryLabel}</Label>
            <Select
              defaultValue={promo?.category ?? 'stores'}
              onValueChange={(v) =>
                setValue('category', v as PromoFormValues['category'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMO_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_LABEL[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Published status badge */}
          <div className="text-sm text-muted-foreground">
            {watch('published') ? (
              <Badge variant="default">{ADMIN_PROMOS_STRINGS.statusPublished}</Badge>
            ) : (
              <Badge variant="secondary">{ADMIN_PROMOS_STRINGS.statusDraft}</Badge>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
