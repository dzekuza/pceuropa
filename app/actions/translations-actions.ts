'use server'
// app/actions/translations-actions.ts — bulk EN translation review for admin dashboard.
// Covers the flat, DB-backed translatable fields (articles, promos, tenants, faq_items).
// CMS page-builder content (puck_pages) is edited per-page at /admin/content/[slug]
// (already has its own LT/EN tabs) rather than duplicated here.

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isAdminUser } from '@/lib/admin/is-admin'

export interface TranslatableArticle {
  id: string
  title: string
  title_en: string | null
  content: string
  content_en: string | null
}

export interface TranslatablePromo {
  id: string
  title: string
  title_en: string | null
  content: string
  content_en: string | null
}

export interface TranslatableTenant {
  id: string
  store_name: string
  store_name_en: string | null
  description: string | null
  description_en: string | null
  category: string | null
  category_en: string | null
}

export interface TranslatableFaqItem {
  id: string
  question: string
  question_en: string | null
  answer: string
  answer_en: string | null
}

export interface TranslatableContent {
  articles: TranslatableArticle[]
  promos: TranslatablePromo[]
  tenants: TranslatableTenant[]
  faqItems: TranslatableFaqItem[]
}

export async function getAllTranslatableContent(): Promise<TranslatableContent> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminUser(user)) {
    return { articles: [], promos: [], tenants: [], faqItems: [] }
  }

  const [articlesRes, promosRes, tenantsRes, faqRes] = await Promise.all([
    supabase.from('articles').select('id, title, title_en, content, content_en').order('created_at', { ascending: false }),
    supabase.from('promos').select('id, title, title_en, content, content_en').order('created_at', { ascending: false }),
    supabase.from('tenants').select('id, store_name, store_name_en, description, description_en, category, category_en').order('store_name'),
    supabase.from('faq_items').select('id, question, question_en, answer, answer_en').order('sort_order'),
  ])

  return {
    articles: articlesRes.data ?? [],
    promos: promosRes.data ?? [],
    tenants: tenantsRes.data ?? [],
    faqItems: faqRes.data ?? [],
  }
}

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isAdminUser(user)) {
    return { supabase: null, error: 'Neturite teisių atlikti šį veiksmą.' } as const
  }
  return { supabase, error: null } as const
}

export async function updateArticleTranslation(
  id: string,
  fields: { title_en: string; content_en: string }
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin()
  if (!supabase) return { error: authError }

  const { error } = await supabase
    .from('articles')
    .update({ title_en: fields.title_en || null, content_en: fields.content_en || null })
    .eq('id', id)

  if (error) return { error: 'Nepavyko išsaugoti vertimo.' }
  revalidatePath('/en/naujienos')
  return { error: null }
}

export async function updatePromoTranslation(
  id: string,
  fields: { title_en: string; content_en: string }
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin()
  if (!supabase) return { error: authError }

  const { error } = await supabase
    .from('promos')
    .update({ title_en: fields.title_en || null, content_en: fields.content_en || null })
    .eq('id', id)

  if (error) return { error: 'Nepavyko išsaugoti vertimo.' }
  revalidatePath('/en/akcijos')
  return { error: null }
}

export async function updateTenantTranslation(
  id: string,
  fields: { store_name_en: string; description_en: string; category_en: string }
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin()
  if (!supabase) return { error: authError }

  const { error } = await supabase
    .from('tenants')
    .update({
      store_name_en: fields.store_name_en || null,
      description_en: fields.description_en || null,
      category_en: fields.category_en || null,
    })
    .eq('id', id)

  if (error) return { error: 'Nepavyko išsaugoti vertimo.' }
  revalidatePath('/en/parduotuves')
  return { error: null }
}

export async function updateFaqTranslation(
  id: string,
  fields: { question_en: string; answer_en: string }
): Promise<{ error: string | null }> {
  const { supabase, error: authError } = await requireAdmin()
  if (!supabase) return { error: authError }

  const { error } = await supabase
    .from('faq_items')
    .update({ question_en: fields.question_en || null, answer_en: fields.answer_en || null })
    .eq('id', id)

  if (error) return { error: 'Nepavyko išsaugoti vertimo.' }
  return { error: null }
}
