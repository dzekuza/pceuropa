// app/(dashboard)/admin/articles/new/page.tsx — New article editor
// Server Component — Defense-in-depth auth check (middleware alone is not sufficient)
// CVE-2025-29927: middleware can be bypassed via x-middleware-subrequest header
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { ArticleForm } from '@/components/articles/article-form'

export default async function NewArticlePage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') redirect('/login')

  return <ArticleForm />
}
