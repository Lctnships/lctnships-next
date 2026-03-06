import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Camera, Mic, Music, Check, Calendar } from "lucide-react"

const CALENDLY_URL = "https://calendly.com/lcntships/host-onboarding"

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
  "hostInsurance",
  "24_7Support",
]

export default async function BecomeHostPage() {
  const t = await getTranslations("BecomeHost")

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl relative">
                <Image
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&q=80"
                  alt={t("heroImageAlt")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              <div className="flex items-center gap-2 text-[#2CA58D]">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">
                  {t("badge")}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                {t("heroTitle")}{" "}
                <span className="text-[#235789]">{t("heroTitleHighlight")}</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                {t("heroDescription")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-[#235789] hover:bg-[#1a4468] text-white px-8 py-6 rounded-full font-bold text-lg"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    {t("scheduleCall")}
                  </Button>
                </a>
                <Link href="#how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-300 hover:bg-gray-50 px-8 py-6 rounded-full font-bold text-lg"
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
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-gray-600 text-lg">{t("howItWorksSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100"
              >
                <div className="w-14 h-14 rounded-full bg-[#235789]/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-[#235789]">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t(step.title)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(step.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative overflow-hidden rounded-[32px] bg-[#235789] text-white p-10 md:p-16">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="flex flex-col gap-4 max-w-xl">
                <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-sm font-semibold w-fit">
                  {t("whyLcntships")}
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  {t("commissionTitle")}
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  {t("commissionDescription")}
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-2 text-white/90"
                    >
                      <Check className="w-5 h-5 text-[#2CA58D]" />
                      <span>{t(benefit)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <a 
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-[#235789] hover:bg-gray-100 px-8 py-6 rounded-full font-bold text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t("scheduleCall")}
                </Button>
              </a>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#2CA58D]/30 to-transparent pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#2CA58D]/20 blur-3xl" />
          </div>
        </div>
      </section>

      {/* What You Can List */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {t("whatYouCanList")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {studioTypes.map((type) => {
              const Icon = type.icon
              return (
                <div
                  key={type.title}
                  className="group relative overflow-hidden rounded-[24px] aspect-[4/5] cursor-pointer"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${type.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-white/70" />
                      <h3 className="text-white text-2xl font-bold">
                        {t(type.title)}
                      </h3>
                    </div>
                    <p className="text-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              {t("readyToStart")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl">
              {t("readyToStartDescription")}
            </p>
            <a 
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-[#ED6A5A] hover:bg-[#d85a4a] text-white px-10 py-6 rounded-full font-bold text-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("scheduleCall")}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
