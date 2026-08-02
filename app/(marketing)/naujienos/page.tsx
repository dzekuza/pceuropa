import type { Metadata } from 'next'
import { desc, eq } from 'drizzle-orm'
import { Nav } from '@/components/marketing/nav'
import { Footer } from '@/components/marketing/footer'
import { PageBannerCarousel } from '@/components/marketing/page-banner-carousel'
import { ArticlesGrid } from '@/components/articles/articles-grid'
import { NAUJIENOS_STRINGS } from '@/lib/strings'
import { getPuckBannerSlides } from '@/lib/page-content'
import { db } from '@/lib/db'
import { articles } from '@/drizzle/schema'
import type { Article } from '@/types/database'

const DEFAULT_BANNER_SLIDES = [
  '/api/storage/marketing-assets/banner-akcijos-1.jpg',
  '/api/storage/marketing-assets/banner-akcijos-2.jpg',
]

export const metadata: Metadata = {
  title: NAUJIENOS_STRINGS.pageTitle,
  description: NAUJIENOS_STRINGS.pageDescription,
}

// force-dynamic (not ISR revalidate) — Docker builds have no DATABASE_URL
// reachable at build time, so this page can't be pre-rendered; it must
// render per-request against the running container's DB instead.
export const dynamic = 'force-dynamic'

export default async function NaujienosPage() {
  const [bannerSlides, articleRows] = await Promise.all([
    getPuckBannerSlides('naujienos', DEFAULT_BANNER_SLIDES),
    db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.publishedAt)),
  ])

  const items: Article[] = articleRows.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    content: a.content,
    cover_image: a.coverImage,
    category: a.category as Article['category'],
    featured: a.featured,
    published: a.published,
    published_at: a.publishedAt ? a.publishedAt.toISOString() : null,
    created_at: a.createdAt ? a.createdAt.toISOString() : null,
    updated_at: a.updatedAt ? a.updatedAt.toISOString() : null,
  }))

  return (
    <main className="bg-[#f7f7f5] flex flex-col items-center min-h-screen font-[family-name:var(--font-jakarta)]">
      <Nav />
      <h1 className="sr-only">{NAUJIENOS_STRINGS.pageTitle}</h1>
      <PageBannerCarousel slides={bannerSlides} />
      <section className="w-full max-w-[1332px] mx-auto px-4 py-8 md:py-10 lg:py-14">
        <ArticlesGrid articles={items} />
      </section>
      <Footer />
    </main>
  )
}
