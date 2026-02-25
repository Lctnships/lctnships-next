"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Heart,
  MessageSquare,
  Bell,
  User,
  Settings,
} from "lucide-react"

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

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">LCNTSHIPS</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {userNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
