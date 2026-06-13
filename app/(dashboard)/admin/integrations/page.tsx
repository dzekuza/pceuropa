export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModeranSync } from '@/components/admin/moderan-sync'
import { MODERAN_SYNC_STRINGS as S } from '@/lib/strings'

export default async function AdminIntegrationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{S.pageTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">{S.pageDescription}</p>
      </div>
      <ModeranSync />
    </div>
  )
}
