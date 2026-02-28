import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

// Category name mapping — content data
const categoryNames: Record<string, string> = {
  "booking-payments": "Boekingen & Betalingen",
  "renters": "Voor Huurders",
  "hosts": "Voor Verhuurders",
  "account": "Account & Instellingen",
  "projects": "Projecten",
  "cancellations": "Annuleringen & Restituties",
}

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const t = await getTranslations("Help")
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `${title} | ${t("helpCenter")}`,
  }
}

export default async function HelpArticlePage({ params }: PageProps) {
  const { category, slug } = await params
  const t = await getTranslations("Help")

  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const categoryName = categoryNames[category] || t("help")

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full max-w-6xl mx-auto px-8 py-8 md:pt-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-[#4c669a] mb-8">
          <Link href="/help" className="hover:text-primary transition-colors">
            {t("help")}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href={`/help/${category}`} className="hover:text-primary transition-colors">
            {categoryName}
          </Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#0d121b]">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Article */}
          <article className="lg:col-span-8">
            <header className="mb-10">
              <h1 className="text-[#0d121b] text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
                {title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[#4c669a]">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-primary">person</span>
                  </div>
                  <span>{t("updatedBySupport")}</span>
                </div>
                <span className="size-1 rounded-full bg-gray-300" />
                <span>3 {t("minRead")}</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-[#4c669a] text-lg leading-relaxed mb-6">
                {t("articleIntro")} {title.toLowerCase()}{t("articleIntroSuffix")}
              </p>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-[#0d121b]">{t("gettingStarted")}</h2>
              <p className="text-[#4c669a] leading-relaxed mb-4">
                {t("followSteps")}
              </p>
              <ul className="list-disc list-inside mb-8 space-y-3 text-[#4c669a]">
                <li className="marker:text-primary">{t("step1")}</li>
                <li className="marker:text-primary">{t("step2")}</li>
                <li className="marker:text-primary">{t("step3")}</li>
                <li className="marker:text-primary">{t("step4")}</li>
              </ul>

              <h2 className="text-2xl font-bold mt-10 mb-4 text-[#0d121b]">{t("faqTitle")}</h2>
              <p className="text-[#4c669a] leading-relaxed mb-4">
                {t("faqDesc")}
              </p>

              <div className="my-10 p-6 bg-primary/5 border-l-4 border-primary rounded-r-xl">
                <p className="mb-0 italic text-[#0d121b]">
                  <strong>{t("proTip")}</strong> {t("proTipDesc")}
                </p>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-20 pt-10 border-t border-[#e7ebf3]">
              <div className="bg-[#f6f6f8] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-xl font-bold text-[#0d121b] mb-1">{t("wasHelpful")}</h4>
                  <p className="text-[#4c669a] text-sm">{t("feedbackHelps")}</p>
                </div>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-white border border-[#cfd7e7] px-6 py-3 rounded-2xl hover:bg-primary/10 hover:border-primary transition-all group">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                      thumb_up
                    </span>
                    <span className="font-bold">{t("yes")}</span>
                  </button>
                  <button className="flex items-center gap-2 bg-white border border-[#cfd7e7] px-6 py-3 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all group">
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-red-500 group-hover:scale-110 transition-transform">
                      thumb_down
                    </span>
                    <span className="font-bold">{t("no")}</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10">
            {/* Contact Card */}
            <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute -top-10 -right-10 size-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">{t("stillNeedHelp")}</h4>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  {t("supportAvailable")}
                </p>
                <button className="w-full bg-white text-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#f6f6f8] transition-colors">
                  <span className="material-symbols-outlined">chat</span>
                  {t("contactUs")}
                </button>
              </div>
            </div>

            {/* Back to category */}
            <div className="bg-white border border-[#e7ebf3] rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-4">{t("moreIn")} {categoryName}</h3>
              <Link
                href={`/help/${category}`}
                className="flex items-center gap-2 text-primary font-bold hover:underline"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                {t("viewAllArticlesInCategory")}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
