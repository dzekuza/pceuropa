'use client'
// components/faq/faq-reader.tsx — Read-only FAQ accordion for sellers
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
          <AccordionContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
