'use server'
// actions/articles.ts — Server Actions for articles CRUD
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ArticleFormValues } from '@/lib/validations/article'
import type { Article } from '@/types/database'

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') return null
  // Use service role client so mutations bypass RLS (no admin INSERT/UPDATE/DELETE policies)
  return createAdminClient()
}

export async function createArticle(
  data: ArticleFormValues
): Promise<{ data: Article } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const now = new Date().toISOString()
  const { data: created, error } = await supabase
    .from('articles')
    .insert({
      title: data.title,
      slug: data.slug,
      content: data.content,
      cover_image: data.cover_image,
      category: data.category,
      featured: data.featured,
      published: data.published,
      published_at: data.published ? now : null,
    })
    .select()
    .single()

  if (error || !created) return { error: 'Nepavyko sukurti straipsnio' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { data: created as Article }
}

export async function updateArticle(
  id: string,
  data: ArticleFormValues,
  wasPublished: boolean
): Promise<{ data: Article } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const now = new Date().toISOString()
  const { data: updated, error } = await supabase
    .from('articles')
    .update({
      title: data.title,
      slug: data.slug,
      content: data.content,
      cover_image: data.cover_image,
      category: data.category,
      featured: data.featured,
      published: data.published,
      // Set published_at only on first publish
      ...(data.published && !wasPublished ? { published_at: now } : {}),
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko atnaujinti straipsnio' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  revalidatePath(`/naujienos/${data.slug}`)
  return { data: updated as Article }
}

export async function deleteArticle(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) return { error: 'Nepavyko ištrinti straipsnio' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { success: true }
}

export async function toggleArticlePublished(
  id: string,
  published: boolean,
  wasPublished: boolean
): Promise<{ data: Article } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const now = new Date().toISOString()
  const { data: updated, error } = await supabase
    .from('articles')
    .update({
      published,
      ...(published && !wasPublished ? { published_at: now } : {}),
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { data: updated as Article }
}

export async function toggleArticleFeatured(
  id: string,
  featured: boolean
): Promise<{ data: Article } | { error: string }> {
  const supabase = await getAdminClient()
  if (!supabase) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const { data: updated, error } = await supabase
    .from('articles')
    .update({ featured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { data: updated as Article }
}
