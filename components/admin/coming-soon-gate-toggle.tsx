'use client'

import { useState, useTransition } from 'react'
import { setComingSoonEnabled } from '@/app/actions/site-settings-actions'
import { SITE_SETTINGS_STRINGS as S } from '@/lib/strings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ComingSoonGateToggleProps {
  initialEnabled: boolean
}

export function ComingSoonGateToggle({ initialEnabled }: ComingSoonGateToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    setEnabled(next)
    setError(null)
    startTransition(async () => {
      const result = await setComingSoonEnabled(next)
      if (result.error) {
        setError(result.error)
        setEnabled(!next)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{S.gateSectionTitle}</CardTitle>
        <CardDescription>{S.gateSectionDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Switch
            id="coming-soon-gate"
            checked={enabled}
            disabled={isPending}
            onCheckedChange={handleChange}
          />
          <Label htmlFor="coming-soon-gate">{S.gateToggleLabel}</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {enabled ? S.gateEnabledStatus : S.gateDisabledStatus}
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  )
}
