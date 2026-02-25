'use client'
// app/login/page.tsx — Single login page for admin and seller roles
// Based on shadcn login-03 block: split layout with form + branded panel
// All labels in Lithuanian (SHLL-04)
// AUTH-01: Admin login with email; AUTH-02: Seller login with username

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { AUTH_STRINGS, SELLER_USERNAME_DOMAIN } from '@/lib/strings'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Seller username-to-email mapping:
    // If the identifier has no '@', it is a seller username — append @pceuropa.lt
    // Admin users log in with their full email address (contains '@')
    const email = identifier.includes('@')
      ? identifier
      : `${identifier}${SELLER_USERNAME_DOMAIN}`

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !data.user) {
      setError(AUTH_STRINGS.loginError)
      setIsLoading(false)
      return
    }

    const role = data.user.app_metadata?.role
    router.push(role === 'admin' ? '/admin' : '/seller')
  }

  return (
    <div className="flex min-h-svh">
      {/* Login form side */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold tracking-tight">PC EUROPA</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{AUTH_STRINGS.loginTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="identifier">
                      {AUTH_STRINGS.usernameLabel}
                    </FieldLabel>
                    <Input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="vartotojas arba el. paštas"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">
                      {AUTH_STRINGS.passwordLabel}
                    </FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  {error && (
                    <p className="text-destructive text-sm text-center">{error}</p>
                  )}
                  <Field>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? 'Jungiamasi...' : AUTH_STRINGS.loginButton}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Branded panel side — visible on md+ screens */}
      <div className="bg-primary text-primary-foreground hidden md:flex flex-1 flex-col items-center justify-center p-10">
        <div className="max-w-xs text-center">
          <h1 className="text-4xl font-bold mb-4">PC EUROPA</h1>
          <p className="text-primary-foreground/80 text-lg">
            Nuomos valdymo sistema
          </p>
          <p className="text-primary-foreground/60 text-sm mt-6">
            Nuomininkų administravimas ir apyvartos stebėjimas vienoje vietoje.
          </p>
        </div>
      </div>
    </div>
  )
}
