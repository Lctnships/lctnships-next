"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function OnboardingSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
        <Skeleton height={8} borderRadius="9999px" />
        <div className="space-y-2">
          <Skeleton height={36} width="70%" />
          <Skeleton height={16} width="90%" />
        </div>
        <div className="space-y-4">
          <Skeleton height={120} borderRadius="1rem" />
          <Skeleton height={120} borderRadius="1rem" />
          <Skeleton height={120} borderRadius="1rem" />
        </div>
        <div className="flex justify-between">
          <Skeleton height={48} width={112} borderRadius="9999px" />
          <Skeleton height={48} width={144} borderRadius="9999px" />
        </div>
      </div>
    </AppSkeletonTheme>
  )
}
