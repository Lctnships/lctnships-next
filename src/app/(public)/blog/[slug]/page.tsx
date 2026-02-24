import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { getArticleBySlug, getRelatedArticles, getAllArticleSlugs } from "@/lib/supabase/blog"
import { Button } from "@/components/ui/button"
import { BlogProgressBar } from "./blog-progress-bar"

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>
}

// Revalidate every 5 minutes
export const revalidate = 300

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return { title: "Article Not Found | lcntships" }
  }

  return {
    title: `${article.title} | lcntships Editorial`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      images: article.cover_image ? [article.cover_image] : [],
    },
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(slug, 3)

  // Format the published date
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : ''

  return (
    <>
      {/* Progress Bar */}
      <BlogProgressBar />

      {/* Back Button */}
      <div className="max-w-[1200px] mx-auto px-6 pt-6">
        <Link href="/blog">
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-black">
            <ArrowLeft className="h-4 w-4" />
            Back to Editorial
          </Button>
        </Link>
      </div>

      <main>
        {/* Hero Image */}
        <div className="w-full h-[50vh] lg:h-[70vh] relative overflow-hidden rounded-b-[32px] lg:rounded-b-[48px] shadow-2xl mt-4">
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url("${article.cover_image}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-8 lg:bottom-12 left-0 w-full px-6">
            <div className="max-w-[1200px] mx-auto">
              <span className="inline-block px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                {article.category}
              </span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-[1200px] mx-auto px-6 py-12 lg:py-16">
          <div className="max-w-[760px] mx-auto">
            {/* Header */}
            <header className="mb-12 lg:mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-[-0.02em] mb-8 font-display">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 border-y border-gray-100 py-6">
                {article.author?.avatar_url && (
                  <div
                    className="w-12 h-12 rounded-full bg-cover bg-center border border-gray-100"
                    style={{ backgroundImage: `url('${article.author.avatar_url}')` }}
                  />
                )}
                <div>
                  <p className="font-bold text-sm tracking-tight">
                    By {article.author?.name || 'lcntships Team'}
                  </p>
                  <p className="text-gray-500 text-xs font-normal">
                    {article.author?.role || 'Editorial'} • {article.read_time} • {publishedDate}
                  </p>
                </div>
              </div>
            </header>

            {/* Body Content */}
            <div
              className="article-content font-display prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:lg:text-3xl prose-h2:mt-12 prose-h2:mb-4
                prose-p:leading-relaxed prose-p:mb-6 prose-p:text-gray-700
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-8 prose-blockquote:py-2 prose-blockquote:my-12
                prose-blockquote:text-2xl prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:not-italic
              "
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-16 pt-8 border-t border-gray-100">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-gray-50 py-16 lg:py-24 mt-16">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="flex items-center justify-between mb-10 lg:mb-12">
                <h3 className="text-2xl lg:text-3xl font-bold font-display tracking-tight">Recommended Reading</h3>
                <Link href="/blog" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  View All Articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((related) => (
                  <Link key={related.id} href={`/blog/${related.slug}`} className="group cursor-pointer">
                    <article>
                      <div className="aspect-[4/3] rounded-[24px] overflow-hidden mb-6 bg-gray-200 shadow-md transition-shadow group-hover:shadow-xl">
                        <div
                          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url("${related.cover_image}")` }}
                        />
                      </div>
                      <h4 className="text-lg lg:text-xl font-bold font-display group-hover:text-primary transition-colors leading-tight mb-2">
                        {related.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{related.excerpt}</p>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
