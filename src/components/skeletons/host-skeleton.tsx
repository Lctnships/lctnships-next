"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function HostSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="space-y-5 md:space-y-8">
        <div className="space-y-2">
          <Skeleton height={32} width={192} />
          <Skeleton height={16} width={320} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={112} borderRadius="0.5rem" />
          ))}
        </div>
        <Skeleton height={320} borderRadius="0.5rem" />
      </div>
    </AppSkeletonTheme>
  )
}
