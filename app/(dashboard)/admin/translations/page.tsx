export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/is-admin'
import { getAllTranslatableContent } from '@/app/actions/translations-actions'
import { TranslationsReview } from '@/components/admin/translations-review'

export default async function AdminTranslationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminUser(user)) {
    redirect('/login')
  }

  const content = await getAllTranslatableContent()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Vertimai</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Peržiūrėkite ir redaguokite angliškus (EN) vertimus straipsniams, akcijoms, nuomininkams ir D.U.K.
          Puslapių turinio (banerių, sekcijų) vertimai redaguojami kiekvieno puslapio redaktoriuje
          per LT / EN korteles, skiltyje &bdquo;Puslapiai&ldquo;.
        </p>
      </div>
      <TranslationsReview initialContent={content} />
    </div>
  )
}
