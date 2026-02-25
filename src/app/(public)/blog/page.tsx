import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getBlogArticles, getBlogCategories, getFeaturedArticle } from "@/lib/supabase/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Editorial | lcntships",
  description: "Stories, insights, and inspiration for creative professionals. Discover studio tips, interviews, and production guides.",
}

// Revalidate every 5 minutes
export const revalidate = 300

export default async function BlogPage() {
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
        <section className="px-6 lg:px-20 py-10">
          <Link href={`/blog/${featuredArticle.slug}`} className="block">
            <div className="relative group cursor-pointer overflow-hidden rounded-[32px] shadow-2xl h-[500px] lg:h-[600px] flex items-end max-w-[1400px] mx-auto">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%), url("${featuredArticle.cover_image}")`
                }}
              />
              <div className="relative p-8 lg:p-16 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <span className="text-white/80 text-xs font-bold tracking-widest uppercase mb-4 block">
                    {featuredArticle.category} • Featured
                  </span>
                  <h2 className="text-white text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 font-display">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-white/90 text-lg lg:text-xl font-medium max-w-xl">
                    {featuredArticle.excerpt}
                  </p>
                </div>
                <Button className="shrink-0 bg-white text-black hover:bg-primary hover:text-white rounded-full px-8 py-6 text-base font-bold transition-all">
                  Read Full Story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Filters */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-20 mb-12 border-y border-gray-100 py-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((category, index) => (
            <Button
              key={category.slug}
              variant={index === 0 ? "default" : "secondary"}
              className={`rounded-full px-6 py-2 text-sm font-medium ${
                index === 0
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-100 hover:bg-primary/10"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </section>

      {/* Archive Title */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-20 flex items-center justify-between mb-10">
        <h3 className="text-3xl lg:text-4xl font-bold tracking-tight italic font-display">The Archive</h3>
        <p className="text-gray-500 font-medium tracking-wide uppercase text-xs lg:text-sm">Sorted by Recent</p>
      </div>

      {/* Masonry Grid */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-20">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
          {otherArticles.map((article, index) => {
            // Vary aspect ratios for masonry effect
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

      {/* Newsletter */}
      <section className="mt-20 py-24 bg-gray-50 text-center px-6">
        <div className="max-w-xl mx-auto">
          <h3 className="text-3xl lg:text-4xl font-bold italic mb-4 font-display">Join the Collective</h3>
          <p className="text-gray-500 text-lg mb-10">
            Get the latest editorial stories, studio openings, and creative guides delivered to your inbox every week.
          </p>
          <form className="flex flex-col md:flex-row gap-4 justify-center">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-1 max-w-sm rounded-full px-6 py-6 border-gray-200"
            />
            <Button className="bg-primary text-white px-10 py-6 rounded-full font-bold hover:bg-primary/90">
              Subscribe
            </Button>
          </form>
          <p className="mt-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            Privacy guaranteed. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  )
}
