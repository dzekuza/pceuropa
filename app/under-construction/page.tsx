import { ComingSoonInfiniteMenu } from '@/components/marketing/coming-soon-infinite-menu'

function sanitizeFrom(from: string | undefined): string {
  if (!from || !from.startsWith('/') || from.startsWith('//')) return '/'
  return from
}

export default async function UnderConstructionPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams

  return <ComingSoonInfiniteMenu redirectTo={sanitizeFrom(from)} />
}
