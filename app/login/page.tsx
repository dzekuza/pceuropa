'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
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

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (!result || result.error) {
      setError(AUTH_STRINGS.loginError)
      setIsLoading(false)
      return
    }

    // The signed-in role isn't available client-side from `signIn`'s result —
    // re-fetch the session to read it back off the JWT we just minted.
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    router.push(session?.user?.role === 'admin' ? '/admin' : '/seller')
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

