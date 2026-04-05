import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedStudios } from "@/components/home/featured-studios"
import { WhyLctnships } from "@/components/home/why-lctnships"
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
      <WhyLctnships />
      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" /></div>}>
        <PortfolioSection />
      </Suspense>
      <BecomeHostSection />
    </>
  )
}
