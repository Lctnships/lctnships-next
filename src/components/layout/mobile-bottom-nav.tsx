"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  LayoutDashboard,
  Calendar,
  Building2,
  DollarSign,
  Menu,
  Heart,
  MessageSquare,
} from "lucide-react"
import { Link, usePathname } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

const hostNavItems = [
  { href: "/host/dashboard" as const, icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/host/bookings" as const, icon: Calendar, labelKey: "bookings" },
  { href: "/host/studios" as const, icon: Building2, labelKey: "studios" },
  { href: "/host/earnings" as const, icon: DollarSign, labelKey: "earnings" },
  { href: "/host/settings" as const, icon: Menu, labelKey: "more" },
]

const renterNavItems = [
  { href: "/dashboard" as const, icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/bookings" as const, icon: Calendar, labelKey: "bookings" },
  { href: "/favorites" as const, icon: Heart, labelKey: "favorites" },
  { href: "/messages" as const, icon: MessageSquare, labelKey: "messages" },
  { href: "/settings" as const, icon: Menu, labelKey: "more" },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const t = useTranslations("Navigation")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isHostMode = pathname.startsWith("/host")
  const navItems = isHostMode ? hostNavItems : renterNavItems

  const getLabel = (key: string) => {
    switch (key) {
      case "dashboard": return "Home"
      case "bookings": return t("bookings")
      case "studios": return t("studios") || "Studio's"
      case "earnings": return t("earnings") || "Inkomsten"
      case "favorites": return t("favorites")
      case "messages": return t("messages")
      case "more": return "Meer"
      default: return key
    }
  }

  const isItemActive = (item: (typeof navItems)[number]) => {
    if (isHostMode) {
      // Host: "more" catches settings, messages, equipment, calendar
      if (item.href === "/host/settings") {
        return (
          pathname.startsWith("/host/settings") ||
          pathname.startsWith("/host/messages") ||
          pathname.startsWith("/host/equipment") ||
          pathname.startsWith("/host/calendar")
        )
      }
    } else {
      // Renter: "more" catches settings, notifications, projects, profile
      if (item.href === "/settings") {
        return (
          pathname.startsWith("/settings") ||
          pathname.startsWith("/notifications") ||
          pathname.startsWith("/projects") ||
          pathname.startsWith("/profile")
        )
      }
    }
    return pathname === item.href || pathname.startsWith(item.href + "/")
  }

  const navContent = (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around h-16 px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = isItemActive(item)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors",
                isActive ? "text-black" : "text-gray-400"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {getLabel(item.labelKey)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )

  // Use portal to render directly into document.body, bypassing any
  // overflow-hidden or stacking context issues from parent containers
  if (!mounted) return null
  return createPortal(navContent, document.body)
}
