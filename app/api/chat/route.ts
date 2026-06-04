// app/api/chat/route.ts — Admin AI chat: Gemini 2.5 Flash with live DB context
export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  if (user.app_metadata?.role !== 'admin') {
    return new Response('Forbidden', { status: 403 })
  }

  const { messages } = await req.json()

  const admin = createAdminClient()
  const [{ data: tenants }, { data: revenue }] = await Promise.all([
    admin
      .from('tenants')
      .select('id, store_name, operator, company_code, category, space_m2, rent_eur, description')
      .order('store_name'),
    admin
      .from('revenue_reports')
      .select('tenant_id, month, amount_eur, tx_count')
      .order('month', { ascending: false })
      .limit(120),
  ])

  const systemPrompt = buildSystemPrompt(tenants ?? [], revenue ?? [])

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    temperature: 0.3,
  })

  return result.toUIMessageStreamResponse()
}
