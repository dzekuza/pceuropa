'use client'
// components/admin/translations-review.tsx — bulk EN-translation review/edit table
// for the flat DB-backed translatable content (articles, promos, tenants, FAQ).

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Save, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  type TranslatableContent,
  updateArticleTranslation,
  updatePromoTranslation,
  updateTenantTranslation,
  updateFaqTranslation,
} from '@/app/actions/translations-actions'

interface TranslationsReviewProps {
  initialContent: TranslatableContent
}

type RowStatus = 'success' | 'error' | undefined

export function TranslationsReview({ initialContent }: TranslationsReviewProps) {
  return (
    <Accordion type="multiple" defaultValue={['articles', 'promos', 'tenants', 'faq']} className="rounded-lg border px-4">
      <AccordionItem value="articles">
        <AccordionTrigger>Straipsniai ({initialContent.articles.length})</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {initialContent.articles.length === 0 && <EmptyState />}
          {initialContent.articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="promos">
        <AccordionTrigger>Akcijos ({initialContent.promos.length})</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {initialContent.promos.length === 0 && <EmptyState />}
          {initialContent.promos.map((promo) => (
            <PromoRow key={promo.id} promo={promo} />
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tenants">
        <AccordionTrigger>Nuomininkai ({initialContent.tenants.length})</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {initialContent.tenants.length === 0 && <EmptyState />}
          {initialContent.tenants.map((tenant) => (
            <TenantRow key={tenant.id} tenant={tenant} />
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="faq">
        <AccordionTrigger>D.U.K. ({initialContent.faqItems.length})</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {initialContent.faqItems.length === 0 && <EmptyState />}
          {initialContent.faqItems.map((item) => (
            <FaqRow key={item.id} item={item} />
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function EmptyState() {
  return <p className="text-sm text-muted-foreground py-2">Įrašų nėra.</p>
}

function RowStatusIcon({ status }: { status: RowStatus }) {
  if (status === 'success') {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Išsaugota
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        Nepavyko išsaugoti
      </span>
    )
  }
  return null
}

function ArticleRow({ article }: { article: TranslatableContent['articles'][number] }) {
  const [titleEn, setTitleEn] = useState(article.title_en ?? '')
  const [contentEn, setContentEn] = useState(article.content_en ?? '')
  const [saving, startTransition] = useTransition()
  const [status, setStatus] = useState<RowStatus>()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateArticleTranslation(article.id, { title_en: titleEn, content_en: contentEn })
      setStatus(result.error ? 'error' : 'success')
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium truncate">{article.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <RowStatusIcon status={status} />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? 'Saugoma...' : 'Išsaugoti'}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Pavadinimas (EN)</Label>
        <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder={article.title} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Turinys (EN)</Label>
        <Textarea
          value={contentEn}
          onChange={(e) => setContentEn(e.target.value)}
          rows={5}
          className="resize-y"
        />
      </div>
    </div>
  )
}

function PromoRow({ promo }: { promo: TranslatableContent['promos'][number] }) {
  const [titleEn, setTitleEn] = useState(promo.title_en ?? '')
  const [contentEn, setContentEn] = useState(promo.content_en ?? '')
  const [saving, startTransition] = useTransition()
  const [status, setStatus] = useState<RowStatus>()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePromoTranslation(promo.id, { title_en: titleEn, content_en: contentEn })
      setStatus(result.error ? 'error' : 'success')
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium truncate">{promo.title}</p>
        <div className="flex items-center gap-2 shrink-0">
          <RowStatusIcon status={status} />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? 'Saugoma...' : 'Išsaugoti'}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Pavadinimas (EN)</Label>
        <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder={promo.title} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Turinys (EN)</Label>
        <Textarea
          value={contentEn}
          onChange={(e) => setContentEn(e.target.value)}
          rows={5}
          className="resize-y"
        />
      </div>
    </div>
  )
}

function TenantRow({ tenant }: { tenant: TranslatableContent['tenants'][number] }) {
  const [storeNameEn, setStoreNameEn] = useState(tenant.store_name_en ?? '')
  const [descriptionEn, setDescriptionEn] = useState(tenant.description_en ?? '')
  const [categoryEn, setCategoryEn] = useState(tenant.category_en ?? '')
  const [saving, startTransition] = useTransition()
  const [status, setStatus] = useState<RowStatus>()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTenantTranslation(tenant.id, {
        store_name_en: storeNameEn,
        description_en: descriptionEn,
        category_en: categoryEn,
      })
      setStatus(result.error ? 'error' : 'success')
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium truncate">{tenant.store_name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <RowStatusIcon status={status} />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? 'Saugoma...' : 'Išsaugoti'}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Pavadinimas (EN)</Label>
          <Input value={storeNameEn} onChange={(e) => setStoreNameEn(e.target.value)} placeholder={tenant.store_name} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Kategorija (EN)</Label>
          <Input value={categoryEn} onChange={(e) => setCategoryEn(e.target.value)} placeholder={tenant.category ?? ''} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Aprašymas (EN)</Label>
        <Textarea
          value={descriptionEn}
          onChange={(e) => setDescriptionEn(e.target.value)}
          placeholder={tenant.description ?? ''}
          rows={3}
          className="resize-y"
        />
      </div>
    </div>
  )
}

function FaqRow({ item }: { item: TranslatableContent['faqItems'][number] }) {
  const [questionEn, setQuestionEn] = useState(item.question_en ?? '')
  const [answerEn, setAnswerEn] = useState(item.answer_en ?? '')
  const [saving, startTransition] = useTransition()
  const [status, setStatus] = useState<RowStatus>()

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateFaqTranslation(item.id, { question_en: questionEn, answer_en: answerEn })
      setStatus(result.error ? 'error' : 'success')
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium truncate">{item.question}</p>
        <div className="flex items-center gap-2 shrink-0">
          <RowStatusIcon status={status} />
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saving ? 'Saugoma...' : 'Išsaugoti'}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Klausimas (EN)</Label>
        <Input value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} placeholder={item.question} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Atsakymas (EN)</Label>
        <Textarea
          value={answerEn}
          onChange={(e) => setAnswerEn(e.target.value)}
          placeholder={item.answer}
          rows={3}
          className="resize-y"
        />
      </div>
    </div>
  )
}
