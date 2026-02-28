"use client"

import { useState } from "react"
import { Link, usePathname, useRouter } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/use-user"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Heart,
  MessageSquare,
  Bell,
  User,
  Settings,
  ArrowRightLeft,
  LogOut,
  Menu,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Boekingen", icon: Calendar },
  { href: "/projects", label: "Projecten", icon: FolderOpen },
  { href: "/favorites", label: "Favorieten", icon: Heart },
  { href: "/messages", label: "Berichten", icon: MessageSquare },
  { href: "/notifications", label: "Notificaties", icon: Bell },
  { href: "/profile", label: "Profiel", icon: User },
  { href: "/settings", label: "Instellingen", icon: Settings },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useUser()

  const isHost = profile?.user_type === "host" || profile?.user_type === "both"
  const isInHostMode = pathname.startsWith("/host")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 14V34" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="text-lg font-extrabold tracking-tight">lcntships</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        {user && (
          <div className="border-t px-3 py-3 space-y-1">
            {!isInHostMode ? (
              <button
                onClick={() => {
                  router.push(isHost ? "/host/dashboard" : "/host/onboarding")
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm font-medium transition-colors text-primary hover:bg-primary/10 w-full"
              >
                <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
                <span>{isHost ? "Switch naar Host" : "Word Host"}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push("/dashboard")
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm font-medium transition-colors text-primary hover:bg-primary/10 w-full"
              >
                <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
                <span>Terug naar huren</span>
              </button>
            )}

            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm font-medium transition-colors text-rose-500 hover:bg-rose-50 w-full"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span>Uitloggen</span>
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
