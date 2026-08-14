export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/is-admin'
import { getComingSoonEnabled } from '@/app/actions/site-settings-actions'
import { ComingSoonGateToggle } from '@/components/admin/coming-soon-gate-toggle'
import { SITE_SETTINGS_STRINGS as S } from '@/lib/strings'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminUser(user)) {
    redirect('/login')
  }

  const comingSoonEnabled = await getComingSoonEnabled()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">{S.pageTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">{S.pageDescription}</p>
      </div>
      <ComingSoonGateToggle initialEnabled={comingSoonEnabled} />
    </div>
  )
}
