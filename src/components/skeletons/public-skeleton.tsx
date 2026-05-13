"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function PublicSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-3">
          <Skeleton height={48} width="60%" />
          <Skeleton height={20} width="80%" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton height={200} borderRadius="1rem" />
              <Skeleton height={20} width="80%" />
              <Skeleton height={16} width="50%" />
            </div>
          ))}
        </div>
      </div>
    </AppSkeletonTheme>
  )
}
