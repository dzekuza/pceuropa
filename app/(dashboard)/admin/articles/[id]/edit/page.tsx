// app/(dashboard)/admin/articles/[id]/edit/page.tsx — Edit article editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { articles } from '@/drizzle/schema'
import { ArticleForm } from '@/components/articles/article-form'
import type { Article } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') redirect('/login')

  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1)

  if (!row) notFound()

  const article: Article = {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    cover_image: row.coverImage,
    category: row.category as Article['category'],
    featured: row.featured,
    published: row.published,
    published_at: row.publishedAt ? row.publishedAt.toISOString() : null,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  }

  return <ArticleForm article={article} />
}
