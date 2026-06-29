'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toggleArticlePublished, toggleArticleFeatured } from '@/actions/articles'
import { DeleteArticleDialog } from './delete-article-dialog'
import { ARTICLES_STRINGS } from '@/lib/strings'
import type { Article } from '@/types/database'

interface ArticlesTableProps {
  data: Article[]
}

const CATEGORY_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  Naujiena: 'default',
  Akcija: 'secondary',
  Renginys: 'outline',
}

export function ArticlesTable({ data: initialData }: ArticlesTableProps) {
  const [articles, setArticles] = useState<Article[]>(initialData)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handlePublishedToggle(article: Article) {
    const newVal = !article.published
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, published: newVal } : a))
    )
    startTransition(async () => {
      const result = await toggleArticlePublished(article.id, newVal, article.published)
      if ('error' in result) {
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, published: article.published } : a))
        )
      }
    })
  }

  function handleFeaturedToggle(article: Article) {
    const newVal = !article.featured
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, featured: newVal } : a))
    )
    startTransition(async () => {
      const result = await toggleArticleFeatured(article.id, newVal)
      if ('error' in result) {
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, featured: article.featured } : a))
        )
      }
    })
  }

  function handleDeleteSuccess(id: string) {
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>{ARTICLES_STRINGS.colTitle}</TableHead>
          <TableHead>{ARTICLES_STRINGS.colCategory}</TableHead>
          <TableHead className="w-32">{ARTICLES_STRINGS.colFeatured}</TableHead>
          <TableHead className="w-32">{ARTICLES_STRINGS.colPublished}</TableHead>
          <TableHead className="w-32">{ARTICLES_STRINGS.colDate}</TableHead>
          <TableHead className="w-24">{ARTICLES_STRINGS.colActions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell>
              {article.cover_image ? (
                <img
                  src={article.cover_image}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-muted" />
              )}
            </TableCell>
            <TableCell className="font-medium">{article.title}</TableCell>
            <TableCell>
              <Badge variant={CATEGORY_VARIANT[article.category] ?? 'default'}>
                {article.category}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() => handleFeaturedToggle(article)}
                className={article.featured ? 'text-yellow-500' : 'text-muted-foreground'}
              >
                <Star className="h-4 w-4" fill={article.featured ? 'currentColor' : 'none'} />
              </Button>
            </TableCell>
            <TableCell>
              <Switch
                checked={article.published}
                disabled={pending}
                onCheckedChange={() => handlePublishedToggle(article)}
              />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {article.created_at
                ? new Date(article.created_at).toLocaleDateString('lt-LT')
                : '—'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/admin/articles/${article.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <DeleteArticleDialog id={article.id} onSuccess={handleDeleteSuccess} />
              </div>
            </TableCell>
          </TableRow>
        ))}
        {articles.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
              {ARTICLES_STRINGS.emptyState}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
