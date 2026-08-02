// lib/admin-data.ts — admin dashboard data queries, ported from Supabase
// PostgREST + RPC to Drizzle against the self-hosted Postgres database.
//
// The two aggregate queries (monthly stats, yearly overview) are still
// SECURITY DEFINER Postgres functions — drizzle/rpc-functions.sql already
// ported get_admin_monthly_stats/get_admin_yearly_overview faithfully from
// the live Supabase migrations, self-enforcing check included. Per that
// file's own header, every caller must run `SET LOCAL app.user_role = '<role>'`
// in the same transaction (mirroring what Supabase populated into auth.jwt()
// per request) — withAdminRole() below does exactly that. Every exported
// function here is admin-only (callers already verify the admin role before
// invoking these), so 'admin' is hardcoded rather than threaded through.
import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { revenueReports, tenants } from '@/drizzle/schema'
import { MONTHS_LT, TENANT_CATEGORIES } from '@/lib/constants'
import type { RevenueReport, Tenant } from '@/types/database'

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function withAdminRole<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_role', 'admin', true)`)
    return fn(tx)
  })
}

function toTenantRow(row: typeof tenants.$inferSelect): Tenant {
  return {
    id: row.id,
    store_name: row.storeName,
    operator: row.operator,
    category: row.category,
    space_m2: row.spaceM2 != null ? Number(row.spaceM2) : null,
    rent_eur: row.rentEur != null ? Number(row.rentEur) : null,
    company_code: row.companyCode,
    description: row.description,
    logo_url: row.logoUrl,
    gallery_images: row.galleryImages,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    login_password: row.loginPassword,
    user_id: row.userId,
    weekday_hours: row.weekdayHours,
    saturday_hours: row.saturdayHours,
    sunday_hours: row.sundayHours,
    slug: row.slug,
  }
}

const TENANT_SORT_COLUMNS = {
  store_name: tenants.storeName,
  operator: tenants.operator,
  category: tenants.category,
  created_at: tenants.createdAt,
  rent_eur: tenants.rentEur,
  space_m2: tenants.spaceM2,
} as const

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

export type TenantListRow = Pick<
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
  | 'saturday_hours'
  | 'sunday_hours'
>

export type TenantSubmissionRow = Pick<
  Tenant,
  'id' | 'store_name' | 'operator' | 'category' | 'space_m2' | 'rent_eur'
>

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

type RecentReportRow = Pick<
  RevenueReport,
  'id' | 'amount_eur' | 'tx_count' | 'month' | 'tenant_id' | 'submitted_at'
>

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
  const sort = Object.prototype.hasOwnProperty.call(TENANT_SORT_COLUMNS, searchParams.sort ?? '')
    ? (searchParams.sort as string)
    : 'store_name'
  const direction = searchParams.direction === 'desc' ? 'desc' : 'asc'
  const search = searchParams.search?.trim() ?? ''
  const category =
    searchParams.category && TENANT_CATEGORIES.includes(searchParams.category as (typeof TENANT_CATEGORIES)[number])
      ? searchParams.category
      : ''

  return { page, pageSize, search, category, sort, direction }
}

function buildTenantWhere(state: TenantListState) {
  const conditions = []

  if (state.search) {
    const term = `%${state.search.replace(/,/g, ' ')}%`
    conditions.push(
      or(ilike(tenants.storeName, term), ilike(tenants.operator, term), ilike(tenants.companyCode, term))
    )
  }

  if (state.category) {
    conditions.push(eq(tenants.category, state.category))
  }

  return conditions.length ? and(...conditions) : undefined
}

function tenantOrderBy(state: TenantListState) {
  const sortColumn = TENANT_SORT_COLUMNS[state.sort as keyof typeof TENANT_SORT_COLUMNS] ?? tenants.storeName
  const direction = state.direction === 'asc' ? sql`asc nulls last` : sql`desc nulls last`
  const columns = [sql`${sortColumn} ${direction}`]
  if (state.sort !== 'store_name') {
    columns.push(sql`${tenants.storeName} asc`)
  }
  return columns
}

export async function getAdminTenantList(
  searchParams: TenantListSearchParams
): Promise<{
  tenants: TenantListRow[]
  totalCount: number
  pageCount: number
  state: TenantListState
}> {
  const state = parseTenantListState(searchParams)
  const from = (state.page - 1) * state.pageSize
  const where = buildTenantWhere(state)

  return withAdminRole(async (tx) => {
    const [rows, countResult] = await Promise.all([
      tx
        .select()
        .from(tenants)
        .where(where)
        .orderBy(...tenantOrderBy(state))
        .limit(state.pageSize)
        .offset(from),
      tx.select({ count: sql<number>`count(*)::int` }).from(tenants).where(where),
    ])

    const totalCount = countResult[0]?.count ?? 0
    const pageCount = Math.max(1, Math.ceil(totalCount / state.pageSize))

    return {
      tenants: rows.map(toTenantRow),
      totalCount,
      pageCount,
      state: { ...state, page: Math.min(state.page, pageCount) },
    }
  })
}

