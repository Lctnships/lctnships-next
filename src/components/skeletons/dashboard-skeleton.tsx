"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function DashboardSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="pt-2 space-y-2">
          <Skeleton height={40} width={288} />
          <Skeleton height={16} width={384} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={72} borderRadius="1rem" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton height={256} borderRadius="1rem" />
          <Skeleton height={256} borderRadius="1rem" />
        </div>
      </div>
    </AppSkeletonTheme>
  )
}
