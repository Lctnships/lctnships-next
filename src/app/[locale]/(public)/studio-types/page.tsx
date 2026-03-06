import { Link } from "@/i18n/routing"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("StudioTypes")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

const studioTypeKeys = [
  {
    slug: "photo",
    nameKey: "typePhoto",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9euDh_7xwMYsYRffDo28FChSTv-yO3mfd80PS86fWsfExQOMd65HCwPmRC7eZ_IHFfVYLw6l82f5cpgEltt1ONYV1QAx-p2Yw4D7j3BuXoZrYVNz8cerGEFWWXiJJYo1-5GcHiURNqGZkB4b8hET1ry5Bw1MxWGJVgopM9j-VwlekfkjwqhGUc8JCWDYfASCqETIQwCNlIqxzYgoXhMtESZY7XuQOeJ1ztHdkkN7NV_MqXqxvA26p8anMOsinqSaNvPMDg8VLcS8",
  },
  {
    slug: "video",
    nameKey: "typeVideo",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwBz7yqWnaZJ80UK8IRj8ch4QjkyiorNuKpxplTPsOs2qxuK2Z9ep93IornlyepLPxowpiA4FNzjPDXQBJgRIoN_NzgmTWaZaf2UCwI1BeQDeoDLs18ovErDsWbLgQavCT74vxH7MkKfkB1EGYFNXTRAzzsbnNfEBUmTDWR5gYc06Kxe2q5B8_dLn67pbs6YuQokJ-dE0Joauy-WQr5NK380QtcgGguT3niegQa6jfYvUkZHcSc6bK6ix_JqbBGbiULhAXvHs_Al0",
  },
  {
    slug: "podcast",
    nameKey: "typePodcast",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ4j8c84D4xRcCNpT-MEkIDHL2BGHhiLuuJqKWKHHsS43B7WpZ8iEjk_Iaf7tAXtB6Zna25Bq7U8ROg_v5aeEeQtqvme0AZh6UPeK00NvbewByq-TLlot6aHLum0vB8Fd-m8r5E6HRU5gYFmg-nKwkOjKR3Na0ZpGpNeFaShB9QqS1FcniZm-FbDerHyvrVVWoqkxk8xKegjugcVAY7hAVKNpNnsj0ujZzDjsWkwD7JTg8g5kbc7cDpKyqTli0xaWhiqDapy6syFk",
  },
  {
    slug: "music",
    nameKey: "typeMusic",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwWp3JhQqlJTK_2xbJNmelqdI8lpRpnh3J_36l5XSXEpRw_lWwg-Fv1IHCp3aIjhAydCH69r0ufz2xbV5CenR1kMt3fCwZHHi5maxgwhvFkwVIHRr9o8N_SwVLr1XYLwseoVlhqGNPpADunvyi1QtkV4Ouwj22AikXXWMPxQI4XgxUarS0YG8JdxB7iCDOlneCn3ZQe3rnGudBwNcAY3GgzRgZqUBDZc0ngHN1T3HxltB86EaZ4PGwYs21Y8RfpH5NHx46sJr6ksg",
  },
  {
    slug: "dance",
    nameKey: "typeDance",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFZCYWteScqJIUqEGe7EGrZFoWfNfrqgRZKSAgLRJC992W9dfgM-P_p4mEfKgrF420vgvQ7QcutvfkaLVJIeZyy-ifgcM3aUjO6HrPP3IEM9uNTXIH-eT_rNtAZLgaFw720Mdabq7X53XTqRHQs8pq7w2CVrsjVwJi6J1KO3fHVQy8c93Qkd-N4SsLtkdKJC65pOw2EEXVfLreXmSRQeXRLwxBGbtecuDuzXeylobzBYJCg2KF3dSSr222MAGPcr2GkIRaR_0kwc4",
  },
]

export default async function StudioTypesPage() {
  const t = await getTranslations("StudioTypes")
  const ts = await getTranslations("Studios")

  const studioTypes = studioTypeKeys.map((s) => ({
    ...s,
    name: ts(s.nameKey),
  }))

  return (
    <div className="min-h-screen">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-20">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-2 sm:mb-6 max-w-3xl mx-auto">
            {t("heroTitle")}
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t("heroDesc")}
          </p>
        </div>

        {/* Category Headline */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{t("ourCategories")}</h2>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {studioTypes.map((studio) => (
            <div
              key={studio.slug}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden rounded-2xl sm:rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-[16/9] w-full relative">
                <Image
                  src={studio.image}
                  alt={studio.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-3 sm:p-8 flex flex-col grow">
                <h3 className="text-sm sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white">{studio.name}</h3>
                <div className="mt-auto">
                  <Link
                    href={`/studios?type=${studio.slug}`}
                    className="w-full bg-black text-white font-bold py-2.5 sm:py-4 rounded-full transition-opacity hover:opacity-90 text-center block text-xs sm:text-base"
                  >
                    {t("find")} {studio.name}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* CTA Card */}
          <div className="bg-black text-white flex flex-col justify-center items-center p-6 sm:p-12 text-center rounded-2xl sm:rounded-[32px] shadow-lg transform hover:scale-[1.02] transition-transform">
            <svg className="w-8 h-8 sm:w-16 sm:h-16 mb-3 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg sm:text-3xl font-black mb-2 sm:mb-4 leading-tight">
              {t("cantFindTitle")}
            </h3>
            <p className="text-white/80 mb-4 sm:mb-8 max-w-xs mx-auto text-xs sm:text-base">
              {t("cantFindDesc")}
            </p>
            <Link
              href="/help"
              className="bg-white text-black font-bold py-2.5 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-colors text-xs sm:text-base"
            >
              {t("getInTouch")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
