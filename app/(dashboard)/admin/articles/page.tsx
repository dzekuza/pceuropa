// app/(dashboard)/admin/articles/page.tsx — Admin articles + akcijos list page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { desc } from 'drizzle-orm'
import { Plus } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { articles as articlesTable, promos as promosTable } from '@/drizzle/schema'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ArticlesTable } from '@/components/articles/articles-table'
import { PromosTable } from '@/components/promos/promos-table'
import { ARTICLES_STRINGS, ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import type { Article, Promo } from '@/types/database'

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { tab } = await searchParams
  const activeTab = tab === 'akcijos' ? 'akcijos' : 'articles'

  const session = await auth()
  const user = session?.user

  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  const [articleRows, promoRows] = await Promise.all([
    db.select().from(articlesTable).orderBy(desc(articlesTable.createdAt)),
    db.select().from(promosTable).orderBy(desc(promosTable.createdAt)),
  ])

  const articles: Article[] = articleRows.map((row) => ({
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
  }))

  const promos: Promo[] = promoRows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    image: row.image,
    starts_at: row.startsAt,
    ends_at: row.endsAt,
    category: row.category as Promo['category'],
    published: row.published,
    content: row.content,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  }))

  return (
    <div className="flex flex-col gap-3">
      <Tabs defaultValue={activeTab}>
        <div className="flex items-start justify-between gap-4">
          <TabsList>
            <TabsTrigger value="articles" asChild>
              <Link href="/admin/articles?tab=articles">{ADMIN_PROMOS_STRINGS.tabArticles}</Link>
            </TabsTrigger>
            <TabsTrigger value="akcijos" asChild>
              <Link href="/admin/articles?tab=akcijos">{ADMIN_PROMOS_STRINGS.tabPromos}</Link>
            </TabsTrigger>
          </TabsList>
          <Button size="sm" asChild>
            {activeTab === 'akcijos' ? (
              <Link href="/admin/articles/akcijos/new">
                <Plus className="mr-2 h-4 w-4" />
                {ADMIN_PROMOS_STRINGS.newButton}
              </Link>
            ) : (
              <Link href="/admin/articles/new">
                <Plus className="mr-2 h-4 w-4" />
                {ARTICLES_STRINGS.newButton}
              </Link>
            )}
          </Button>
        </div>

        <TabsContent value="articles">
          <div className="mb-3">
            <h1 className="text-2xl font-bold">{ARTICLES_STRINGS.pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{ARTICLES_STRINGS.pageDescription}</p>
          </div>
          <ArticlesTable data={articles ?? []} />
        </TabsContent>

        <TabsContent value="akcijos">
          <div className="mb-3">
            <h1 className="text-2xl font-bold">{ADMIN_PROMOS_STRINGS.pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{ADMIN_PROMOS_STRINGS.pageDescription}</p>
          </div>
          <PromosTable data={promos ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
