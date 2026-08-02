import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import sanitizeHtml from 'sanitize-html'
import { and, eq } from 'drizzle-orm'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { db } from '@/lib/db'
import { articles } from '@/drizzle/schema'
import { resizeImage } from '@/lib/storage/resize-image'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [data] = await db
    .select({ title: articles.title, content: articles.content })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)))
    .limit(1)

  if (!data) return {}

  const description = data.content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

  return { title: `${data.title} — PC Europa`, description }
}

export const revalidate = 300

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params

  const [article] = await db
    .select({
      title: articles.title,
      content: articles.content,
      cover_image: articles.coverImage,
      category: articles.category,
      published_at: articles.publishedAt,
    })
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)))
    .limit(1)

  if (!article) notFound()

  const safeHtml = sanitizeHtml(article.content ?? '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt'],
    },
  })

  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />

      <article className="flex-1 w-full max-w-[800px] mx-auto px-4 lg:px-4 py-10">
        {article.cover_image && (
          <div className="relative h-[240px] md:h-[340px] lg:h-[460px] w-full overflow-hidden rounded-[20px] md:rounded-[32px] lg:rounded-[40px] mb-8">
            <Image
              src={resizeImage(article.cover_image, { width: 1600, height: 920, quality: 90 })}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          {article.category && (
            <span className="text-xs font-medium border border-black/20 rounded-full px-2 py-0.5 text-[#575757]">
              {article.category}
            </span>
          )}
          {date && <span className="text-sm text-[#888]">{date}</span>}
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900">{article.title}</h1>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      <Footer />
    </main>
  )
}
