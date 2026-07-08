import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/server'
import { getAdminTenantExportRows, type TenantListSearchParams } from '@/lib/admin-data'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rows = await getAdminTenantExportRows(supabase, {
    search: searchParams.get('search') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    direction: searchParams.get('direction') ?? undefined,
  } satisfies TenantListSearchParams)

  const worksheetRows = [
    [
      'id',
      'store_name',
      'operator',
      'category',
      'space_m2',
      'rent_eur',
      'company_code',
      'description',
      'logo_url',
      'gallery_images',
      'created_at',
    ],
    ...rows.map((tenant) => [
      tenant.id,
      tenant.store_name,
      tenant.operator ?? '',
      tenant.category ?? '',
      tenant.space_m2 ?? '',
      tenant.rent_eur ?? '',
      tenant.company_code ?? '',
      tenant.description ?? '',
      tenant.logo_url ?? '',
      (tenant.gallery_images ?? []).join(', '),
      tenant.created_at ?? '',
    ]),
  ]

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetRows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Nuomininkai')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' })

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="nuomininkai-${new Date().toISOString().slice(0, 10)}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}
