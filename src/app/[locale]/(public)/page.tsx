import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedStudios } from "@/components/home/featured-studios"
import { WhyLcntships } from "@/components/home/why-lcntships"
import { PortfolioSection } from "@/components/home/portfolio-section"
import { BecomeHostSection } from "@/components/home/become-host-section"
import { Suspense } from "react"
import { SailboatLoader } from "@/components/ui/sailboat-loader"
import { useTranslations } from "next-intl"

function FeaturedStudiosSkeleton() {
  const t = useTranslations("Home")
  return (
    <section className="max-w-[1440px] mx-auto px-8 mt-20">
      <div className="flex items-center justify-center py-20">
        <SailboatLoader size="lg" text={t("loadingStudios")} />
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <Suspense fallback={<FeaturedStudiosSkeleton />}>
        <FeaturedStudios />
      </Suspense>
      <WhyLcntships />
      <Suspense fallback={null}>
        <PortfolioSection />
      </Suspense>
      <BecomeHostSection />
    </>
  )
}
