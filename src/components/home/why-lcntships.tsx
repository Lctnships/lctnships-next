import { getTranslations } from "next-intl/server"

const featureKeys = [
  { icon: "verified", titleKey: "whyVerified", descKey: "whyVerifiedDesc" },
  { icon: "bolt", titleKey: "whyBooking", descKey: "whyBookingDesc" },
  { icon: "camera", titleKey: "whyEquipment", descKey: "whyEquipmentDesc" },
] as const

export async function WhyLcntships() {
  const t = await getTranslations("Home")

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-8 mt-16 md:mt-32 py-12 md:py-20 bg-[#f8f9fa] rounded-[24px] md:rounded-[32px]">
      <h2 className="text-center text-2xl md:text-3xl font-extrabold tracking-tight mb-8 md:mb-16">{t("whyTitle")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 px-2 md:px-10">
        {featureKeys.map((feature) => (
          <div key={feature.titleKey} className="text-center flex flex-col items-center">
            <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl text-black">{feature.icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-3">{t(feature.titleKey)}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{t(feature.descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
