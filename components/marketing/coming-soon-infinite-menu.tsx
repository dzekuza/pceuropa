'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { unlockSite, type UnlockSiteState } from '@/actions/site-lock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UNDER_CONSTRUCTION_STRINGS as S } from '@/lib/strings'

const initialState: UnlockSiteState = { error: null }

export function ComingSoonInfiniteMenu({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, isPending] = useActionState(unlockSite, initialState)

  // Navigate here instead of inside the Server Action — calling redirect() from
  // an action bound to useActionState throws mid-transition and triggers
  // React's "useInsertionEffect must not schedule updates" error.
  useEffect(() => {
    if (!state.error && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state, router])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Image src="/under-construction-bg.jpg" alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-20 flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <img src="/pc-europa-logo.svg" alt="PC Europa" className="h-8 w-auto sm:h-10" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{S.title}</h1>
        <p className="max-w-sm text-sm text-white/80 sm:text-base">{S.description}</p>

        <div className="flex flex-col items-center gap-3">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)}>{S.adminLoginButton}</Button>
          ) : (
            <form action={formAction} className="flex w-full max-w-xs flex-col items-center gap-3">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Input
                type="password"
                name="password"
                placeholder={S.passwordPlaceholder}
                autoFocus
                required
              />
              {state.error && <p className="text-sm text-red-400">{state.error}</p>}
              <Button type="submit" disabled={isPending}>
                {isPending ? S.submitLoading : S.submitButton}
              </Button>
            </form>
          )}
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-6 z-20 px-6 text-center text-xs text-white/70 sm:text-sm">
        {S.contactGeneralLabel}:{' '}
        <a href={`mailto:${S.contactEmail}`} className="underline underline-offset-2 hover:text-white">
          {S.contactEmail}
        </a>
        {', '}
        <a href={`tel:${S.contactPhone.replace(/\s/g, '')}`} className="underline underline-offset-2 hover:text-white">
          {S.contactPhone}
        </a>
        {' · '}
        {S.contactSecurityLabel}:{' '}
        <a href={`tel:${S.contactSecurityPhone.replace(/\s/g, '')}`} className="underline underline-offset-2 hover:text-white">
          {S.contactSecurityPhone}
        </a>
      </p>
    </div>
  )
}
