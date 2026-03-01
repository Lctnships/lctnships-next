import { Link } from "@/i18n/routing"
import Image from "next/image"
import { getTranslations } from "next-intl/server"

export async function BecomeHostSection() {
  const t = await getTranslations("Home")

  return (
    <section className="max-w-[1440px] mx-auto px-8 mt-32 mb-20">
      <div className="relative h-[480px] rounded-[32px] overflow-hidden group">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069"
          alt={t("becomeHostImageAlt")}
          fill
          sizes="100vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-white text-4xl md:text-5xl font-extrabold mb-8 max-w-2xl">
            {t("becomeHostTitle")}
          </h2>
          <Link href="/studios">
            <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
              {t("becomeHostButton")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
