// app/(dashboard)/admin/pages/page.tsx — Admin page management list
// Server Component — Defense-in-depth auth check
export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PAGES_CONFIG } from '@/lib/page-config'
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardDescription,
  CardToolbar,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ChevronRight, Layers } from 'lucide-react'

export default async function AdminPagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Puslapių valdymas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Redaguokite puslapių turinį, nuotraukas ir tekstus
        </p>
      </div>

      {PAGES_CONFIG.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Layers className="h-10 w-10 mb-3 opacity-40" />
          <p>Nėra sukonfigūruotų puslapių.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAGES_CONFIG.map((page) => (
            <Card key={page.slug}>
              <CardHeader>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <CardHeading className="min-w-0">
                    <CardTitle className="text-sm truncate">{page.title}</CardTitle>
                    <CardDescription className="text-xs line-clamp-1">
                      {page.description}
                    </CardDescription>
                  </CardHeading>
                </div>
                <CardToolbar>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/pages/${page.slug}`}>
                      Redaguoti
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardToolbar>
              </CardHeader>
              <CardFooter className="min-h-0 py-3">
                <span className="text-xs text-muted-foreground">
                  {page.sections.length}{' '}
                  {page.sections.length === 1 ? 'sekcija' : 'sekcijos'}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
