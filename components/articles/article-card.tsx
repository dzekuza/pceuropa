import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowIcon } from '@/components/marketing/ui/arrow-icon'
import { NAUJIENOS_STRINGS } from '@/lib/strings'
import { resizeImage } from '@/lib/storage/resize-image'
import type { Article } from '@/types/database'

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const excerpt = stripHtml(article.content).slice(0, 120)
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  if (featured) {
    return (
      <Link
        href={`/naujienos/${article.slug}`}
        className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="relative overflow-hidden bg-[#e8e8e5] md:w-1/2 h-48 md:h-auto">
          {article.cover_image ? (
            <img
              src={resizeImage(article.cover_image, { width: 800, height: 600, quality: 90 })}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-[#e8e8e5]" />
          )}
          <span className="absolute top-3 left-3">
            <Badge className="bg-black text-white text-xs border-0">
              {NAUJIENOS_STRINGS.featuredLabel}
            </Badge>
          </span>
        </div>

        <div className="flex flex-col gap-2 p-4 md:w-1/2 md:p-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium border border-black/20 rounded-full px-2 py-0.5 text-[#575757]">
              {article.category}
            </span>
            {date && <span className="text-xs text-[#888]">{date}</span>}
          </div>
          <h2 className="font-semibold leading-snug text-black group-hover:opacity-70 transition-opacity text-xl">
            {article.title}
          </h2>
          {excerpt && (
            <p className="text-sm text-[#575757] line-clamp-2">{excerpt}&hellip;</p>
          )}
          <span className="text-sm font-medium mt-auto text-black group-hover:opacity-70 transition-opacity">
            {NAUJIENOS_STRINGS.readMore} &rarr;
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/naujienos/${article.slug}`}
      className="flex flex-col gap-6 group"
    >
      <div className="relative w-full h-[236px] rounded-[32px] lg:rounded-[40px] overflow-hidden shrink-0">
        {article.cover_image ? (
          <img
            src={resizeImage(article.cover_image, { width: 800, height: 472, quality: 90 })}
            alt={article.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 [transition-timing-function:var(--ease-out)]"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-[#e8e8e5]" />
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium border border-black/20 rounded-full px-2 py-0.5 text-[#575757]">
              {article.category}
            </span>
            {date && <span className="text-xs text-[#888]">{date}</span>}
          </div>
          <p className="font-bold text-[18px] leading-[24px] text-black font-[family-name:var(--font-jakarta)] break-words">
            {article.title}
          </p>
        </div>
        <span className="inline-flex items-center justify-center bg-black rounded-full size-[56px] shrink-0 transition-opacity duration-150 group-hover:opacity-70 active:scale-95">
          <ArrowIcon className="text-white size-6 transition-transform duration-150 group-hover:rotate-[-25deg]" />
        </span>
      </div>
    </Link>
  )
}
