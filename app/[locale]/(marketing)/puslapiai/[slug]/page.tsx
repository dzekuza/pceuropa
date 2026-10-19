import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import sanitizeHtml from 'sanitize-html'
import { getLocale } from 'next-intl/server'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { createClient } from '@/lib/supabase/server'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const supabase = await createClient()
  const { data } = await supabase
    .from('custom_pages')
    .select('title, title_en, content, content_en')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) return {}

  const title = locale === 'en' ? (data.title_en || data.title) : data.title
  const content = locale === 'en' ? (data.content_en || data.content) : data.content
  const description = content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

  return { title: `${title} — PC Europa`, description }
}

export const revalidate = 300

export default async function CustomPage({ params }: Props) {
  const { slug } = await params
  const locale = await getLocale()
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('custom_pages')
    .select('title, title_en, content, content_en, cover_image')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!page) notFound()

  const title = locale === 'en' ? (page.title_en || page.title) : page.title
  const content = locale === 'en' ? (page.content_en || page.content) : page.content

  const safeHtml = sanitizeHtml(content ?? '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'style', 'data-align'],
    },
    allowedStyles: {
      img: { width: [/^\d+(\.\d+)?(px|%)$/] },
    },
  })

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <article className="flex-1 w-full max-w-[800px] mx-auto px-4 lg:px-4 py-10">
        {page.cover_image && (
          <div className="relative aspect-[2/1] h-auto md:aspect-auto md:h-[340px] lg:h-[460px] w-full overflow-hidden rounded-[20px] md:rounded-[32px] lg:rounded-[40px] mb-8">
            <Image
              src={resizeSupabaseImage(page.cover_image, { width: 1600, height: 920, quality: 90 })}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-gray-900">{title}</h1>
        <div
          className="prose prose-lg max-w-none article-content"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      <Footer />
    </main>
  )
}
