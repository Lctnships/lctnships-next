"use client"

import { useState, useEffect } from "react"
import { Link, usePathname } from "@/i18n/routing"
import Image from "next/image"

const steps = [
  { id: "basics", icon: "info", title: "Basics", href: "/host/onboarding" },
  { id: "media", icon: "image", title: "Media", href: "/host/onboarding/media" },
  { id: "equipment", icon: "inventory_2", title: "Equipment", href: "/host/onboarding/equipment" },
  { id: "pricing", icon: "payments", title: "Pricing", href: "/host/onboarding/pricing" },
  { id: "calendar", icon: "calendar_today", title: "Calendar", href: "/host/onboarding/calendar" },
]

function getCurrentStep(pathname: string) {
  if (pathname === "/host/onboarding") return "basics"
  if (pathname.includes("media")) return "media"
  if (pathname.includes("equipment")) return "equipment"
  if (pathname.includes("pricing")) return "pricing"
  if (pathname.includes("calendar")) return "calendar"
  return "basics"
}

function getCompletedSteps(): Set<string> {
  if (typeof window === "undefined") return new Set()
  const draft = JSON.parse(localStorage.getItem("studio_draft") || "{}")
  const completed = new Set<string>()

  // Basics is completed if type, title, and address are filled
  if (draft.type && draft.title && draft.location) {
    completed.add("basics")
  }

  // Media is completed if images were uploaded
  if (draft.images && draft.images.length > 0) {
    completed.add("media")
  }

  // Equipment is completed if equipment was selected
  if (draft.equipment && draft.equipment.length > 0) {
    completed.add("equipment")
  }

  // Pricing is completed if price was set
  if (draft.price_per_hour) {
    completed.add("pricing")
  }

  // Calendar is completed if available_days were set
  if (draft.available_days && draft.available_days.length > 0) {
    completed.add("calendar")
  }

  return completed
}

function getProgress(completedSteps: Set<string>) {
  return Math.round((completedSteps.size / steps.length) * 100)
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentStep = getCurrentStep(pathname)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  // Check localStorage for completed steps on mount and when pathname changes
  useEffect(() => {
    setCompletedSteps(getCompletedSteps())
  }, [pathname])

  const progress = getProgress(completedSteps)

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  // A step is accessible if:
  // 1. It's step 0 (always accessible)
  // 2. It's at or before the current step (so you can go back)
  // 3. The step itself is completed
  // 4. The previous step is completed (so you can go forward)
  const getIsAccessible = (stepId: string) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId)
    if (stepIndex === 0) return true
    if (stepIndex <= currentStepIndex) return true
    if (completedSteps.has(stepId)) return true
    const prevStep = steps[stepIndex - 1]
    return completedSteps.has(prevStep.id)
  }

  return (
    <div className="flex min-h-screen bg-[#f6f6f8]">
      {/* Sidebar Navigation */}
      <aside className="w-80 border-r border-gray-200 bg-white flex flex-col p-8 fixed h-full">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/icon logo.png" alt="" width={28} height={28} className="h-7 w-7" />
            <Image src="/Lctnships-cropped.png" alt="lcntships" width={140} height={62} className="h-7 w-auto" />
          </Link>
          <p className="text-xs text-gray-500 font-medium mt-1 ml-9">Host Dashboard</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {steps.map((step) => {
            const isActive = currentStep === step.id
            const isCompleted = completedSteps.has(step.id)
            const isAccessible = getIsAccessible(step.id)

            return isAccessible ? (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                  isActive
                    ? "bg-gray-100 text-black border border-gray-200"
                    : isCompleted
                    ? "text-green-600 hover:bg-gray-100"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? "active-icon" : ""}`}>
                  {isCompleted && !isActive ? "check_circle" : step.icon}
                </span>
                <p className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{step.title}</p>
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-black"></div>}
              </Link>
            ) : (
              <div
                key={step.id}
                className="flex items-center gap-4 px-4 py-3 rounded-full text-gray-300 cursor-not-allowed"
              >
                <span className="material-symbols-outlined">{step.icon}</span>
                <p className="text-sm font-medium">{step.title}</p>
              </div>
            )
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Setup Progress</p>
            <p className="text-xs font-bold text-black">{progress}%</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-black h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <Link
            href="/host/dashboard"
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors rounded-xl hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-base">skip_next</span>
            Later invullen
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-80 flex-1 flex flex-col min-h-screen">{children}</main>
    </div>
  )
}
