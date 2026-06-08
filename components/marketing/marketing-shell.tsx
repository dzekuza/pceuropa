// components/marketing/marketing-shell.tsx — Shared header + footer for public pages
import Link from 'next/link'
import { Building2, LogIn, Menu } from 'lucide-react'
import { PAGES_CONFIG } from '@/lib/page-config'

const NAV_SLUGS = ['about', 'contact', 'events', 'hours'] as const

interface MarketingShellProps {
  children: React.ReactNode
  currentSlug?: string
}

export function MarketingShell({ children, currentSlug }: MarketingShellProps) {
  const navPages = PAGES_CONFIG.filter((p) => NAV_SLUGS.includes(p.slug as (typeof NAV_SLUGS)[number]))

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">PC Europa</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navPages.map((page) => (
              <Link
                key={page.slug}
                href={page.previewUrl}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currentSlug === page.slug
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {page.navLabel}
              </Link>
            ))}
          </nav>

          {/* Login */}
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors shrink-0"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Prisijungti</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PC Europa. Visos teisės saugomos.</p>
          <nav className="flex flex-wrap items-center gap-4">
            {navPages.map((page) => (
              <Link
                key={page.slug}
                href={page.previewUrl}
                className="hover:text-foreground transition-colors"
              >
                {page.navLabel}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
