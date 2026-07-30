import type { createClient } from '@/lib/supabase/server'
import { MONTHS_LT, TENANT_CATEGORIES } from '@/lib/constants'
import type { RevenueReport, Tenant } from '@/types/database'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

const TENANT_LIST_COLUMNS = [
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
  'user_id',
  'weekday_hours',
  'weekend_hours',
].join(', ')

const TENANT_EXPORT_COLUMNS = [
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
].join(', ')

const TENANT_DETAIL_COLUMNS = [
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
  'user_id',
  'weekday_hours',
  'weekend_hours',
].join(', ')

const TENANT_SORT_COLUMNS = new Set([
  'store_name',
  'operator',
  'category',
  'created_at',
  'rent_eur',
  'space_m2',
])

export interface TenantListSearchParams {
  page?: string
  pageSize?: string
  search?: string
  category?: string
  sort?: string
  direction?: string
}

export interface TenantListState {
  page: number
  pageSize: number
  search: string
  category: string
  sort: string
  direction: 'asc' | 'desc'
}

export interface TenantListRow
  extends Pick<
    Tenant,
    | 'id'
    | 'store_name'
    | 'operator'
    | 'category'
    | 'space_m2'
    | 'rent_eur'
    | 'company_code'
    | 'description'
    | 'logo_url'
    | 'gallery_images'
    | 'created_at'
    | 'user_id'
    | 'weekday_hours'
    | 'weekend_hours'
  > {}

export interface TenantSubmissionRow
  extends Pick<Tenant, 'id' | 'store_name' | 'operator' | 'category' | 'space_m2' | 'rent_eur'> {}

export interface MonthlyRevenuePoint {
  month: string
  label: string
  total: number
}

export interface CategoryRevenuePoint {
  category: string
  total: number
}

export interface TenantTrendSeries {
  tenantId: string
  storeName: string
  data: MonthlyRevenuePoint[]
}

export interface TxChartPoint {
  label: string
  tx_count: number
}

interface OverviewAggregateRow {
  category: string | null
  month_date: string
  store_name: string
  tenant_id: string
  total_revenue: number
  total_tx: number
}

interface MonthlyStatsRow {
  month_date: string
  submission_count: number
  total_revenue: number
  total_tx: number
}

interface RecentReportRow
  extends Pick<RevenueReport, 'id' | 'amount_eur' | 'tx_count' | 'month' | 'tenant_id' | 'submitted_at'> {}

export interface AdminHomeData {
  tenantCount: number
  submittedCount: number
  totalRevenue: number
  totalTx: number
  yearlyRevenue: number
  revenueTrend: number
  txTrend: number
  submissionTrend: number
  yearlyTrend: number
  currentYear: number
  currentMonthLabel: string
  revenueChartData: MonthlyRevenuePoint[]
  txChartData: TxChartPoint[]
  recentReports: Array<RecentReportRow & { tenant_name: string | null }>
  recentTenants: Pick<Tenant, 'id' | 'store_name' | 'operator' | 'created_at'>[]
}

export interface AdminOverviewData {
  tenants: Array<Pick<Tenant, 'id' | 'store_name' | 'category'>>
  reports: Array<{
    tenant_id: string
    month: string
    amount_eur: number
    tx_count: number
  }>
}