export async function getAdminTenantExportRows(searchParams: TenantListSearchParams): Promise<TenantListRow[]> {
  const state = parseTenantListState(searchParams)
  const where = buildTenantWhere(state)

  return withAdminRole(async (tx) => {
    const rows = await tx
      .select()
      .from(tenants)
      .where(where)
      .orderBy(...tenantOrderBy(state))
    return rows.map(toTenantRow)
  })
}

export async function getAdminHomeData(): Promise<AdminHomeData> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentMonthDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
  const currentMonthLabel = `${MONTHS_LT[currentMonth - 1]} ${currentYear}`
  const startOfLastYear = `${currentYear - 1}-01-01`
  const yearStartDate = `${currentYear}-01-01`
  const lastYearSameMonth = `${currentYear - 1}-${String(currentMonth).padStart(2, '0')}-01`

  return withAdminRole(async (tx) => {
    const [monthlyStatsRaw, recentReportsRows, recentTenantsRows, tenantCountResult] = await Promise.all([
      tx.execute<{ month_date: string; total_revenue: string; total_tx: number; submission_count: number }>(
        sql`select * from get_admin_monthly_stats(${startOfLastYear})`
      ),
      tx
        .select({
          id: revenueReports.id,
          amountEur: revenueReports.amountEur,
          txCount: revenueReports.txCount,
          month: revenueReports.month,
          tenantId: revenueReports.tenantId,
          submittedAt: revenueReports.submittedAt,
        })
        .from(revenueReports)
        .orderBy(sql`${revenueReports.submittedAt} desc nulls last`, desc(revenueReports.month))
        .limit(10),
      tx
        .select({
          id: tenants.id,
          storeName: tenants.storeName,
          operator: tenants.operator,
          createdAt: tenants.createdAt,
        })
        .from(tenants)
        .orderBy(desc(tenants.createdAt))
        .limit(7),
      tx.select({ count: sql<number>`count(*)::int` }).from(tenants),
    ])

    const monthlyStats: MonthlyStatsRow[] = monthlyStatsRaw.rows.map((row) => ({
      month_date: row.month_date,
      total_revenue: Number(row.total_revenue),
      total_tx: Number(row.total_tx),
      submission_count: Number(row.submission_count),
    }))
    const recentReports: RecentReportRow[] = recentReportsRows.map((r) => ({
      id: r.id,
      amount_eur: Number(r.amountEur),
      tx_count: r.txCount,
      month: r.month,
      tenant_id: r.tenantId,
      submitted_at: r.submittedAt ? r.submittedAt.toISOString() : null,
    }))
    const recentTenants = recentTenantsRows.map((t) => ({
      id: t.id,
      store_name: t.storeName,
      operator: t.operator,
      created_at: t.createdAt ? t.createdAt.toISOString() : null,
    }))
    const tenantCount = tenantCountResult[0]?.count ?? 0

    const reportTenantIds = [...new Set(recentReports.map((report) => report.tenant_id).filter(Boolean))] as string[]
    const tenantNameMap = new Map<string, string>()
    if (reportTenantIds.length > 0) {
      const reportTenants = await tx
        .select({ id: tenants.id, storeName: tenants.storeName })
        .from(tenants)
        .where(inArray(tenants.id, reportTenantIds))
      for (const tenant of reportTenants) {
        tenantNameMap.set(tenant.id, tenant.storeName)
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
      lastYearSameMonthRevenue > 0
        ? Math.round(((totalRevenue - lastYearSameMonthRevenue) / lastYearSameMonthRevenue) * 100)
        : 0
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
  })
}

export async function getAdminOverviewData(year: number): Promise<AdminOverviewData> {
  return withAdminRole(async (tx) => {
    const [tenantRows, overviewRaw] = await Promise.all([
      tx
        .select({ id: tenants.id, storeName: tenants.storeName, category: tenants.category })
        .from(tenants)
        .orderBy(tenants.category, tenants.storeName),
      tx.execute<{
        tenant_id: string
        store_name: string
        category: string | null
        month_date: string
        total_revenue: string
        total_tx: number
      }>(sql`select * from get_admin_yearly_overview(${year})`),
    ])

    const overviewRows: OverviewAggregateRow[] = overviewRaw.rows.map((row) => ({
      tenant_id: row.tenant_id,
      store_name: row.store_name,
      category: row.category,
      month_date: row.month_date,
      total_revenue: Number(row.total_revenue),
      total_tx: Number(row.total_tx),
    }))

    return {
      tenants: tenantRows.map((t) => ({ id: t.id, store_name: t.storeName, category: t.category })),
      reports: overviewRows.map((row) => ({
        tenant_id: row.tenant_id,
        month: row.month_date,
        amount_eur: row.total_revenue,
        tx_count: row.total_tx,
      })),
    }
  })
}

export async function getAdminAnalyticsData(year: number, month: number | null): Promise<AdminAnalyticsData> {
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

  return withAdminRole(async (tx) => {
    const [tenantRows, overviewRaw, prevStatsRaw] = await Promise.all([
      tx
        .select({
          id: tenants.id,
          storeName: tenants.storeName,
          operator: tenants.operator,
          category: tenants.category,
          spaceM2: tenants.spaceM2,
          rentEur: tenants.rentEur,
        })
        .from(tenants)
        .orderBy(tenants.storeName),
      tx.execute<{
        tenant_id: string
        store_name: string
        category: string | null
        month_date: string
        total_revenue: string
        total_tx: number
      }>(sql`select * from get_admin_yearly_overview(${year})`),
      tx.execute<{ month_date: string; total_revenue: string; total_tx: number; submission_count: number }>(
        sql`select * from get_admin_monthly_stats(${prevFromDate})`
      ),
    ])

    const tenants_: TenantSubmissionRow[] = tenantRows.map((t) => ({
      id: t.id,
      store_name: t.storeName,
      operator: t.operator,
      category: t.category,
      space_m2: t.spaceM2 != null ? Number(t.spaceM2) : null,
      rent_eur: t.rentEur != null ? Number(t.rentEur) : null,
    }))
    const tenantCount = tenants_.length
    const overviewRows: OverviewAggregateRow[] = overviewRaw.rows.map((row) => ({
      tenant_id: row.tenant_id,
      store_name: row.store_name,
      category: row.category,
      month_date: row.month_date,
      total_revenue: Number(row.total_revenue),
      total_tx: Number(row.total_tx),
    }))
    const rangeMonths = new Set(parseMonthRange(fromDate, toDate))
    const filteredOverview = overviewRows.filter((row) => rangeMonths.has(row.month_date))
    const prevRows = prevStatsRaw.rows
      .map((row) => ({
        month_date: row.month_date,
        total_revenue: Number(row.total_revenue),
        total_tx: Number(row.total_tx),
        submission_count: Number(row.submission_count),
      }))
      .filter((row) => row.month_date >= prevFromDate && row.month_date <= prevToDate)

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
      overviewRows.filter((row) => row.month_date === currentMonthStr).map((row) => row.tenant_id)
    )
    const submitted = tenants_.filter((tenant) => submittedTenantIds.has(tenant.id))
    const pending = tenants_.filter((tenant) => !submittedTenantIds.has(tenant.id))
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
  })
}

