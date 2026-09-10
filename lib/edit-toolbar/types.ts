export type PageContentMap = Record<string, string>

export type DraftStatus = 'none' | 'editing' | 'ready'

export interface PageContentRow {
  id: string
  page_slug: string
  published_data: PageContentMap
  draft_data: PageContentMap | null
  draft_status: DraftStatus
  updated_at: string
  updated_by: string | null
}
