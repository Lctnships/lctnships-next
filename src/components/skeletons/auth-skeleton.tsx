"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function AuthSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="space-y-2 text-center">
          <Skeleton height={32} width={224} style={{ marginInline: "auto" }} />
          <Skeleton height={16} width={288} style={{ marginInline: "auto" }} />
        </div>
        <div className="space-y-4">
          <Skeleton height={48} borderRadius="0.5rem" />
          <Skeleton height={48} borderRadius="0.5rem" />
          <Skeleton height={48} borderRadius="9999px" />
        </div>
      </div>
    </AppSkeletonTheme>
  )
}
