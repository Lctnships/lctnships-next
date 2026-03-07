import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Cancellation")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  }
}

export default async function CancellationPage() {
  const t = await getTranslations("Cancellation")

  const policyTiers = [
    {
      name: "Flexibel",
      refund: "100%",
      label: t("booking"),
      color: "green",
      timelineWidth: "w-3/4",
      timeLabel: "-7d",
      description: "",
    },
    {
      name: "Standaard",
      refund: "50%",
      label: t("booking"),
      color: "blue",
      timelineWidth: "w-1/2",
      timeLabel: "-48u",
      description: "",
    },
    {
      name: "Strikt",
      refund: "0%",
      label: t("booking"),
      color: "gray",
      timelineWidth: "w-1/4",
      timeLabel: "-24u",
      description: "",
    },
  ]

  const processSteps = [
    { icon: "cancel", label: "1" },
    { icon: "verified", label: "2" },
    { icon: "wallet", label: "3" },
    { icon: "check", label: "4" },
  ]

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        {/* Hero Section */}
        <section className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
          <h1 className="text-gray-900 dark:text-white text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-3 sm:mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {t("heroDesc")}
          </p>
        </section>

        {/* Policy Tiers Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-14 sm:mb-24">
          {policyTiers.map((tier) => (
            <div
              key={tier.name}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col items-center text-center hover:-translate-y-1 transition-transform"
            >
              <div
                className={`mb-3 sm:mb-6 px-4 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest ${
                  tier.color === "green"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : tier.color === "blue"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-black"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {tier.name}
              </div>
              <div className="text-3xl sm:text-6xl font-extrabold text-gray-900 dark:text-white mb-1 sm:mb-2">
                {tier.refund}
              </div>

              {/* Timeline Visualization */}
              <div className="w-full space-y-2 sm:space-y-4 mb-3 sm:mb-8 mt-3 sm:mt-8">
                <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${tier.timelineWidth} ${
                      tier.color === "gray" ? "bg-gray-400" : "bg-black"
                    } rounded-full`}
                  />
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs font-bold text-gray-400 uppercase">
                  <span>{t("booking")}</span>
                  <span className={tier.color === "gray" ? "text-gray-400" : "text-black"}>
                    {tier.timeLabel}
                  </span>
                  <span>{t("session")}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* How to Cancel + Refund Process Combined */}
        <section className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-12 border border-gray-100 dark:border-gray-800 mb-14 sm:mb-24">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold mb-1 sm:mb-2 text-gray-900 dark:text-white">
              {t("refundProcess")}
            </h2>
            <p className="text-gray-500 text-xs sm:text-base">{t("afterCancellation")}</p>
          </div>
          <div className="flex flex-row items-center justify-center gap-0">
            {processSteps.map((step, index) => (
              <div key={step.label} className="flex flex-row items-center">
                <div className="flex flex-col items-center gap-1 sm:gap-3">
                  <div
                    className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                      index === processSteps.length - 1
                        ? "bg-black text-white"
                        : "bg-gray-50 dark:bg-gray-800 text-black"
                    }`}
                  >
                    {step.icon === "cancel" && (
                      <svg className="w-4 h-4 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {step.icon === "verified" && (
                      <svg className="w-4 h-4 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {step.icon === "wallet" && (
                      <svg className="w-4 h-4 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                    {step.icon === "check" && (
                      <svg className="w-4 h-4 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
                {index < processSteps.length - 1 && (
                  <div className="h-[2px] w-8 sm:w-12 lg:w-20 bg-gray-100 dark:bg-gray-800 mx-1 sm:mx-3 lg:mx-6" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 sm:mt-12 p-3 sm:p-6 bg-gray-100 rounded-xl sm:rounded-2xl text-center border border-gray-200">
            <p className="text-gray-600 dark:text-gray-400 text-[11px] sm:text-sm leading-relaxed flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t("refundNote")}{" "}
              <span className="font-bold text-black">{t("businessDays")}</span>.</span>
            </p>
          </div>
        </section>

        {/* Footer Help CTA */}
        <section className="mt-14 sm:mt-24 text-center pb-8 sm:pb-12">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            {t("moreQuestions")}
          </h3>
          <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
            {t("moreQuestionsDesc")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a
              href="mailto:support@lcntships.com"
              className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-black/10 hover:brightness-105 transition-all text-sm sm:text-base"
            >
              {t("contactUs")}
            </a>
            <Link
              href="/help"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm sm:text-base"
            >
              {t("viewFaq")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
