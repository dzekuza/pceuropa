// app/(dashboard)/admin/pages/[slug]/page.tsx — Admin page content editor
// Server Component — Defense-in-depth auth check
export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { pageSections } from '@/drizzle/schema'
import { getPageConfig } from '@/lib/page-config'
import { PageEditor } from '@/components/pages/page-editor'
import type { PageContentMap } from '@/types/database'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AdminPageEditorPage({ params }: Props) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  const pageConfig = getPageConfig(slug)
  if (!pageConfig) notFound()

  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageSlug, slug))

  const content: PageContentMap = {}
  for (const row of rows) {
    if (!content[row.sectionKey]) content[row.sectionKey] = {}
    content[row.sectionKey][row.contentKey] = row.value ?? ''
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/admin/pages" className="hover:text-foreground transition-colors">
          Puslapiai
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{pageConfig.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{pageConfig.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pageConfig.description}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={pageConfig.previewUrl} target="_blank">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Peržiūrėti
          </Link>
        </Button>
      </div>

      <PageEditor pageConfig={pageConfig} initialContent={content} />
    </div>
  )
}
