"use client"

import Skeleton from "react-loading-skeleton"
import { AppSkeletonTheme } from "./skeleton-theme"

export function StudioDetailSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Skeleton height={32} width="50%" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Skeleton height={400} borderRadius="1rem" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton height={196} borderRadius="1rem" />
            <Skeleton height={196} borderRadius="1rem" />
            <Skeleton height={196} borderRadius="1rem" />
            <Skeleton height={196} borderRadius="1rem" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton height={24} width="40%" />
            <Skeleton height={16} count={4} />
            <Skeleton height={200} borderRadius="1rem" />
          </div>
          <Skeleton height={400} borderRadius="1rem" />
        </div>
      </div>
    </AppSkeletonTheme>
  )
}
