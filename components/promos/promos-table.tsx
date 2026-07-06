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
import { togglePromoPublished } from '@/actions/promos'
import { getPromoColumns } from './promo-columns'
import { ADMIN_PROMOS_STRINGS } from '@/lib/strings'
import type { Promo } from '@/types/database'

interface PromosTableProps {
  data: Promo[]
}

export function PromosTable({ data: initialData }: PromosTableProps) {
  const [promos, setPromos] = useState<Promo[]>(initialData)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  function handlePublishedToggle(promo: Promo) {
    const newVal = !promo.published
    setPromos((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, published: newVal } : p))
    )
    startTransition(async () => {
      const result = await togglePromoPublished(promo.id, newVal)
      if ('error' in result) {
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, published: promo.published } : p))
        )
      }
    })
  }

  function handleDeleteSuccess(id: string) {
    setPromos((prev) => prev.filter((p) => p.id !== id))
  }

  const columns = useMemo(
    () =>
      getPromoColumns(
        handlePublishedToggle,
        (promo) => router.push(`/admin/articles/akcijos/${promo.id}/edit`),
        handleDeleteSuccess,
        pending,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending],
  )

  const table = useReactTable({
    data: promos,
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
      recordCount={promos.length}
      onRowClick={(row) => router.push(`/admin/articles/akcijos/${row.id}/edit`)}
    >
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
          <CardTitle className="text-lg">{ADMIN_PROMOS_STRINGS.pageTitle}</CardTitle>
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
