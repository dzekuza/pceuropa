'use client'
// components/faq/faq-reader.tsx — Read-only FAQ accordion for sellers
import { FileText, Link2 } from 'lucide-react'
import { resizeSupabaseImage } from '@/lib/utils/supabase-image'
import type { FaqItem } from '@/types/database'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FaqReaderProps {
  items: FaqItem[]
}

const URL_RE = /(https?:\/\/[^\s]+)/g

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(url)
}

function fileName(url: string) {
  return decodeURIComponent(url.split('/').pop() ?? url)
}

function renderAnswer(text: string) {
  const parts = text.split(URL_RE)
  return parts.map((part, i) => {
    if (URL_RE.test(part)) {
      URL_RE.lastIndex = 0
      return <LinkEmbed key={i} url={part} />
    }
    return part ? (
      <span key={i} className="whitespace-pre-wrap">
        {part}
      </span>
    ) : null
  })
}

function LinkEmbed({ url }: { url: string }) {
  const name = fileName(url)
  const icon = isImage(url) ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resizeSupabaseImage(url, { width: 64, height: 64 })} alt={name} className="h-8 w-8 rounded object-cover shrink-0" />
  ) : (
    <FileText className="size-4 shrink-0 text-muted-foreground" />
  )

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-1 flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted transition-colors"
    >
      {icon}
      <span className="flex flex-col min-w-0">
        <span className="font-medium text-foreground truncate">{name}</span>
        <span className="text-xs text-muted-foreground truncate">{url}</span>
      </span>
      <Link2 className="size-3.5 shrink-0 text-muted-foreground ml-auto" />
    </a>
  )
}

export function FaqReader({ items }: FaqReaderProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-base text-muted-foreground">
          Šiuo metu DUK įrašų nėra.
        </p>
      </div>
    )
  }

  return (
    <Accordion type="multiple" className="w-full">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="font-semibold text-left">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <div className="flex flex-col text-sm leading-relaxed text-muted-foreground">
              {renderAnswer(item.answer)}
            </div>

            {item.attachments && item.attachments.length > 0 && (
              <div className="flex flex-col gap-3">
                {item.attachments.filter(isImage).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.attachments.filter(isImage).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-md overflow-hidden border hover:opacity-80 transition-opacity"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resizeSupabaseImage(url, { width: 320, height: 320, fit: 'contain' })}
                          alt={fileName(url)}
                          className="h-40 w-auto max-w-xs object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {item.attachments.filter((u) => !isImage(u)).length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {item.attachments.filter((u) => !isImage(u)).map((url) => (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="size-4 shrink-0" />
                          {fileName(url)}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
