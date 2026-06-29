import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { NAUJIENOS_STRINGS } from '@/lib/strings'
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

  return (
    <Link
      href={`/naujienos/${article.slug}`}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${featured ? 'md:flex-row' : ''}`}
    >
      <div
        className={`relative overflow-hidden bg-muted ${featured ? 'md:w-1/2 h-48 md:h-auto' : 'h-48'}`}
      >
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        {featured && (
          <span className="absolute top-3 left-3">
            <Badge className="bg-primary text-primary-foreground text-xs">
              {NAUJIENOS_STRINGS.featuredLabel}
            </Badge>
          </span>
        )}
      </div>

      <div className={`flex flex-col gap-2 p-4 ${featured ? 'md:w-1/2 md:p-6' : ''}`}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {article.category}
          </Badge>
          {date && <span className="text-xs text-muted-foreground">{date}</span>}
        </div>
        <h2
          className={`font-semibold leading-snug group-hover:text-primary transition-colors ${featured ? 'text-xl' : 'text-base'}`}
        >
          {article.title}
        </h2>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}&hellip;</p>
        )}
        <span className="text-sm text-primary font-medium mt-auto">
          {NAUJIENOS_STRINGS.readMore} &rarr;
        </span>
      </div>
    </Link>
  )
}
