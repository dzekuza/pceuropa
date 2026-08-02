'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Download, HelpCircle, Pencil, Search, Trash2, Upload, ArrowUpDown, ArrowUp, ArrowDown, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTransition } from 'react'
import type { TenantListRow, TenantListState } from '@/lib/admin-data'
import { TENANT_CATEGORIES } from '@/lib/constants'
import { resizeImage } from '@/lib/storage/resize-image'
import { bulkDeleteTenants, bulkUpdateTenantCategory } from '@/actions/tenants'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'
import { DeleteTenantDialog } from '@/components/tenants/delete-tenant-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardTable,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [isBulkPending, startBulkTransition] = useTransition()

  const allSelected = data.length > 0 && data.every((tenant) => selectedIds.has(tenant.id))
  const someSelected = selectedIds.size > 0

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(data.map((tenant) => tenant.id)))
  }

  function toggleSelectRow(tenantId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(tenantId)) {
        next.delete(tenantId)
      } else {
        next.add(tenantId)
      }
      return next
    })
  }

  function handleBulkCategoryApply() {
    if (!bulkCategory || selectedIds.size === 0) return
    startBulkTransition(async () => {
      await bulkUpdateTenantCategory(Array.from(selectedIds), bulkCategory)
      setBulkCategoryOpen(false)
      setBulkCategory('')
      setSelectedIds(new Set())
    })
  }

  function handleBulkDeleteConfirm() {
    if (selectedIds.size === 0) return
    startBulkTransition(async () => {
      await bulkDeleteTenants(Array.from(selectedIds))
      setBulkDeleteOpen(false)
      setSelectedIds(new Set())
    })
  }

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
      <Card className="w-full overflow-hidden rounded-[1.75rem] border-border/70 shadow-sm">
        <CardHeader className="flex flex-col items-stretch gap-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <CardHeading>
              <CardTitle className="text-2xl font-semibold tracking-[-0.02em]">Nuomininkai</CardTitle>
            </CardHeading>

            <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 lg:max-w-[42rem] lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Ieškoti pagal pavadinimą, operatorių, kodą"
                  className="h-11 rounded-xl border-border/80 pl-10"
                />
              </div>
              <Button type="submit" variant="outline" className="h-11 rounded-xl px-5">
                Ieškoti
              </Button>
              {state.search && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 rounded-xl px-4"
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

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Select
              value={state.category || 'all'}
              onValueChange={(value) => pushParams({ category: value === 'all' ? null : value, page: '1' })}
            >
              <SelectTrigger className="h-11 w-full rounded-xl border-border/80 sm:w-[220px]">
                <SelectValue placeholder="Visos kategorijos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Visos kategorijos</SelectItem>
                  {TENANT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap items-center gap-2">
              {someSelected && (
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5">
                  <span className="text-sm text-muted-foreground">Pažymėta: {selectedIds.size}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg"
                    onClick={() => setBulkCategoryOpen(true)}
                  >
                    Keisti kategoriją
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 data-icon="inline-start" />
                    Ištrinti
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setImportOpen(true)} className="h-11 rounded-xl px-4">
                <Upload data-icon="inline-start" />
                Importuoti
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                    <HelpCircle />
                    <span className="sr-only">Importavimo instrukcija</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 rounded-xl text-sm" align="end" sideOffset={8}>
                  <div className="flex flex-col gap-3">
                    <p className="font-medium">Kaip importuoti</p>
                    <ol className="list-inside list-decimal text-muted-foreground">
                      <li>Atsisiųskite eksportą arba paruoškite tą pačią stulpelių struktūrą.</li>
                      <li>Viena eilutė turi atitikti vieną nuomininką.</li>
                      <li>Logotipas: <code className="rounded bg-muted px-1 text-xs">{'{file_key}_logo.jpg'}</code></li>
                      <li>Galerija: <code className="rounded bg-muted px-1 text-xs">{'{file_key}_gallery1.jpg'}</code></li>
                    </ol>
                  </div>
                </PopoverContent>
              </Popover>
              <Button asChild variant="outline" className="h-11 rounded-xl px-4">
                <Link href={exportHref}>
                  <Download data-icon="inline-start" />
                  Eksportuoti Excel
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardTable className="min-w-0">
          <div className="min-w-0 border-y border-border/70">
            <Table className="min-w-[1240px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[44px] px-4">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Pažymėti visus"
                    />
                  </TableHead>
                  <TableHead className="w-[76px] px-4">Logo</TableHead>
                  {SORTABLE_COLUMNS.map((column) => (
                    <TableHead key={column.key} className="px-4">
                      <SortButton column={column.key} label={column.label} />
                    </TableHead>
                  ))}
                  <TableHead className="px-4">Įmonės kodas</TableHead>
                  <TableHead className="min-w-[280px] px-4">Aprašymas</TableHead>
                  <TableHead className="w-[172px] px-4 text-right">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                      Pagal pasirinktus filtrus nuomininkų nerasta.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      data-state={selectedIds.has(tenant.id) ? 'selected' : undefined}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin/tenants/${tenant.id}`)}
                    >
                      <TableCell className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(tenant.id)}
                          onCheckedChange={() => toggleSelectRow(tenant.id)}
                          aria-label={`Pažymėti ${tenant.store_name}`}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Avatar className="size-10 rounded-full border border-border/60">
                          <AvatarImage
                            src={resizeImage(tenant.logo_url, { width: 64, height: 64 })}
                            alt={tenant.store_name}
                            loading="lazy"
                          />
                          <AvatarFallback className="text-xs">
                            {tenant.store_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">{tenant.store_name}</TableCell>
                      <TableCell className="px-4 py-3">{tenant.operator ?? '—'}</TableCell>
                      <TableCell className="px-4 py-3">
                        {tenant.category ? (
                          <Badge variant="primary-light" size="sm">
                            {tenant.category}
                          </Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="px-4 py-3">{tenant.space_m2 != null ? `${tenant.space_m2} m²` : '—'}</TableCell>
                      <TableCell className="px-4 py-3">{formatCurrency(tenant.rent_eur)}</TableCell>
                      <TableCell className="px-4 py-3">{formatDate(tenant.created_at)}</TableCell>
                      <TableCell className="px-4 py-3">{tenant.company_code ?? '—'}</TableCell>
                      <TableCell className="max-w-[280px] px-4 py-3 truncate" title={tenant.description ?? undefined}>
                        {tenant.description ?? '—'}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="outline"
                            className="h-9 rounded-xl px-4"
                            onClick={() => {
                              setSelectedTenant(tenant)
                              setSheetOpen(true)
                            }}
                          >
                            <Pencil data-icon="inline-start" />
                            Redaguoti
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setTenantToDelete({ id: tenant.id, store_name: tenant.store_name })
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardTable>

        <CardFooter className="flex flex-col gap-4 px-5 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              Rodoma {from}-{to} iš {totalCount}
            </span>
            <Select
              value={String(state.pageSize)}
              onValueChange={(value) => pushParams({ pageSize: value, page: '1' })}
            >
              <SelectTrigger size="sm" className="w-[112px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[10, 25, 50, 100].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / psl.
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => pushParams({ page: String(state.page - 1) })}
              disabled={state.page <= 1}
            >
              <ChevronsLeft />
            </Button>
            <span className="min-w-[90px] text-center text-sm text-muted-foreground">
              Puslapis {state.page} / {pageCount}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => pushParams({ page: String(state.page + 1) })}
              disabled={state.page >= pageCount}
            >
              <ChevronsRight />
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

      <AlertDialog open={bulkCategoryOpen} onOpenChange={setBulkCategoryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keisti kategoriją</AlertDialogTitle>
            <AlertDialogDescription>
              Nustatykite kategoriją {selectedIds.size} pažymėtiems nuomininkams.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={bulkCategory} onValueChange={setBulkCategory}>
            <SelectTrigger className="h-11 w-full rounded-xl border-border/80">
              <SelectValue placeholder="Pasirinkite kategoriją" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {TENANT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkPending}>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkCategoryApply}
              disabled={isBulkPending || !bulkCategory}
            >
              {isBulkPending ? 'Taikoma...' : 'Taikyti'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ištrinti nuomininkus</AlertDialogTitle>
            <AlertDialogDescription>
              Ar tikrai norite ištrinti {selectedIds.size} pažymėtus nuomininkus? Šis veiksmas negrįžtamas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkPending}>Atšaukti</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isBulkPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isBulkPending ? 'Trinama...' : 'Ištrinti'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
