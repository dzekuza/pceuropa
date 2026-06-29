import { ArticleCard } from './article-card'
import { NAUJIENOS_STRINGS } from '@/lib/strings'
import type { Article } from '@/types/database'

interface ArticlesGridProps {
  articles: Article[]
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">{NAUJIENOS_STRINGS.emptyState}</p>
    )
  }

  const featured = articles.filter((a) => a.featured)
  const rest = articles.filter((a) => !a.featured)

  return (
    <div className="flex flex-col gap-8">
      {featured.length > 0 && (
        <section className="flex flex-col gap-4">
          {featured.slice(0, 3).map((article) => (
            <ArticleCard key={article.id} article={article} featured />
          ))}
        </section>
      )}
      {rest.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>
      )}
    </div>
  )
}
