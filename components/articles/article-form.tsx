'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Image as ImageIcon, ChevronLeft, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextField } from '@/components/admin/rich-text-field'
import { RichContentEditor } from '@/components/admin/rich-content-editor'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'
import { createArticle, updateArticle } from '@/actions/articles'
import {
  articleFormSchema,
  ARTICLE_CATEGORIES,
  type ArticleFormValues,
} from '@/lib/validations/article'
import { slugify } from '@/lib/slugify'
import { ARTICLES_STRINGS } from '@/lib/strings'
import type { Article } from '@/types/database'

interface ArticleFormProps {
  article?: Article
}

export function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [coverPreview, setCoverPreview] = useState<string | null>(
    article?.cover_image ?? null
  )
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema) as Resolver<ArticleFormValues>,
    defaultValues: {
      title: article?.title ?? '',
      slug: article?.slug ?? '',
      content: article?.content ?? '',
      title_en: article?.title_en ?? '',
      content_en: article?.content_en ?? '',
      cover_image: article?.cover_image ?? null,
      category: article?.category ?? 'Naujiena',
      featured: article?.featured ?? false,
      published: article?.published ?? false,
    },
  })

  const title = watch('title')

  // Auto-generate slug from title only when creating a new article
  useEffect(() => {
    if (!article && title) {
      setValue('slug', slugify(title))
    }
  }, [title, article, setValue])

  async function uploadCoverImage(file: File) {
    setUploadingCover(true)
    setSaveError(null)
    const compressed = await compressImageFile(file)
    const supabase = createClient()
    const path = `articles/${Date.now()}.${imageExtension(compressed)}`
    const { error } = await supabase.storage
      .from('marketing-assets')
      .upload(path, compressed, { contentType: compressed.type })
    if (error) {
      console.error('Article cover image upload error:', error)
      setSaveError(ARTICLES_STRINGS.errorUpload)
      setUploadingCover(false)
      return
    }
    const { data } = supabase.storage
      .from('marketing-assets')
      .getPublicUrl(path)
    setValue('cover_image', data.publicUrl)
    setCoverPreview(data.publicUrl)
    setUploadingCover(false)
  }

  function onSave(published: boolean) {
    setValue('published', published)
    setSaveError(null)
    handleSubmit((data) => {
      startTransition(async () => {
        const payload = { ...data, published }
        let result
        if (article) {
          result = await updateArticle(article.id, payload, article.published)
        } else {
          result = await createArticle(payload)
        }
        if ('error' in result) {
          console.error(result.error)
          setSaveError(ARTICLES_STRINGS.errorSave)
          return
        }
        router.push('/admin/articles')
      })
    })()
  }

  return (
    <div className="flex flex-col gap-0 min-h-screen -mx-4 -mt-4 -mb-20 md:-mb-4">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/articles')}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          {...register('title')}
          placeholder={ARTICLES_STRINGS.titlePlaceholder}
          className="flex-1 text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onSave(false)}
          type="button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            ARTICLES_STRINGS.saveDraft
          )}
        </Button>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => onSave(true)}
          type="button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            ARTICLES_STRINGS.publish
          )}
        </Button>
      </div>

      <div className="flex flex-1 gap-0">
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          {saveError && (
            <div className="border-b px-6 py-3">
              <p className="text-sm text-destructive">{saveError}</p>
            </div>
          )}

          <Tabs defaultValue="lt" className="flex-1 flex flex-col gap-0">
            <div className="border-b px-6 py-2">
              <TabsList>
                <TabsTrigger value="lt">{ARTICLES_STRINGS.tabLt}</TabsTrigger>
                <TabsTrigger value="en">{ARTICLES_STRINGS.tabEn}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="lt" className="flex-1 flex flex-col mt-0">
              <RichContentEditor
                initialContent={article?.content ?? ''}
                onChange={(html) => setValue('content', html)}
                placeholder={ARTICLES_STRINGS.editorPlaceholder}
                uploadFolder="articles"
                onUploadError={(error) => {
                  console.error('Article content image upload error:', error)
                  setSaveError(ARTICLES_STRINGS.errorUpload)
                }}
              />
            </TabsContent>

            <TabsContent value="en" className="flex-1 flex flex-col gap-4 px-6 py-4 mt-0">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  {ARTICLES_STRINGS.titleEnLabel}
                </Label>
                <Input
                  {...register('title_en')}
                  placeholder={ARTICLES_STRINGS.titleEnPlaceholder}
                />
              </div>
              <RichTextField
                label={ARTICLES_STRINGS.contentEnLabel}
                value={watch('content_en') ?? ''}
                onChange={(value) => setValue('content_en', value)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="w-72 border-l px-4 py-4 flex flex-col gap-5">
          {/* Cover image */}
          <div className="flex flex-col gap-2">
            <Label>{ARTICLES_STRINGS.coverLabel}</Label>
            {coverPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreview}
                  alt=""
                  className="w-full h-32 object-cover rounded-md"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-1 right-1 h-6 text-xs"
                  onClick={() => {
                    setCoverPreview(null)
                    setValue('cover_image', null)
                  }}
                  type="button"
                >
                  {ARTICLES_STRINGS.removeCover}
                </Button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer text-muted-foreground transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/40'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f && f.type.startsWith('image/')) uploadCoverImage(f)
                }}
              >
                {uploadingCover ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{ARTICLES_STRINGS.uploadCover}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) uploadCoverImage(f)
                  }}
                />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label>{ARTICLES_STRINGS.categoryLabel}</Label>
            <Select
              defaultValue={article?.category ?? 'Naujiena'}
              onValueChange={(v) =>
                setValue('category', v as ArticleFormValues['category'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARTICLE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errors.slug && (
            <p className="text-destructive text-xs">{errors.slug.message}</p>
          )}

          {/* Featured */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={watch('featured')}
              onCheckedChange={(v) => setValue('featured', Boolean(v))}
            />
            <Label htmlFor="featured">{ARTICLES_STRINGS.featuredLabel}</Label>
          </div>

          {/* Published status badge */}
          <div className="text-sm text-muted-foreground">
            {watch('published') ? (
              <Badge variant="default">{ARTICLES_STRINGS.statusPublished}</Badge>
            ) : (
              <Badge variant="secondary">{ARTICLES_STRINGS.statusDraft}</Badge>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