export interface AdminAnalyticsData {
  monthlyRevenue: MonthlyRevenuePoint[]
  categoryRevenue: CategoryRevenuePoint[]
  submitted: TenantSubmissionRow[]
  pending: TenantSubmissionRow[]
  submittedCount: number
  totalCount: number
  tenantTrends: TenantTrendSeries[]
  totalRevenue: number
  prevRevenue: number | null
  tenantCount: number
  avgRevenue: number
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseMonthRange(startMonth: string, endMonth: string): string[] {
  const start = new Date(`${startMonth}T00:00:00Z`)
  const end = new Date(`${endMonth}T00:00:00Z`)
  const result: string[] = []
  const cursor = new Date(start)

  while (cursor <= end) {
    result.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return result
}

function getMonthLabel(monthDate: string): string {
  const [year, month] = monthDate.split('-')
  return `${MONTHS_LT[Number.parseInt(month, 10) - 1]} ${year}`
}

function buildMonthlyRevenuePoints(
  rows: MonthlyStatsRow[],
  startMonth: string,
  endMonth: string
): MonthlyRevenuePoint[] {
  const rowByMonth = new Map(rows.map((row) => [row.month_date, row]))
  return parseMonthRange(startMonth, endMonth).map((month) => ({
    month,
    label: getMonthLabel(month),
    total: rowByMonth.get(month)?.total_revenue ?? 0,
  }))
}

function buildTxChartPoints(
  rows: MonthlyStatsRow[],
  startMonth: string,
  endMonth: string
): TxChartPoint[] {
  const rowByMonth = new Map(rows.map((row) => [row.month_date, row]))
  return parseMonthRange(startMonth, endMonth).map((month) => ({
    label: getMonthLabel(month),
    tx_count: rowByMonth.get(month)?.total_tx ?? 0,
  }))
}

export function parseTenantListState(searchParams: TenantListSearchParams): TenantListState {
  const page = parsePositiveInt(searchParams.page, 1)
  const pageSize = Math.min(parsePositiveInt(searchParams.pageSize, 10), 100)
  const sort = TENANT_SORT_COLUMNS.has(searchParams.sort ?? '') ? (searchParams.sort as string) : 'store_name'
  const direction = searchParams.direction === 'desc' ? 'desc' : 'asc'
  const search = searchParams.search?.trim() ?? ''
  const category =
    searchParams.category && TENANT_CATEGORIES.includes(searchParams.category as (typeof TENANT_CATEGORIES)[number])
      ? searchParams.category
      : ''

  return { page, pageSize, search, category, sort, direction }
}

function buildTenantQuery(
  supabase: SupabaseServerClient,
  state: TenantListState,
  selectClause: string
) {
  let query = supabase.from('tenants').select(selectClause, { count: 'exact' })

  if (state.search) {
    const term = state.search.replace(/,/g, ' ')
    query = query.or(`store_name.ilike.%${term}%,operator.ilike.%${term}%,company_code.ilike.%${term}%`)
  }

  if (state.category) {
    query = query.eq('category', state.category)
  }

  query = query.order(state.sort, {
    ascending: state.direction === 'asc',
    nullsFirst: false,
  })

  if (state.sort !== 'store_name') {
    query = query.order('store_name', { ascending: true })
  }

  return query
}

export async function getAdminTenantList(
  supabase: SupabaseServerClient,
  searchParams: TenantListSearchParams
): Promise<{
  tenants: TenantListRow[]
  totalCount: number
  pageCount: number
  state: TenantListState
}> {
  const state = parseTenantListState(searchParams)
  const from = (state.page - 1) * state.pageSize
  const to = from + state.pageSize - 1

  const { data, count, error } = await buildTenantQuery(supabase, state, TENANT_LIST_COLUMNS).range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const totalCount = count ?? 0
  const pageCount = Math.max(1, Math.ceil(totalCount / state.pageSize))

  return {
    tenants: (data ?? []) as unknown as TenantListRow[],
    totalCount,
    pageCount,
    state: { ...state, page: Math.min(state.page, pageCount) },
  }
}

export async function getAdminTenantExportRows(
  supabase: SupabaseServerClient,
  searchParams: TenantListSearchParams
): Promise<TenantListRow[]> {
  const state = parseTenantListState(searchParams)
  const { data, error } = await buildTenantQuery(supabase, state, TENANT_EXPORT_COLUMNS)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as TenantListRow[]
}

export async function getAdminHomeData(supabase: SupabaseServerClient): Promise<AdminHomeData> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentMonthDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
  const currentMonthLabel = `${MONTHS_LT[currentMonth - 1]} ${currentYear}`
  const startOfLastYear = `${currentYear - 1}-01-01`
  const yearStartDate = `${currentYear}-01-01`
  const lastYearSameMonth = `${currentYear - 1}-${String(currentMonth).padStart(2, '0')}-01`

  const [monthlyStatsResult, recentReportsResult, recentTenantsResult, tenantCountResult] = await Promise.all([
    supabase.rpc('get_admin_monthly_stats', { start_month_str: startOfLastYear }),
    supabase
      .from('revenue_reports')
      .select('id, amount_eur, tx_count, month, tenant_id, submitted_at')
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .order('month', { ascending: false })
      .limit(10),
    supabase
      .from('tenants')
      .select('id, store_name, operator, created_at')
      .order('created_at', { ascending: false })
      .limit(7),
    supabase.from('tenants').select('id', { count: 'exact', head: true }),
  ])

  if (monthlyStatsResult.error) throw new Error(monthlyStatsResult.error.message)
  if (recentReportsResult.error) throw new Error(recentReportsResult.error.message)
  if (recentTenantsResult.error) throw new Error(recentTenantsResult.error.message)
  if (tenantCountResult.error) throw new Error(tenantCountResult.error.message)

  const monthlyStats = (monthlyStatsResult.data ?? []) as MonthlyStatsRow[]
  const recentReports = (recentReportsResult.data ?? []) as unknown as RecentReportRow[]
  const recentTenants = (recentTenantsResult.data ?? []) as unknown as Pick<Tenant, 'id' | 'store_name' | 'operator' | 'created_at'>[]
  const tenantCount = tenantCountResult.count ?? 0

  const reportTenantIds = [...new Set(recentReports.map((report) => report.tenant_id).filter(Boolean))] as string[]
  const tenantNameMap = new Map<string, string>()
  if (reportTenantIds.length > 0) {
    const { data: reportTenants, error: reportTenantsError } = await supabase
      .from('tenants')
      .select('id, store_name')
      .in('id', reportTenantIds)

    if (reportTenantsError) throw new Error(reportTenantsError.message)
    for (const tenant of reportTenants ?? []) {
      tenantNameMap.set(tenant.id, tenant.store_name)
    }
  }

  const currentMonthStats = monthlyStats.find((row) => row.month_date === currentMonthDate)
  const lastYearSameMonthStats = monthlyStats.find((row) => row.month_date === lastYearSameMonth)
  const yearlyRevenue = monthlyStats
    .filter((row) => row.month_date.startsWith(`${currentYear}-`))
    .reduce((sum, row) => sum + row.total_revenue, 0)
  const lastYearRevenue = monthlyStats
    .filter((row) => row.month_date.startsWith(`${currentYear - 1}-`))
    .reduce((sum, row) => sum + row.total_revenue, 0)

  const submittedCount = currentMonthStats?.submission_count ?? 0
  const totalRevenue = currentMonthStats?.total_revenue ?? 0
  const totalTx = currentMonthStats?.total_tx ?? 0
  const lastYearSameMonthRevenue = lastYearSameMonthStats?.total_revenue ?? 0
  const lastYearSameMonthTx = lastYearSameMonthStats?.total_tx ?? 0
  const lastYearSameMonthCount = lastYearSameMonthStats?.submission_count ?? 0

  const revenueTrend =
    lastYearSameMonthRevenue > 0 ? Math.round(((totalRevenue - lastYearSameMonthRevenue) / lastYearSameMonthRevenue) * 100) : 0
  const txTrend = lastYearSameMonthTx > 0 ? Math.round(((totalTx - lastYearSameMonthTx) / lastYearSameMonthTx) * 100) : 0
  const submissionTrend =
    lastYearSameMonthCount > 0 ? Math.round(((submittedCount - lastYearSameMonthCount) / lastYearSameMonthCount) * 100) : 0
  const yearlyTrend = lastYearRevenue > 0 ? Math.round(((yearlyRevenue - lastYearRevenue) / lastYearRevenue) * 100) : 0

  return {
    tenantCount,
    submittedCount,
    totalRevenue,
    totalTx,
    yearlyRevenue,
    revenueTrend,
    txTrend,
    submissionTrend,
    yearlyTrend,
    currentYear,
    currentMonthLabel,
    revenueChartData: buildMonthlyRevenuePoints(monthlyStats, yearStartDate, currentMonthDate),
    txChartData: buildTxChartPoints(monthlyStats, yearStartDate, currentMonthDate),
    recentReports: recentReports.map((report) => ({
      ...report,
      tenant_name: report.tenant_id ? tenantNameMap.get(report.tenant_id) ?? null : null,
    })),
    recentTenants,
  }
}

export async function getAdminOverviewData(
  supabase: SupabaseServerClient,
  year: number
): Promise<AdminOverviewData> {
  const [{ data: tenants, error: tenantsError }, { data: overviewRows, error: overviewError }] = await Promise.all([
    supabase.from('tenants').select('id, store_name, category').order('category').order('store_name'),
    supabase.rpc('get_admin_yearly_overview', { target_year: year }),
  ])

  if (tenantsError) throw new Error(tenantsError.message)
  if (overviewError) throw new Error(overviewError.message)

  return {
    tenants: (tenants ?? []) as unknown as Array<Pick<Tenant, 'id' | 'store_name' | 'category'>>,
    reports: ((overviewRows ?? []) as OverviewAggregateRow[]).map((row) => ({
      tenant_id: row.tenant_id,
      month: row.month_date,
      amount_eur: row.total_revenue,
      tx_count: row.total_tx,
    })),
  }
}

export async function getAdminAnalyticsData(
  supabase: SupabaseServerClient,
  year: number,
  month: number | null
): Promise<AdminAnalyticsData> {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const endMonth = month ?? (year === currentYear ? currentMonth : 12)
  const fromDate = `${year}-${String(month ?? 1).padStart(2, '0')}-01`
  const toDate = `${year}-${String(endMonth).padStart(2, '0')}-01`

  const prevYear = month ? (month === 1 ? year - 1 : year) : year - 1
  const prevMonth = month ? (month === 1 ? 12 : month - 1) : null
  const prevFromDate = `${prevYear}-${String(prevMonth ?? 1).padStart(2, '0')}-01`
  const prevToDate = `${prevYear}-${String(prevMonth ?? (year === currentYear ? currentMonth : 12)).padStart(2, '0')}-01`
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`

  const [tenantsResult, overviewResult, prevStatsResult] = await Promise.all([
    supabase
      .from('tenants')
      .select('id, store_name, operator, category, space_m2, rent_eur')
      .order('store_name'),
    supabase.rpc('get_admin_yearly_overview', { target_year: year }),
    supabase.rpc('get_admin_monthly_stats', { start_month_str: prevFromDate }),
  ])

  if (tenantsResult.error) throw new Error(tenantsResult.error.message)
  if (overviewResult.error) throw new Error(overviewResult.error.message)
  if (prevStatsResult.error) throw new Error(prevStatsResult.error.message)

  const tenants = (tenantsResult.data ?? []) as unknown as TenantSubmissionRow[]
  const tenantCount = tenants.length
  const overviewRows = (overviewResult.data ?? []) as OverviewAggregateRow[]
  const rangeMonths = new Set(parseMonthRange(fromDate, toDate))
  const filteredOverview = overviewRows.filter((row) => rangeMonths.has(row.month_date))
  const prevRows = ((prevStatsResult.data ?? []) as MonthlyStatsRow[]).filter((row) => {
    return row.month_date >= prevFromDate && row.month_date <= prevToDate
  })

  const totalRevenue = filteredOverview.reduce((sum, row) => sum + row.total_revenue, 0)
  const prevRevenue = prevRows.length > 0 ? prevRows.reduce((sum, row) => sum + row.total_revenue, 0) : null

  const monthlyRevenue = parseMonthRange(fromDate, toDate).map((monthDate) => ({
    month: monthDate,
    label: getMonthLabel(monthDate),
    total: filteredOverview
      .filter((row) => row.month_date === monthDate)
      .reduce((sum, row) => sum + row.total_revenue, 0),
  }))

  const categoryTotals = new Map<string, number>()
  for (const row of filteredOverview) {
    const key = row.category ?? 'Kita'
    categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + row.total_revenue)
  }

  const categoryRevenue = [...categoryTotals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const submittedTenantIds = new Set(
    overviewRows
      .filter((row) => row.month_date === currentMonthStr)
      .map((row) => row.tenant_id)
  )
  const submitted = tenants.filter((tenant) => submittedTenantIds.has(tenant.id))
  const pending = tenants.filter((tenant) => !submittedTenantIds.has(tenant.id))
  const submittedCount = submitted.length
  const avgRevenue = submittedCount > 0 ? totalRevenue / submittedCount : 0

  const tenantSeries = new Map<string, TenantTrendSeries>()
  const monthIndex = parseMonthRange(fromDate, toDate)
  for (const row of filteredOverview) {
    if (!tenantSeries.has(row.tenant_id)) {
      tenantSeries.set(row.tenant_id, {
        tenantId: row.tenant_id,
        storeName: row.store_name,
        data: monthIndex.map((monthDate) => ({
          month: monthDate,
          label: getMonthLabel(monthDate),
          total: 0,
        })),
      })
    }

    const series = tenantSeries.get(row.tenant_id)!
    const dataPoint = series.data.find((entry) => entry.month === row.month_date)
    if (dataPoint) dataPoint.total += row.total_revenue
  }

  const tenantTrends = [...tenantSeries.values()].sort((a, b) => {
    const totalA = a.data.reduce((sum, item) => sum + item.total, 0)
    const totalB = b.data.reduce((sum, item) => sum + item.total, 0)
    return totalB - totalA
  })

  return {
    monthlyRevenue,
    categoryRevenue,
    submitted,
    pending,
    submittedCount,
    totalCount: tenantCount,
    tenantTrends,
    totalRevenue,
    prevRevenue,
    tenantCount,
    avgRevenue,
  }
}

export async function getAdminTenantDetail(
  supabase: SupabaseServerClient,
  tenantId: string,
  year: number
): Promise<{
  tenant: Tenant | null
  reports: Pick<RevenueReport, 'id' | 'month' | 'amount_eur' | 'tx_count' | 'submitted_at' | 'submitted_by' | 'tenant_id' | 'user_id' | 'weeks'>[]
}> {
  const [{ data: tenant, error: tenantError }, { data: reports, error: reportsError }] = await Promise.all([
    supabase.from('tenants').select(TENANT_DETAIL_COLUMNS).eq('id', tenantId).single(),
    supabase
      .from('revenue_reports')
      .select('id, month, amount_eur, tx_count, submitted_at, submitted_by, tenant_id, user_id, weeks')
      .eq('tenant_id', tenantId)
      .gte('month', `${year}-01-01`)
      .lte('month', `${year}-12-31`)
      .order('month', { ascending: true }),
  ])

  if (tenantError && tenantError.code !== 'PGRST116') throw new Error(tenantError.message)
  if (reportsError) throw new Error(reportsError.message)

  return {
    tenant: (tenant ?? null) as unknown as Tenant | null,
    reports:
      (reports ?? []) as unknown as Pick<
        RevenueReport,
        'id' | 'month' | 'amount_eur' | 'tx_count' | 'submitted_at' | 'submitted_by' | 'tenant_id' | 'user_id' | 'weeks'
      >[],
  }
}
