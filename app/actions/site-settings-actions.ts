'use server'
// app/actions/site-settings-actions.ts — admin toggle for the public "coming soon" gate

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/is-admin'

export async function getComingSoonEnabled(): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('coming_soon_enabled')
    .eq('id', true)
    .maybeSingle()
  return data?.coming_soon_enabled ?? true
}

export async function setComingSoonEnabled(enabled: boolean): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminUser(user)) {
    return { error: 'Neturite teisių atlikti šį veiksmą.' }
  }

  const { error } = await supabase
    .from('site_settings')
    .update({ coming_soon_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) {
    return { error: 'Nepavyko atnaujinti nustatymo. Bandykite dar kartą.' }
  }

  revalidatePath('/', 'layout')
  return { error: null }
}
