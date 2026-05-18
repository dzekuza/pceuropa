'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AUTH_STRINGS, SELLER_USERNAME_DOMAIN } from '@/lib/strings'
import { AnimatedLoginForm } from '@/components/ui/animated-characters-login-page'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(identifier: string, password: string) {
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
    <AnimatedLoginForm
      onSubmit={handleLogin}
      isLoading={isLoading}
      error={error}
      strings={{
        title: AUTH_STRINGS.loginTitle,
        subtitle: "Įveskite prisijungimo duomenis",
        usernameLabel: AUTH_STRINGS.usernameLabel,
        usernamePlaceholder: "vartotojas arba el. paštas",
        passwordLabel: AUTH_STRINGS.passwordLabel,
        loginButton: AUTH_STRINGS.loginButton,
        loginInProgress: "Jungiamasi...",
      }}
    />
  )
}

