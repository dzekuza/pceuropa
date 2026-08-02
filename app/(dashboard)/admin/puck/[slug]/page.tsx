import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { puckPages } from '@/drizzle/schema'
import { PuckEditor } from '@/components/admin/puck-editor'
import type { Data } from '@measured/puck'

// Default/fallback banner images were seeded on the legacy Supabase project and
// never migrated to the current one — matches the DEFAULT_BANNER_SLIDES host used
// by every public marketing page (e.g. app/(marketing)/dialogai/page.tsx).
const BASE = '/api/storage/marketing-assets'

const ALLOWED_SLUGS = new Set([
  'landing', 'akcijos', 'dialogai', 'restoranai',
  'parduotuves', 'sportas', 'laisvalaikis', 'darbo-laikas', 'lankytojams', 'naujienos', 'nuoma-reklama',
])

const DEFAULT_DATA: Record<string, Data> = {
  landing: {
    content: [
      { type: 'Hero', props: { id: 'hero-1', title: '', subtitle: '' } },
      { type: 'QuickLinks', props: { id: 'quicklinks-1' } },
      { type: 'CategoriesSection', props: { id: 'categories-1' } },
      { type: 'ActivitiesSection', props: { id: 'activities-1' } },
      { type: 'PartnerLogos', props: { id: 'partners-1' } },
      { type: 'NewsSection', props: { id: 'news-1' } },
      { type: 'SocialSection', props: { id: 'social-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  akcijos: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-akcijos-1.jpg`, slide2: `${BASE}/banner-akcijos-2.jpg`, slide3: '', slide4: '' } },
      { type: 'AkcijosGridBlock', props: { id: 'akcijos-grid-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  dialogai: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-dialogai-1.jpg`, slide2: `${BASE}/banner-dialogai-2.jpg`, slide3: `${BASE}/banner-dialogai-3.jpg`, slide4: '' } },
      { type: 'DialogaiFoodCourtBlock', props: { id: 'dialogai-fc-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  restoranai: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-restoranai-1.jpg`, slide2: `${BASE}/banner-restoranai-2.jpg`, slide3: `${BASE}/banner-restoranai-3.jpg`, slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  parduotuves: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-parduotuves-wide.jpg`, slide2: '', slide3: '', slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  sportas: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-sportas-carousel.jpg`, slide2: '', slide3: '', slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  laisvalaikis: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/hero-bg.jpg`, slide2: `${BASE}/activities-coffee.jpg`, slide3: '', slide4: '' } },
      { type: 'StoresDirectoryBlock', props: { id: 'stores-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  'darbo-laikas': {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: '', slide2: '', slide3: '', slide4: '' } },
      { type: 'OpeningHoursBlock', props: { id: 'hours-1' } },
      { type: 'HowToGetHereBlock', props: { id: 'directions-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  lankytojams: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: '', slide2: '', slide3: '', slide4: '' } },
      { type: 'LankytojamsBlock', props: { id: 'visitor-1' } },
    ],
    root: { props: {} },
    zones: {},
  },
  naujienos: {
    content: [
      { type: 'PageBanner', props: { id: 'banner-1', slide1: `${BASE}/banner-akcijos-1.jpg`, slide2: `${BASE}/banner-akcijos-2.jpg`, slide3: '', slide4: '' } },
    ],
    root: { props: {} },
    zones: {},
  },
  'nuoma-reklama': {
    content: [
      { type: 'NuomaReklamaBanner', props: { id: 'banner-1', cover: `${BASE}/nuoma-reklama/banner.jpg` } },
    ],
    root: { props: {} },
    zones: {},
  },
}

const FALLBACK_DATA: Data = { content: [], root: { props: {} }, zones: {} }

const PREVIEW_URLS: Record<string, string> = {
  landing: '/',
  akcijos: '/akcijos',
  dialogai: '/dialogai',
  restoranai: '/restoranai',
  parduotuves: '/parduotuves',
  sportas: '/sportas',
  laisvalaikis: '/laisvalaikis',
  'darbo-laikas': '/darbo-laikas',
  lankytojams: '/lankytojams',
  naujienos: '/naujienos',
  'nuoma-reklama': '/nuoma-reklama',
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AdminPuckEditorPage({ params }: Props) {
  const { slug } = await params

  if (!ALLOWED_SLUGS.has(slug)) notFound()

  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login')
  }

  const [row] = await db
    .select({ data: puckPages.data })
    .from(puckPages)
    .where(eq(puckPages.pageSlug, slug))
    .limit(1)

  const savedData = (row?.data as Data | undefined) ?? null
  const initialData = savedData ?? DEFAULT_DATA[slug] ?? FALLBACK_DATA

  return (
    <PuckEditor
      data={initialData}
      pageSlug={slug}
      previewUrl={PREVIEW_URLS[slug]}
    />
  )
}