export async function getAdminTenantDetail(
  tenantId: string,
  year: number
): Promise<{
  tenant: Tenant | null
  reports: Pick<RevenueReport, 'id' | 'month' | 'amount_eur' | 'tx_count' | 'submitted_at' | 'submitted_by' | 'tenant_id' | 'user_id' | 'weeks'>[]
}> {
  return withAdminRole(async (tx) => {
    const [tenantRows, reportRows] = await Promise.all([
      tx.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1),
      tx
        .select({
          id: revenueReports.id,
          month: revenueReports.month,
          amountEur: revenueReports.amountEur,
          txCount: revenueReports.txCount,
          submittedAt: revenueReports.submittedAt,
          submittedBy: revenueReports.submittedBy,
          tenantId: revenueReports.tenantId,
          userId: revenueReports.userId,
          weeks: revenueReports.weeks,
        })
        .from(revenueReports)
        .where(
          and(
            eq(revenueReports.tenantId, tenantId),
            gte(revenueReports.month, `${year}-01-01`),
            lte(revenueReports.month, `${year}-12-31`)
          )
        )
        .orderBy(revenueReports.month),
    ])

    return {
      tenant: tenantRows[0] ? toTenantRow(tenantRows[0]) : null,
      reports: reportRows.map((r) => ({
        id: r.id,
        month: r.month,
        amount_eur: Number(r.amountEur),
        tx_count: r.txCount,
        submitted_at: r.submittedAt ? r.submittedAt.toISOString() : null,
        submitted_by: r.submittedBy,
        tenant_id: r.tenantId,
        user_id: r.userId,
        weeks: r.weeks as RevenueReport['weeks'],
      })),
    }
  })
}
