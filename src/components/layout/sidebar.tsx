"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
} from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed"

const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Boekingen", icon: Calendar },
  { href: "/projects", label: "Projecten", icon: FolderOpen },
  { href: "/favorites", label: "Favorieten", icon: Heart },
  { href: "/messages", label: "Berichten", icon: MessageSquare },
  { href: "/notifications", label: "Notificaties", icon: Bell },
  { href: "/profile", label: "Profiel", icon: User },
  { href: "/settings", label: "Instellingen", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile } = useUser()
  const [collapsed, setCollapsed] = useState(false)

  const isHost = profile?.user_type === "host" || profile?.user_type === "both"
  const isInHostMode = pathname.startsWith("/host")

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (stored === "true") setCollapsed(true)
  }, [])

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
      {/* Logo - icon only, no brand text */}
      <div className={cn("flex items-center h-20 border-b", collapsed ? "justify-center px-2" : "px-6")}>
        <Link href="/" className="flex items-center text-primary">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M24 14V34" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {userNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm transition-colors",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-primary text-primary-foreground"
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

      {/* Switch naar Host / Huurder button */}
      {profile && (
        <div className={cn("px-2 pb-2", collapsed ? "flex justify-center" : "")}>
          {isHost && !isInHostMode && (
            <button
              onClick={() => router.push("/host/dashboard")}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors text-primary hover:bg-primary/10 w-full",
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              )}
            >
              <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Switch naar Host</span>}
            </button>
          )}
          {isInHostMode && (
            <button
              onClick={() => router.push("/dashboard")}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors text-primary hover:bg-primary/10 w-full",
                collapsed ? "justify-center px-2" : "gap-3 px-3"
              )}
            >
              <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">Switch naar Huurder</span>}
            </button>
          )}
        </div>
      )}

      {/* Toggle button */}
      <div className={cn("border-t p-2", collapsed ? "flex justify-center" : "flex justify-end px-4")}>
        <button
          onClick={toggleCollapsed}
          className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label={collapsed ? "Sidebar uitklappen" : "Sidebar inklappen"}
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
