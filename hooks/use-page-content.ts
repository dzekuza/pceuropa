'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isAdminUser } from '@/lib/admin/is-admin'
import type { DraftStatus, PageContentMap } from '@/lib/edit-toolbar/types'

interface UsePageContentResult {
  publishedData: PageContentMap
  draftData: PageContentMap | null
  draftStatus: DraftStatus
  isAdmin: boolean
  isLoading: boolean
  refetch: () => Promise<void>
}

interface PageContentSelectRow {
  published_data?: PageContentMap
  draft_data?: PageContentMap | null
  draft_status?: DraftStatus
}

export function usePageContent(slug: string): UsePageContentResult {
  const [publishedData, setPublishedData] = useState<PageContentMap>({})
  const [draftData, setDraftData] = useState<PageContentMap | null>(null)
  const [draftStatus, setDraftStatus] = useState<DraftStatus>('none')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchContent = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const admin = isAdminUser(userData.user)
    setIsAdmin(admin)

    const columns = admin ? 'published_data, draft_data, draft_status' : 'published_data'
    const { data } = await supabase
      .from('page_content')
      .select(columns)
      .eq('page_slug', slug)
      .maybeSingle()

    const row = data as PageContentSelectRow | null
    setPublishedData(row?.published_data ?? {})
    if (admin) {
      setDraftData(row?.draft_data ?? null)
      setDraftStatus(row?.draft_status ?? 'none')
    } else {
      setDraftData(null)
      setDraftStatus('none')
    }
    setIsLoading(false)
  }, [slug])

  useEffect(() => {
    void fetchContent()
  }, [fetchContent])

  return { publishedData, draftData, draftStatus, isAdmin, isLoading, refetch: fetchContent }
}
