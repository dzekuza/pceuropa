'use client'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { getColumns } from '@/components/tenants/tenant-columns'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'
import { DeleteTenantDialog } from '@/components/tenants/delete-tenant-dialog'
import type { Tenant } from '@/types/database'
import { TENANT_CATEGORIES } from '@/lib/constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataGrid } from '@/components/reui/data-grid/data-grid'
import { DataGridTable } from '@/components/reui/data-grid/data-grid-table'
import { DataGridPagination } from '@/components/reui/data-grid/data-grid-pagination'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { TenantImportDialog } from '@/components/tenants/tenant-import-dialog'

interface TenantsTableProps {
  data: Tenant[]
}

export function TenantsTable({ data }: TenantsTableProps) {
  const router = useRouter()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [importOpen, setImportOpen] = useState(false)

  const categoryFilter = (columnFilters.find((f) => f.id === 'category')?.value as string) ?? ''

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [columnFilters])

  const handleEdit = useCallback((tenant: Tenant) => {
    setSelectedTenant(tenant)
    setSheetOpen(true)
  }, [])

  const handleDelete = useCallback((tenant: Tenant) => {
    setTenantToDelete(tenant)
    setDeleteDialogOpen(true)
  }, [])

  function handleSheetClose(open: boolean) {
    setSheetOpen(open)
    if (!open) setSelectedTenant(null)
  }

  const columns = useMemo(() => getColumns(handleEdit, handleDelete), [handleEdit, handleDelete])

  const [columnOrder, setColumnOrder] = useState<string[]>(
    columns.map((col) => (col as { id?: string; accessorKey?: string }).id || (col as { id?: string; accessorKey?: string }).accessorKey || '')
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, columnOrder, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnOrderChange: setColumnOrder,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    autoResetPageIndex: false,
  })

  const handleExportCsv = useCallback(() => {
    const selectedRows = table.getSelectedRowModel().rows
    // Always export from the full unfiltered dataset unless rows are explicitly selected
    const rows = selectedRows.length > 0 ? selectedRows : table.getCoreRowModel().rows
    const headers = [
      'ID', 'Parduotuvė', 'Operatorius', 'Kategorija',
      'Plotas (m²)', 'Nuomos kaina (EUR)', 'Įmonės kodas',
      'Aprašymas', 'Logo URL', 'Sukurta',
    ]
    const csvRows = rows.map((row) => {
      const t = row.original
      return [
        t.id,
        t.store_name,
        t.operator ?? '',
        t.category ?? '',
        t.space_m2 ?? '',
        t.rent_eur ?? '',
        t.company_code ?? '',
        t.description ?? '',
        t.logo_url ?? '',
        t.created_at ?? '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    const csv = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `nuomininkai-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [table])

  return (
    <div className="flex flex-col gap-4">
      <DataGrid
        table={table}
        recordCount={table.getFilteredRowModel().rows.length}
        onRowClick={(row) => router.push(`/admin/tenants/${row.id}`)}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
      >
        <Card className="w-full">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg">Nuomininkai</CardTitle>
              <Select
                value={categoryFilter || 'all'}
                onValueChange={(val) => {
                  setColumnFilters(val === 'all' ? [] : [{ id: 'category', value: val }])
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px] h-9">
                  <SelectValue placeholder="Visos kategorijos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visos kategorijos</SelectItem>
                  {TENANT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {table.getSelectedRowModel().rows.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {table.getSelectedRowModel().rows.length} pažymėta
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
                <Upload data-icon="inline-start" />
                Importuoti
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5">
                <Download data-icon="inline-start" />
                Eksportuoti CSV
              </Button>
            </div>
          </CardHeader>

          <div className="w-full overflow-x-auto border-y">
            <DataGridTable />
          </div>

          <CardFooter className="flex items-center justify-between px-4 py-3 bg-transparent border-none">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <TenantImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <TenantFormSheet
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        tenant={selectedTenant}
      />
      <DeleteTenantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tenant={tenantToDelete}
      />
    </div>
  )
}
