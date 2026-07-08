'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Download, HelpCircle, Pencil, Search, Trash2, Upload, ArrowUpDown, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { TenantListRow, TenantListState } from '@/lib/admin-data'
import { TENANT_CATEGORIES } from '@/lib/constants'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'
import { DeleteTenantDialog } from '@/components/tenants/delete-tenant-dialog'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/reui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const TenantImportDialog = dynamic(() =>
  import('@/components/tenants/tenant-import-dialog').then((m) => m.TenantImportDialog)
)

interface TenantsTableProps {
  data: TenantListRow[]
  totalCount: number
  pageCount: number
  state: TenantListState
}

type SortColumn = TenantListState['sort']

const SORTABLE_COLUMNS: Array<{ key: SortColumn; label: string }> = [
  { key: 'store_name', label: 'Parduotuvė' },
  { key: 'operator', label: 'Operatorius' },
  { key: 'category', label: 'Kategorija' },
  { key: 'space_m2', label: 'Plotas' },
  { key: 'rent_eur', label: 'Nuoma' },
  { key: 'created_at', label: 'Sukurta' },
]

function formatCurrency(value: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('lt-LT') : '—'
}

export function TenantsTable({ data, totalCount, pageCount, state }: TenantsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchDraft, setSearchDraft] = useState(state.search)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<TenantListRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<Pick<TenantListRow, 'id' | 'store_name'> | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const from = totalCount === 0 ? 0 : (state.page - 1) * state.pageSize + 1
  const to = Math.min(state.page * state.pageSize, totalCount)

  const exportHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    return `/api/admin/tenants/export?${params.toString()}`
  }, [searchParams])

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    pushParams({ search: searchDraft || null, page: '1' })
  }

  function toggleSort(column: SortColumn) {
    const direction =
      state.sort === column ? (state.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    pushParams({
      sort: column,
      direction,
      page: '1',
    })
  }

  function SortButton({ column, label }: { column: SortColumn; label: string }) {
    const isActive = state.sort === column
    return (
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className="inline-flex items-center gap-1 text-left transition-colors hover:text-foreground"
      >
        <span>{label}</span>
        {!isActive ? (
          <ArrowUpDown className="size-3.5 opacity-50" />
        ) : state.direction === 'asc' ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <CardTitle className="text-lg">Nuomininkai</CardTitle>
            <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Ieškoti pagal pavadinimą, operatorių, kodą"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Ieškoti
              </Button>
              {state.search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchDraft('')
                    pushParams({ search: null, page: '1' })
                  }}
                >
                  Valyti
                </Button>
              )}
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={state.category || 'all'}
              onValueChange={(value) => pushParams({ category: value === 'all' ? null : value, page: '1' })}
            >
              <SelectTrigger className="h-9 w-full sm:w-[200px]">
                <SelectValue placeholder="Visos kategorijos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visos kategorijos</SelectItem>
                {TENANT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="gap-1.5">
              <Upload className="size-4" />
              Importuoti
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
                  <HelpCircle className="size-4" />
                  <span className="sr-only">Importavimo instrukcija</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 text-sm" align="end" sideOffset={4}>
                <p className="mb-2 font-medium">Kaip importuoti</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-snug text-muted-foreground">
                  <li>Atsisiųskite eksportą arba paruoškite tą pačią stulpelių struktūrą.</li>
                  <li>Viena eilutė turi atitikti vieną nuomininką.</li>
                  <li>Logotipas: <code className="rounded bg-muted px-1 text-xs">{'{file_key}_logo.jpg'}</code></li>
                  <li>Galerija: <code className="rounded bg-muted px-1 text-xs">{'{file_key}_gallery1.jpg'}</code></li>
                </ol>
              </PopoverContent>
            </Popover>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={exportHref}>
                <Download className="size-4" />
                Eksportuoti Excel
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto border-y">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[72px]">Logo</TableHead>
                  {SORTABLE_COLUMNS.map((column) => (
                    <TableHead key={column.key}>
                      <SortButton column={column.key} label={column.label} />
                    </TableHead>
                  ))}
                  <TableHead>Įmonės kodas</TableHead>
                  <TableHead>Aprašymas</TableHead>
                  <TableHead className="w-[160px] text-right">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                      Pagal pasirinktus filtrus nuomininkų nerasta.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
                    >
                      <TableCell>
                        <Avatar className="size-8">
                          <AvatarImage
                            src={resizeSupabaseImage(tenant.logo_url, { width: 64, height: 64 })}
                            alt={tenant.store_name}
                            loading="lazy"
                          />
                          <AvatarFallback className="text-xs">
                            {tenant.store_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{tenant.store_name}</TableCell>
                      <TableCell>{tenant.operator ?? '—'}</TableCell>
                      <TableCell>
                        {tenant.category ? (
                          <Badge variant="primary-light" size="sm">
                            {tenant.category}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{tenant.space_m2 != null ? `${tenant.space_m2} m²` : '—'}</TableCell>
                      <TableCell>{formatCurrency(tenant.rent_eur)}</TableCell>
                      <TableCell>{formatDate(tenant.created_at)}</TableCell>
                      <TableCell>{tenant.company_code ?? '—'}</TableCell>
                      <TableCell className="max-w-[240px] truncate" title={tenant.description ?? undefined}>
                        {tenant.description ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTenant(tenant)
                              setSheetOpen(true)
                            }}
                          >
                            <Pencil className="mr-1.5 size-3.5" />
                            Redaguoti
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setTenantToDelete({ id: tenant.id, store_name: tenant.store_name })
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              Rodoma {from}-{to} iš {totalCount}
            </span>
            <Select
              value={String(state.pageSize)}
              onValueChange={(value) => pushParams({ pageSize: value, page: '1' })}
            >
              <SelectTrigger className="h-8 w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / psl.
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pushParams({ page: String(state.page - 1) })}
              disabled={state.page <= 1}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <span className="min-w-[90px] text-center text-sm text-muted-foreground">
              Puslapis {state.page} / {pageCount}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pushParams({ page: String(state.page + 1) })}
              disabled={state.page >= pageCount}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <TenantImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <TenantFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open)
          if (!open) setSelectedTenant(null)
        }}
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
