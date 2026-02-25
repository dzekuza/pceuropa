// app/page.tsx — Root page redirect
// Redirects to /login; proxy.ts middleware will redirect authenticated users to their dashboard
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/login')
}
