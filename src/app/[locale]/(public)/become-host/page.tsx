import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sparkles, Camera, Mic, Music, Check, Calendar } from "lucide-react"

const CALENDLY_URL = "https://calendly.com/rivaldorose/30min"

const steps = [
  {
    number: "1",
    title: "createProfile",
    description: "createProfileDesc",
  },
  {
    number: "2",
    title: "setRules",
    description: "setRulesDesc",
  },
  {
    number: "3",
    title: "startEarning",
    description: "startEarningDesc",
  },
]

const studioTypes = [
  {
    title: "photoStudios",
    subtitle: "photoStudiosDesc",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
  },
  {
    title: "podcastSuites",
    subtitle: "podcastSuitesDesc",
    icon: Mic,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
  },
  {
    title: "danceFloors",
    subtitle: "danceFloorsDesc",
    icon: Music,
    image: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
  },
]

const benefits = [
  "lowCommission",
  "noHiddenFees",
  "instantBooking",
  "securePayments",
  "verifiedUsers",
  "24_7Support",
]

export default async function BecomeHostPage() {
  const t = await getTranslations("BecomeHost")

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-10 pb-10 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-12 lg:gap-16">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-[4/3] rounded-2xl sm:rounded-[32px] overflow-hidden shadow-xl sm:shadow-2xl relative">
                <Image
                  src="/verkoop pagina.jpg"
                  alt={t("heroImageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-black">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  {t("badge")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                {t("heroTitle")}{" "}
                <span className="text-gray-500">{t("heroTitleHighlight")}</span>
              </h1>

              <p className="text-sm sm:text-lg text-gray-600 leading-relaxed max-w-lg">
                {t("heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-5 sm:py-6 rounded-full font-bold text-sm sm:text-lg"
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {t("scheduleCall")}
                  </Button>
                </a>
                <Link href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-gray-300 hover:bg-gray-50 px-6 sm:px-8 py-5 sm:py-6 rounded-full font-bold text-sm sm:text-lg"
                  >
                    {t("howItWorks")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-4">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg">{t("howItWorksSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-2xl sm:rounded-[24px] p-5 sm:p-8 shadow-sm border border-gray-100"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/5 flex items-center justify-center mb-4 sm:mb-6">
                  <span className="text-lg sm:text-2xl font-bold text-black">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {t(step.title)}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t(step.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Banner */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-black text-white p-6 sm:p-10 md:p-16">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
              <div className="flex flex-col gap-3 sm:gap-4 max-w-xl">
                <span className="inline-block px-3 sm:px-4 py-1 rounded-full bg-white/20 text-xs sm:text-sm font-semibold w-fit">
                  {t("whyLcntships")}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  {t("commissionTitle")}
                </h2>
                <p className="text-white/80 text-sm sm:text-lg leading-relaxed">
                  {t("commissionDescription")}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-4">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 text-white/90 text-sm sm:text-base"
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      <span>{t(benefit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 px-6 sm:px-8 py-5 sm:py-6 rounded-full font-bold text-sm sm:text-lg"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("scheduleCall")}
                </Button>
              </a>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-600/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gray-500/10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* What You Can List */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              {t("whatYouCanList")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {studioTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.title}
                  className="group relative overflow-hidden rounded-2xl sm:rounded-[24px] aspect-[16/9] sm:aspect-[4/5] cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${type.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 sm:p-8">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                      <h3 className="text-white text-lg sm:text-2xl font-bold">
                        {t(type.title)}
                      </h3>
                    </div>
                    <p className="text-white/70 text-xs sm:text-base sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      {t(type.subtitle)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              {t("readyToStart")}
            </h2>
            <p className="text-gray-600 text-sm sm:text-lg max-w-2xl">
              {t("readyToStartDescription")}
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 sm:px-10 py-5 sm:py-6 rounded-full font-bold text-sm sm:text-lg"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("scheduleCall")}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
