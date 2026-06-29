import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import DOMPurify from 'isomorphic-dompurify'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('title, content')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) return {}

  const description = data.content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

  return { title: `${data.title} — PC Europa`, description }
}

export const dynamic = 'force-dynamic'

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!article) notFound()

  const safeHtml = DOMPurify.sanitize(article.content ?? '')

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

      {article.cover_image && (
        <div className="w-full max-h-80 overflow-hidden relative h-80">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <article className="w-full max-w-[800px] mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-4">
          {article.category && (
            <Badge variant="outline">{article.category}</Badge>
          )}
          {date && <span className="text-sm text-muted-foreground">{date}</span>}
        </div>
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>

      <Footer />
    </main>
  )
}
