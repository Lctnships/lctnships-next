import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Link } from "@/i18n/routing"
import { MarketplaceSearch } from "@/components/marketplace/marketplace-search"
import { CategoryFilter } from "@/components/marketplace/category-filter"
import { StudioPlaylists } from "@/components/home/studio-playlists"
import { StudioCard } from "@/components/marketplace/studio-card"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Studios")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

interface StudiosPageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    city?: string
    date?: string
  }>
}

async function StudiosContent({ searchParams }: StudiosPageProps) {
  const params = await searchParams
  const t = await getTranslations("Studios")
  const supabase = await createClient()

  let query = supabase
    .from("studios")
    .select("*")
    .or("is_published.eq.true,status.eq.active")
    .order("created_at", { ascending: false })

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,location.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  if (params.type) {
    query = query.eq("studio_type", params.type)
  }

  if (params.city) {
    query = query.ilike("location", `%${params.city}%`)
  }

  const { data: studios } = await query

  if (!studios || studios.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t("noResults")}</h3>
        <p className="text-gray-500">{t("noResultsDesc")}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {studios.map((studio) => (
        <StudioCard key={studio.id} studio={studio} />
      ))}
    </div>
  )
}

function StudiosSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-3xl bg-gray-200 mb-4" />
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function StudiosPage(props: StudiosPageProps) {
  const params = await props.searchParams
  const t = await getTranslations("Studios")

  return (
    <div className="bg-[#fcfcfc]">
      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-6 py-8 mb-4">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" /></div>}>
          <MarketplaceSearch />
        </Suspense>
      </section>

      <section className="max-w-7xl mx-auto px-6 mb-16">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" /></div>}>
          <CategoryFilter />
        </Suspense>
      </section>

      <section className="max-w-7xl mx-auto px-6 mb-20">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" /></div>}>
          <StudioPlaylists />
        </Suspense>
      </section>

      {(params.city || params.type) && (
        <section className="max-w-7xl mx-auto px-6 mb-10">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {params.city && (
              <Link
                href={`/studios${params.type ? `?${new URLSearchParams({ type: params.type }).toString()}` : ""}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
              >
                {params.city}
                <span className="material-symbols-outlined text-base">close</span>
              </Link>
            )}
            {params.type && (
              <Link
                href={`/studios${params.city ? `?${new URLSearchParams({ city: params.city }).toString()}` : ""}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
              >
                {params.type}
                <span className="material-symbols-outlined text-base">close</span>
              </Link>
            )}
            <Link
              href="/studios"
              className="px-5 py-2.5 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-all"
            >
              {t("clearAll")}
            </Link>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600 block mb-2">
              {t("discover")}
            </span>
            <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-20">
        <Suspense fallback={<StudiosSkeleton />}>
          <StudiosContent searchParams={props.searchParams} />
        </Suspense>
      </main>
    </div>
  )
}
