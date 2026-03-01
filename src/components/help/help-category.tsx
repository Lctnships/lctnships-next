import { Link } from "@/i18n/routing"

interface HelpCategoryProps {
  slug: string
  title: string
  description: string
  icon: string
}

export function HelpCategory({ slug, title, description, icon }: HelpCategoryProps) {
  return (
    <Link href={`/help/${slug}`}>
      <div className="flex flex-col gap-4 rounded-xl border border-[#cfd7e7] bg-white p-8 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 group cursor-pointer">
        <div className="size-12 bg-gray-100 rounded-lg flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-[#0d121b] text-xl font-bold leading-tight">{title}</h3>
          <p className="text-[#4c669a] text-sm font-normal leading-relaxed">{description}</p>
        </div>
      </div>
    </Link>
  )
}
