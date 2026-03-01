"use client"

import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

const categories = [
  { key: "categoryPhoto", icon: "photo_camera", href: "/studios?type=photo" },
  { key: "categoryVideo", icon: "videocam", href: "/studios?type=video" },
  { key: "categoryPodcast", icon: "mic", href: "/studios?type=podcast" },
  { key: "categoryMusic", icon: "music_note", href: "/studios?type=music" },
  { key: "categoryDance", icon: "settings_accessibility", href: "/studios?type=dance" },
  { key: "categoryCreative", icon: "palette", href: "/studios?type=creative" },
] as const

export function CategoriesSection() {
  const t = useTranslations("Home")

  return (
    <section className="max-w-[1440px] mx-auto px-8 mt-12">
      <div className="flex items-center justify-start md:justify-center gap-8 md:gap-16 overflow-x-auto hide-scrollbar py-6 border-b border-gray-100">
        {categories.map((category) => (
          <Link key={category.key} href={category.href}>
            <button className="flex flex-col items-center gap-3 group min-w-max">
              <span className="material-symbols-outlined text-3xl group-hover:text-black text-gray-400 transition-colors">
                {category.icon}
              </span>
              <span className="text-sm font-bold text-gray-500 group-hover:text-black transition-colors">
                {t(category.key)}
              </span>
            </button>
          </Link>
        ))}
      </div>
    </section>
  )
}
