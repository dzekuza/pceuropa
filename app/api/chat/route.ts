// app/api/chat/route.ts — Admin AI chat: Gemini 2.5 Flash with live DB context
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { eq, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { tenants as tenantsTable, revenueReports } from '@/drizzle/schema'
import { google } from '@ai-sdk/google'
import { streamText, convertToModelMessages } from 'ai'
import type { Database } from '@/types/database'

type TenantRow = Pick<
  Database['public']['Tables']['tenants']['Row'],
  'id' | 'store_name' | 'operator' | 'company_code' | 'category' | 'space_m2' | 'rent_eur' | 'description'
>
type RevenueRow = Pick<
  Database['public']['Tables']['revenue_reports']['Row'],
  'tenant_id' | 'month' | 'amount_eur' | 'tx_count'
>

function buildSystemPrompt(tenants: TenantRow[], revenue: RevenueRow[]): string {
  const today = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Build per-tenant revenue summary
  const revenueByTenant = revenue.reduce<Record<string, { totalEur: number; months: string[] }>>(
    (acc, r) => {
      const key = r.tenant_id ?? 'unknown'
      if (!acc[key]) acc[key] = { totalEur: 0, months: [] }
      acc[key].totalEur += r.amount_eur
      acc[key].months.push(`${r.month}: €${r.amount_eur.toLocaleString('lt-LT')} (${r.tx_count ?? 0} sandorių)`)
      return acc
    },
    {}
  )

  const tenantSummaries = tenants.map((t) => {
    const rev = revenueByTenant[t.id]
    return {
      id: t.id,
      parduotuvė: t.store_name,
      operatorius: t.operator ?? '—',
      įmonėsKodas: t.company_code ?? '—',
      kategorija: t.category ?? '—',
      plotasM2: t.space_m2 ?? '—',
      nuomaEurMėn: t.rent_eur ?? '—',
      aprašymas: t.description ?? '—',
      pajamosVisoEur: rev ? rev.totalEur : 0,
      pajamosVisoFormatas: rev
        ? `€${rev.totalEur.toLocaleString('lt-LT')}`
        : 'nera duomenu',
      pajamosPoMenesius: rev ? rev.months : [],
    }
  })

  const totalMonthlyRent = tenants.reduce((s, t) => s + (t.rent_eur ?? 0), 0)
  const totalRevenue = Object.values(revenueByTenant).reduce((s, r) => s + r.totalEur, 0)

  return `Tu esi PCEuropa prekybos centro administracinė AI asistentė. Šiandien yra ${today}.

## Tavo vaidmuo
Padedi administracijos darbuotojams greitai rasti informaciją apie nuomininkus, pajamas, nuomą ir vykdomą veiklą.
Atsakyk tiksliai, dalykiškai ir trumpai. Jei reikia, naudok skaičius ir konkrečius faktus iš duomenų bazės.
Visada atsakyk lietuviškai.

## Bendra statistika
- Iš viso nuomininkų: ${tenants.length}
- Bendra mėnesinė nuoma: €${totalMonthlyRent.toLocaleString('lt-LT')}
- Visos registruotos pajamos (istoriškai): €${totalRevenue.toLocaleString('lt-LT')}

## Nuomininkų duomenys (visi)
${JSON.stringify(tenantSummaries, null, 2)}

## Instrukcijos
- Jei klausiama apie konkretų nuomininką, pateik tikslią informaciją.
- Jei klausiama apie pajamas, pateik mėnesio/metų suvestinę.
- Neminėk "duomenų bazės" ar "JSON" — kalbėk kaip apie realius faktus.
- Jei duomenų nėra, pasakyk "šiam laikotarpiui duomenų nėra".
`
}

function buildSellerSystemPrompt(tenant: TenantRow, revenue: RevenueRow[]): string {
  const today = new Date().toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const months = revenue.map(
    (r) => `${r.month}: €${r.amount_eur.toLocaleString('lt-LT')} (${r.tx_count ?? 0} čekių)`,
  )
  const totalRevenue = revenue.reduce((s, r) => s + r.amount_eur, 0)

  const summary = {
    parduotuvė: tenant.store_name,
    operatorius: tenant.operator ?? '—',
    kategorija: tenant.category ?? '—',
    plotasM2: tenant.space_m2 ?? '—',
    nuomaEurMėn: tenant.rent_eur ?? '—',
    pajamosVisoEur: totalRevenue,
    pajamosVisoFormatas: `€${totalRevenue.toLocaleString('lt-LT')}`,
    pajamosPoMenesius: months,
  }

  return `Tu esi PCEuropa nuomininkų portalo AI asistentė parduotuvei "${tenant.store_name}". Šiandien yra ${today}.

## Tavo vaidmuo
Padedi šios parduotuvės atstovui suprasti savo apyvartos ir čekių duomenis.
Atsakyk tiksliai, dalykiškai ir trumpai. Visada atsakyk lietuviškai.

## Šios parduotuvės duomenys
${JSON.stringify(summary, null, 2)}

## Instrukcijos
- Kalbėk TIK apie šios parduotuvės duomenis.
- Jei klausiama apie kitas parduotuves ar bendrą prekybos centro statistiką — mandagiai paaiškink, kad turi prieigą tik prie šios parduotuvės duomenų.
- Neminėk "duomenų bazės" ar "JSON" — kalbėk kaip apie realius faktus.
- Jei duomenų nėra, pasakyk "šiam laikotarpiui duomenų nėra".
`
}

const TENANT_COLUMNS = {
  id: tenantsTable.id,
  store_name: tenantsTable.storeName,
  operator: tenantsTable.operator,
  company_code: tenantsTable.companyCode,
  category: tenantsTable.category,
  space_m2: tenantsTable.spaceM2,
  rent_eur: tenantsTable.rentEur,
  description: tenantsTable.description,
} as const

const REVENUE_COLUMNS = {
  tenant_id: revenueReports.tenantId,
  month: revenueReports.month,
  amount_eur: revenueReports.amountEur,
  tx_count: revenueReports.txCount,
} as const

function toTenantRow(row: {
  id: string
  store_name: string
  operator: string | null
  company_code: string | null
  category: string | null
  space_m2: string | null
  rent_eur: string | null
  description: string | null
}): TenantRow {
  return {
    ...row,
    space_m2: row.space_m2 === null ? null : Number(row.space_m2),
    rent_eur: row.rent_eur === null ? null : Number(row.rent_eur),
  }
}

function toRevenueRow(row: {
  tenant_id: string | null
  month: string
  amount_eur: string
  tx_count: number | null
}): RevenueRow {
  return { ...row, amount_eur: Number(row.amount_eur) }
}

export async function POST(req: Request) {
  const session = await auth()
  const user = session?.user
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const role = user.role
  if (role !== 'admin' && role !== 'seller') {
    return new Response('Forbidden', { status: 403 })
  }

  const { messages } = await req.json()

  let systemPrompt: string
  if (role === 'admin') {
    // Admin: full-center context.
    const [tenantRows, revenueRows] = await Promise.all([
      db.select(TENANT_COLUMNS).from(tenantsTable).orderBy(tenantsTable.storeName),
      db
        .select(REVENUE_COLUMNS)
        .from(revenueReports)
        .orderBy(desc(revenueReports.month))
        .limit(120),
    ])
    systemPrompt = buildSystemPrompt(tenantRows.map(toTenantRow), revenueRows.map(toRevenueRow))
  } else {
    // Seller: scope strictly to their own tenant.
    // NOTE: user.id is typed optional per next-auth's DefaultUser — see final
    // report re: lib/auth/auth.config.ts's session() callback not currently
    // setting session.user.id = token.sub.
    if (!user.id) {
      return new Response('Forbidden', { status: 403 })
    }
    const [tenantRow] = await db
      .select(TENANT_COLUMNS)
      .from(tenantsTable)
      .where(eq(tenantsTable.userId, user.id))
      .limit(1)
    if (!tenantRow) {
      return new Response('Forbidden', { status: 403 })
    }
    const tenant = toTenantRow(tenantRow)
    const revenueRows = await db
      .select(REVENUE_COLUMNS)
      .from(revenueReports)
      .where(eq(revenueReports.tenantId, tenant.id))
      .orderBy(desc(revenueReports.month))
      .limit(120)
    systemPrompt = buildSellerSystemPrompt(tenant, revenueRows.map(toRevenueRow))
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.3,
  })

  return result.toUIMessageStreamResponse()
}
