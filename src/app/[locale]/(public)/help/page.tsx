"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"

const categoryKeys = [
  { icon: "credit_card", titleKey: "catBookingsPayments", descKey: "catBookingsPaymentsDesc", href: "/help/booking-payments" },
  { icon: "person", titleKey: "catRenters", descKey: "catRentersDesc", href: "/help/renters" },
  { icon: "storefront", titleKey: "catStudios", descKey: "catStudiosDesc", href: "/help/studios" },
  { icon: "settings", titleKey: "catAccount", descKey: "catAccountDesc", href: "/help/account" },
  { icon: "folder_open", titleKey: "catProjects", descKey: "catProjectsDesc", href: "/help/projects" },
  { icon: "cancel", titleKey: "catCancellations", descKey: "catCancellationsDesc", href: "/help/cancellations" },
]

const faqKeys = [
  { questionKey: "faq1Q", answerKey: "faq1A" },
  { questionKey: "faq2Q", answerKey: "faq2A" },
  { questionKey: "faq3Q", answerKey: "faq3A" },
  { questionKey: "faq4Q", answerKey: "faq4A" },
  { questionKey: "faq5Q", answerKey: "faq5A" },
]

export default function HelpPage() {
  const t = useTranslations("Help")
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <div className="w-full max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-8">
          {t("heroTitle")}
        </h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto px-4 py-3 relative">
          <label className="flex flex-col min-w-40 h-16 w-full group">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white border border-gray-200 shadow-xl shadow-black/5 transition-all focus-within:ring-2 focus-within:ring-black/20">
              <div className="text-black flex items-center justify-center pl-6 pr-2">
                <span className="material-symbols-outlined text-3xl">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden focus:outline-none focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-400 px-4 text-lg font-normal leading-normal"
                placeholder={t("searchPlaceholder")}
              />
              <div className="flex items-center pr-4">
                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-md">
                  CMD + K
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="w-full max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold leading-tight tracking-tight px-4 pb-8 text-center md:text-left">
          {t("browseByCategory")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {categoryKeys.map((category) => (
            <Link
              key={category.titleKey}
              href={category.href}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-8 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-gray-300 group"
            >
              <div className="size-12 bg-gray-100 rounded-lg flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{category.icon}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold leading-tight">{t(category.titleKey)}</h3>
                <p className="text-gray-500 text-sm font-normal leading-relaxed">
                  {t(category.descKey)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQs and Contact Section */}
      <div className="w-full max-w-6xl mx-auto px-8 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FAQ Accordion */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-bold mb-8">{t("popularQuestions")}</h2>
          <div className="space-y-4">
            {faqKeys.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden group"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group-hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold">{t(faq.questionKey)}</span>
                  <span
                    className={`material-symbols-outlined text-black transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                    {t(faq.answerKey)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-black rounded-xl p-8 text-white sticky top-24 shadow-2xl shadow-black/30 overflow-hidden relative">
            {/* Abstract background circles */}
            <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 size-40 bg-white/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">{t("cantFind")}</h2>
              <p className="text-white/80 mb-8 text-sm">
                {t("supportTeamDesc")}
              </p>

              <div className="space-y-4">
                <button className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors group">
                  <span className="material-symbols-outlined">chat</span>
                  {t("startLiveChat")}
                </button>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="size-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-white/90">
                    {t("respondsIn")}
                  </span>
                </div>

                <div className="pt-6 border-t border-white/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">mail</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">{t("emailUs")}</p>
                      <a
                        className="text-sm font-bold hover:underline"
                        href="mailto:support@lcntships.com"
                      >
                        support@lcntships.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">call</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">{t("callUs")}</p>
                      <p className="text-sm font-bold">+31 (0) 20 123 4567</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
