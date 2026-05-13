"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function BookingSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        <div className="space-y-2">
          <Skeleton height={36} width={256} />
          <Skeleton height={16} width={384} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={200} borderRadius="1rem" />
          <div className="space-y-4">
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} count={3} />
          </div>
        </div>
        <Skeleton height={56} borderRadius="9999px" />
      </div>
    </AppSkeletonTheme>
  )
}
