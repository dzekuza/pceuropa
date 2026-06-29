// app/(dashboard)/admin/articles/page.tsx — Admin articles list page
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArticlesTable } from '@/components/articles/articles-table'
import { ARTICLES_STRINGS } from '@/lib/strings'

export default async function AdminArticlesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{ARTICLES_STRINGS.pageTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ARTICLES_STRINGS.pageDescription}</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/admin/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            {ARTICLES_STRINGS.newButton}
          </Link>
        </Button>
      </div>

      <ArticlesTable data={articles ?? []} />
    </div>
  )
}
