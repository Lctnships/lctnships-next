"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Heart,
  MessageSquare,
  Bell,
  User,
  Settings,
  PanelLeft,
  ArrowRightLeft,
  LogOut,
  Building2,
  DollarSign,
  Package,
  Briefcase,
} from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { useTranslations } from "next-intl"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import Image from "next/image"

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useUser()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  })
  const t = useTranslations("Navigation")

  const renterNavItems = [
    { href: "/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/bookings" as const, label: t("bookings"), icon: Calendar },
    { href: "/projects" as const, label: t("projects"), icon: FolderOpen },
    { href: "/favorites" as const, label: t("favorites"), icon: Heart },
    { href: "/messages" as const, label: t("messages"), icon: MessageSquare },
    { href: "/notifications" as const, label: t("notifications"), icon: Bell },
    { href: "/profile" as const, label: t("profile"), icon: User },
    { href: "/settings" as const, label: t("settings"), icon: Settings },
  ]

  const hostNavItems = [
    { href: "/host/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/host/bookings" as const, label: t("bookings"), icon: Calendar },
    { href: "/host/studios" as const, label: t("studios") || "Studio's", icon: Building2 },
    { href: "/host/calendar" as const, label: t("calendar") || "Kalender", icon: Calendar },
    { href: "/host/earnings" as const, label: t("earnings") || "Inkomsten", icon: DollarSign },
    { href: "/host/equipment" as const, label: t("equipment") || "Apparatuur", icon: Package },
    { href: "/host/services" as const, label: t("services") || "Diensten", icon: Briefcase },
    { href: "/host/messages" as const, label: t("messages"), icon: MessageSquare },
    { href: "/host/settings" as const, label: t("settings"), icon: Settings },
  ]

  const isHost = profile?.user_type === "host" || profile?.user_type === "both"
  const isInHostMode = pathname.startsWith("/host")

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-20 border-b", collapsed ? "justify-center px-2" : "px-6")}>
        <Link href="/" className="flex items-center">
          <Image
            src="/Lctnships-cropped.png"
            alt="lctnships"
            width={collapsed ? 28 : 120}
            height={collapsed ? 28 : 53}
            className={cn(collapsed ? "h-7 w-7 object-contain" : "h-8 w-auto")}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {(isInHostMode ? hostNavItems : renterNavItems).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm transition-colors",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-black text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return linkContent
        })}
      </nav>

      {/* Bottom section: Switch + Uitloggen + Toggle */}
      {user && (
        <div className={cn("border-t px-2 pt-2 space-y-1", collapsed ? "items-center" : "")}>
          {/* Switch naar Host / Huurder */}
          {!isInHostMode ? (
            <button
              onClick={() => router.push(isHost ? "/host/dashboard" : "/host/onboarding")}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors text-black hover:bg-gray-100 w-full",
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              )}
            >
              <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{isHost ? t("toHostMode") : t("becomeHost")}</span>}
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors text-black hover:bg-gray-100 w-full",
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              )}
            >
              <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{t("backToRenting")}</span>}
            </button>
          )}

          {/* Uitloggen */}
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors text-rose-500 hover:bg-rose-50 w-full",
              collapsed ? "justify-center px-2" : "gap-3 px-3"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{t("signOut")}</span>}
          </button>
        </div>
      )}

      {/* Toggle button */}
      <div className={cn("border-t p-2 mt-1", collapsed ? "flex justify-center" : "flex justify-end px-4")}>
        <button
          onClick={toggleCollapsed}
          className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        >
          <PanelLeft
            className={cn(
              "h-[18px] w-[18px] transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  )
}
