"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import type { BlogArticle, BlogCategory } from "@/lib/supabase/blog"

interface BlogArticlesClientProps {
  articles: BlogArticle[]
  categories: BlogCategory[]
  translations: {
    theArchive: string
    sortedByRecent: string
    all: string
  }
}

export function BlogArticlesClient({ articles, categories, translations }: BlogArticlesClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredArticles = activeCategory
    ? articles.filter(a => a.category_slug === activeCategory)
    : articles

  return (
    <>
      {/* Filters */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-20 mb-12 border-y border-gray-100 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant={activeCategory === null ? "default" : "secondary"}
            className={`rounded-full px-6 py-2 text-sm font-medium ${
              activeCategory === null
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-100 hover:bg-primary/10"
            }`}
            onClick={() => setActiveCategory(null)}
          >
            {translations.all}
          </Button>
          {categories.map((category) => (
            <Button
              key={category.slug}
              variant={activeCategory === category.slug ? "default" : "secondary"}
              className={`rounded-full px-6 py-2 text-sm font-medium ${
                activeCategory === category.slug
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 hover:bg-primary/10"
              }`}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Archive Title */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-20 flex items-center justify-between mb-10">
        <h3 className="text-3xl lg:text-4xl font-bold tracking-tight italic font-display">{translations.theArchive}</h3>
        <p className="text-gray-500 font-medium tracking-wide uppercase text-xs lg:text-sm">{translations.sortedByRecent}</p>
      </div>

      {/* Masonry Grid */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
          {filteredArticles.map((article, index) => {
            const aspectRatios = ['aspect-[3/4]', 'aspect-video', 'aspect-square', 'aspect-[4/5]', 'aspect-square', 'aspect-[3/2]']
            const aspectRatio = aspectRatios[index % aspectRatios.length]

            return (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="block break-inside-avoid mb-10 group cursor-pointer"
              >
                <article>
                  <div className="overflow-hidden rounded-[24px] mb-4 bg-gray-100">
                    <div
                      className={`${aspectRatio} bg-cover bg-center transition-transform duration-500 group-hover:scale-105`}
                      style={{ backgroundImage: `url("${article.cover_image}")` }}
                    />
                  </div>
                  <div>
                    <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">
                      {article.category}
                    </span>
                    <h4 className="text-xl lg:text-2xl font-bold leading-tight mb-3 group-hover:underline underline-offset-4 decoration-primary/30 font-display">
                      {article.title}
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-gray-500 text-xs font-medium uppercase tracking-wider">
                      <span>{article.read_time}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      <span>{article.tags[0]?.replace('#', '') || article.category_slug}</span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
