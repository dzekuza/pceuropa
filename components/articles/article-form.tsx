'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  ChevronLeft,
  Loader2,
} from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      TiptapImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: ARTICLES_STRINGS.editorPlaceholder }),
    ],
    content: article?.content ?? '',
    onUpdate: ({ editor }) => {
      setValue('content', editor.getHTML())
    },
  })

  async function uploadCoverImage(file: File) {
    setUploadingCover(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `articles/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('marketing-assets')
      .upload(path, file)
    if (error) {
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
          return
        }
        router.push('/admin/articles')
      })
    })()
  }

  function addLink() {
    const url = window.prompt('URL:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => editor?.chain().focus().toggleBold().run(),
      active: editor?.isActive('bold'),
    },
    {
      icon: Italic,
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: editor?.isActive('italic'),
    },
    {
      icon: Heading2,
      action: () =>
        editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor?.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      action: () =>
        editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor?.isActive('heading', { level: 3 }),
    },
    {
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: editor?.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      active: editor?.isActive('orderedList'),
    },
    {
      icon: Quote,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      active: editor?.isActive('blockquote'),
    },
  ]

  return (
    <div className="flex flex-col gap-0 min-h-screen">
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
          {/* Tiptap toolbar */}
          <div className="border-b px-6 py-2 flex items-center gap-1 flex-wrap">
            {toolbarButtons.map(({ icon: Icon, action, active }, i) => (
              <Button
                key={i}
                variant={active ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={action}
                type="button"
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={addLink}
              type="button"
            >
              <Link2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Tiptap editor */}
          <div className="flex-1 px-6 py-4">
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
            />
          </div>
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
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md cursor-pointer text-muted-foreground hover:bg-muted/40 transition-colors">
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

          {/* Slug */}
          <div className="flex flex-col gap-2">
            <Label>{ARTICLES_STRINGS.slugLabel}</Label>
            <Input {...register('slug')} />
            {errors.slug && (
              <p className="text-destructive text-xs">{errors.slug.message}</p>
            )}
          </div>

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
