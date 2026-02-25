import { HeroSection } from "@/components/home/hero-section"
import { CategoriesSection } from "@/components/home/categories-section"
import { FeaturedStudios } from "@/components/home/featured-studios"
import { WhyLcntships } from "@/components/home/why-lcntships"
import { PortfolioSection } from "@/components/home/portfolio-section"

import { BecomeHostSection } from "@/components/home/become-host-section"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function FeaturedStudiosSkeleton() {
  return (
    <section className="max-w-[1440px] mx-auto px-8 mt-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="aspect-[4/5] rounded-[32px]" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
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
      <Suspense>
        <PortfolioSection />
      </Suspense>
<BecomeHostSection />
    </>
  )
}
