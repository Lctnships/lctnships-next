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
import { useTranslations } from "next-intl"
import Image from "next/image"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useUser()
  const t = useTranslations("Navigation")

  const isHost = profile?.user_type === "host" || profile?.user_type === "both"
  const isInHostMode = pathname.startsWith("/host")

  const navItems = [
    { href: "/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/bookings" as const, label: t("bookings"), icon: Calendar },
    { href: "/projects" as const, label: t("projects"), icon: FolderOpen },
    { href: "/favorites" as const, label: t("favorites"), icon: Heart },
    { href: "/messages" as const, label: t("messages"), icon: MessageSquare },
    { href: "/notifications" as const, label: t("notifications"), icon: Bell },
    { href: "/profile" as const, label: t("profile"), icon: User },
    { href: "/settings" as const, label: t("settings"), icon: Settings },
  ]

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
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <Image src="/Lctnships-cropped.png" alt="lctnships" width={120} height={53} className="h-7 w-auto" />
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
                    ? "bg-black text-white"
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
                className="flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm font-medium transition-colors text-black hover:bg-gray-100 w-full"
              >
                <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
                <span>{isHost ? t("toHostMode") : t("becomeHost")}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push("/dashboard")
                  setOpen(false)
                }}
                className="flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm font-medium transition-colors text-black hover:bg-gray-100 w-full"
              >
                <ArrowRightLeft className="h-[18px] w-[18px] shrink-0" />
                <span>{t("backToRenting")}</span>
              </button>
            )}

            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 rounded-lg py-2.5 text-sm font-medium transition-colors text-rose-500 hover:bg-rose-50 w-full"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span>{t("signOut")}</span>
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
