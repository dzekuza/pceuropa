'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { DataGrid } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { toggleArticlePublished, toggleArticleFeatured } from '@/actions/articles'
import { getArticleColumns } from './article-columns'
import { ARTICLES_STRINGS } from '@/lib/strings'
import type { Article } from '@/types/database'

interface ArticlesTableProps {
  data: Article[]
}

export function ArticlesTable({ data: initialData }: ArticlesTableProps) {
  const [articles, setArticles] = useState<Article[]>(initialData)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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

  const columns = useMemo(
    () =>
      getArticleColumns(
        handlePublishedToggle,
        handleFeaturedToggle,
        (article) => router.push(`/admin/articles/${article.id}/edit`),
        handleDeleteSuccess,
        pending,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending],
  )

  const table = useReactTable({
    data: articles,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <DataGrid
      table={table}
      recordCount={articles.length}
      onRowClick={(row) => router.push(`/admin/articles/${row.id}/edit`)}
    >
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <CardTitle className="text-lg">{ARTICLES_STRINGS.pageTitle}</CardTitle>
        </CardHeader>

        <div className="w-full overflow-x-auto border-y">
          <DataGridTable />
        </div>

        <CardFooter className="flex items-center justify-between px-4 py-3 bg-transparent border-none">
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  )
}
