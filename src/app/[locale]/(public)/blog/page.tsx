import { Link } from "@/i18n/routing"
import { ArrowRight } from "lucide-react"
import { getBlogArticles, getBlogCategories, getFeaturedArticle } from "@/lib/supabase/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTranslations } from "next-intl/server"
import { BlogArticlesClient } from "./blog-articles-client"

export async function generateMetadata() {
  const t = await getTranslations("Blog")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

// Revalidate every 5 minutes
export const revalidate = 300

export default async function BlogPage() {
  const t = await getTranslations("Blog")
  const [featuredArticle, articles, categories] = await Promise.all([
    getFeaturedArticle(),
    getBlogArticles(),
    getBlogCategories()
  ])

  const otherArticles = articles.filter(a => !a.is_featured)

  return (
    <div className="min-h-screen">
      {/* Featured Article Hero */}
      {featuredArticle && (
        <section className="px-4 sm:px-6 lg:px-20 py-6 sm:py-10">
          <Link href={`/blog/${featuredArticle.slug}`} className="block">
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl sm:rounded-[32px] shadow-2xl h-[360px] sm:h-[500px] lg:h-[600px] flex items-end max-w-[1400px] mx-auto">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%), url("${featuredArticle.cover_image}")`
                }}
              />
              <div className="relative p-5 sm:p-8 lg:p-16 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-8">
                <div className="max-w-2xl">
                  <span className="text-white/80 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-2 sm:mb-4 block">
                    {featuredArticle.category} • {t("featured")}
                  </span>
                  <h2 className="text-white text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-3 sm:mb-6 font-display">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/90 text-sm sm:text-lg lg:text-xl font-medium max-w-xl line-clamp-2 sm:line-clamp-none">
                    {featuredArticle.excerpt}
                  </p>
                </div>
                <Button className="shrink-0 bg-white text-black hover:bg-black hover:text-white rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-bold transition-all w-full sm:w-auto">
                  {t("readFullStory")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        </section>
      )}

      <BlogArticlesClient
        articles={otherArticles}
        categories={categories}
        translations={{
          theArchive: t("theArchive"),
          sortedByRecent: t("sortedByRecent"),
          all: t("all"),
        }}
      />

      {/* Newsletter */}
      <section className="mt-12 sm:mt-20 py-12 sm:py-24 bg-gray-50 text-center px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold italic mb-3 sm:mb-4 font-display">{t("joinCollective")}</h3>
          <p className="text-gray-500 text-sm sm:text-lg mb-6 sm:mb-10">
            {t("newsletterDesc")}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Input
              type="email"
              placeholder={t("emailPlaceholder")}
              className="flex-1 max-w-sm rounded-full px-5 sm:px-6 py-5 sm:py-6 border-gray-200"
            />
            <Button className="bg-black text-white px-8 sm:px-10 py-5 sm:py-6 rounded-full font-bold hover:bg-gray-800">
              {t("subscribe")}
            </Button>
          </form>
          <p className="mt-4 sm:mt-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            {t("privacyGuarantee")}
          </p>
        </div>
      </section>
    </div>
  )
}
