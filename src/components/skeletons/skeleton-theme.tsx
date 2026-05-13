"use client"

import { SkeletonTheme } from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

export function AppSkeletonTheme({ children }: { children: React.ReactNode }) {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb" borderRadius="0.75rem">
      {children}
    </SkeletonTheme>
  )
}
