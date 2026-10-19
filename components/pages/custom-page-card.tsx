import Link from 'next/link'
import { ExternalLink, FileText, Pencil } from 'lucide-react'
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardDescription,
  CardToolbar,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteCustomPageDialog } from '@/components/pages/delete-custom-page-dialog'
import { CUSTOM_PAGES_STRINGS } from '@/lib/strings'
import type { CustomPage } from '@/types/database'

interface CustomPageCardProps {
  page: Pick<CustomPage, 'id' | 'title' | 'slug' | 'published'>
}

export function CustomPageCard({ page }: CustomPageCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4.5 w-4.5 text-primary" />
          </div>
          <CardHeading className="min-w-0">
            <CardTitle className="text-sm truncate">{page.title}</CardTitle>
            <CardDescription className="text-xs line-clamp-1">/puslapiai/{page.slug}</CardDescription>
          </CardHeading>
        </div>
        <CardToolbar>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/pages/custom/${page.id}/edit`} prefetch={false}>
              <Pencil className="mr-1.5 h-4 w-4" />
              {CUSTOM_PAGES_STRINGS.edit}
            </Link>
          </Button>
        </CardToolbar>
      </CardHeader>
      <CardFooter className="min-h-0 py-2 justify-between">
        {page.published ? (
          <Badge variant="default">{CUSTOM_PAGES_STRINGS.statusPublished}</Badge>
        ) : (
          <Badge variant="secondary">{CUSTOM_PAGES_STRINGS.statusDraft}</Badge>
        )}
        <div className="flex items-center gap-1">
          {page.published && (
            <Button asChild variant="ghost" size="icon" aria-label={CUSTOM_PAGES_STRINGS.view}>
              <a href={`/puslapiai/${page.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <DeleteCustomPageDialog id={page.id} />
        </div>
      </CardFooter>
    </Card>
  )
}
