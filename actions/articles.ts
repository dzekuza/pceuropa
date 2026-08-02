'use server'
// actions/articles.ts — Server Actions for articles CRUD
// Defense-in-depth: each action verifies admin role independently (CVE-2025-29927)
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { articles } from '@/drizzle/schema'
import { getRole } from '@/lib/auth/get-role'
import type { ArticleFormValues } from '@/lib/validations/article'
import type { Article } from '@/types/database'

function toArticle(row: typeof articles.$inferSelect): Article {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    cover_image: row.coverImage,
    category: row.category as Article['category'],
    featured: row.featured,
    published: row.published,
    published_at: row.publishedAt ? row.publishedAt.toISOString() : null,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  }
}

async function requireAdmin(): Promise<boolean> {
  const role = await getRole()
  return role === 'admin'
}

export async function createArticle(
  data: ArticleFormValues
): Promise<{ data: Article } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const now = new Date()
  let created: typeof articles.$inferSelect
  try {
    ;[created] = await db
      .insert(articles)
      .values({
        title: data.title,
        slug: data.slug,
        content: data.content,
        coverImage: data.cover_image,
        category: data.category,
        featured: data.featured,
        published: data.published,
        publishedAt: data.published ? now : null,
      })
      .returning()
  } catch {
    return { error: 'Nepavyko sukurti straipsnio' }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { data: toArticle(created) }
}

export async function updateArticle(
  id: string,
  data: ArticleFormValues,
  wasPublished: boolean
): Promise<{ data: Article } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const now = new Date()
  let updated: typeof articles.$inferSelect
  try {
    ;[updated] = await db
      .update(articles)
      .set({
        title: data.title,
        slug: data.slug,
        content: data.content,
        coverImage: data.cover_image,
        category: data.category,
        featured: data.featured,
        published: data.published,
        // Set published_at only on first publish
        ...(data.published && !wasPublished ? { publishedAt: now } : {}),
        updatedAt: now,
      })
      .where(eq(articles.id, id))
      .returning()
  } catch {
    return { error: 'Nepavyko atnaujinti straipsnio' }
  }

  if (!updated) return { error: 'Nepavyko atnaujinti straipsnio' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  revalidatePath(`/naujienos/${data.slug}`)
  return { data: toArticle(updated) }
}

export async function deleteArticle(
  id: string
): Promise<{ success: true } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  try {
    await db.delete(articles).where(eq(articles.id, id))
  } catch {
    return { error: 'Nepavyko ištrinti straipsnio' }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { success: true }
}

export async function toggleArticlePublished(
  id: string,
  published: boolean,
  wasPublished: boolean
): Promise<{ data: Article } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  const now = new Date()
  let updated: typeof articles.$inferSelect
  try {
    ;[updated] = await db
      .update(articles)
      .set({
        published,
        ...(published && !wasPublished ? { publishedAt: now } : {}),
        updatedAt: now,
      })
      .where(eq(articles.id, id))
      .returning()
  } catch {
    return { error: 'Nepavyko pakeisti būsenos' }
  }

  if (!updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { data: toArticle(updated) }
}

export async function toggleArticleFeatured(
  id: string,
  featured: boolean
): Promise<{ data: Article } | { error: string }> {
  if (!(await requireAdmin())) return { error: 'Neturite teisės atlikti šį veiksmą' }

  let updated: typeof articles.$inferSelect
  try {
    ;[updated] = await db
      .update(articles)
      .set({ featured, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning()
  } catch {
    return { error: 'Nepavyko pakeisti būsenos' }
  }

  if (!updated) return { error: 'Nepavyko pakeisti būsenos' }

  revalidatePath('/admin/articles')
  revalidatePath('/naujienos')
  return { data: toArticle(updated) }
}
