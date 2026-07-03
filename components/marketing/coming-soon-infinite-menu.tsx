'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { Move } from 'lucide-react'
import InfiniteMenu, { type InfiniteMenuItem } from '@/components/marketing/infinite-menu'
import { unlockSite, type UnlockSiteState } from '@/actions/site-lock'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UNDER_CONSTRUCTION_STRINGS as S } from '@/lib/strings'

const initialState: UnlockSiteState = { error: null }

export function ComingSoonInfiniteMenu({
  items,
  redirectTo
}: {
  items: InfiniteMenuItem[]
  redirectTo: string
}) {
  const [showForm, setShowForm] = useState(false)
  const [state, formAction, isPending] = useActionState(unlockSite, initialState)

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Image
        src="/under-construction-bg.jpg"
        alt=""
        fill
        priority
        className="scale-110 object-cover blur-xl"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0">
        <InfiniteMenu items={items} />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 sm:top-6">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 backdrop-blur-sm">
          <Move className="h-4 w-4 text-white/80" />
          <span className="text-xs font-medium text-white/80 sm:text-sm">{S.dragHint}</span>
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 top-0 z-20 flex max-w-sm flex-col gap-4 p-6 sm:p-10">
        <img src="/pc-europa-logo.svg" alt="PC Europa" className="h-8 w-auto self-start sm:h-10" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{S.title}</h1>
        <p className="text-sm text-white/80 sm:text-base">{S.description}</p>

        <div className="pointer-events-auto flex flex-col gap-3">
          {!showForm ? (
            <Button className="self-start" onClick={() => setShowForm(true)}>
              {S.adminLoginButton}
            </Button>
          ) : (
            <form action={formAction} className="flex w-full max-w-xs flex-col gap-3">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Input
                type="password"
                name="password"
                placeholder={S.passwordPlaceholder}
                autoFocus
                required
              />
              {state.error && <p className="text-sm text-red-400">{state.error}</p>}
              <Button type="submit" disabled={isPending} className="self-start">
                {isPending ? S.submitLoading : S.submitButton}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
