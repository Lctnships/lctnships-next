"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, Sparkles, BookOpen, Home, Calendar, FolderOpen, Heart, MessageSquare, User, Settings, LogOut, CreditCard } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useUser } from "@/hooks/use-user"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

export function Navbar() {
  const pathname = usePathname()
  const { user, profile, signOut, isLoading } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("Navigation")

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image src="/Lctnships-cropped.png" alt="lcntships" width={140} height={62} className="h-8 md:h-9 w-auto" priority />
        </Link>

        {/* Desktop Navigation - Absolutely centered (hidden on host dashboard pages) */}
        {!pathname.startsWith("/host") && (
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/studios"
              className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              {t("findStudio")}
            </Link>
            <Link
              href="/inspiration"
              className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              {t("inspiration")}
            </Link>
            <Link
              href="/blog"
              className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
            >
              {t("blog")}
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <>
              {mounted ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="bg-black text-white">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-xl border-gray-100" align="end" sideOffset={8} forceMount>
                    <div className="flex items-center gap-3 px-3 py-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="bg-black text-white text-sm font-bold">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col leading-none min-w-0">
                        {profile?.full_name && (
                          <p className="font-semibold text-sm truncate">{profile.full_name}</p>
                        )}
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="my-1" />
                    {[
                      { href: "/dashboard" as const, icon: Home, label: t("overview") },
                      { href: "/bookings" as const, icon: Calendar, label: t("myBookings") },
                      { href: "/projects" as const, icon: FolderOpen, label: t("myProjects") },
                      { href: "/favorites" as const, icon: Heart, label: t("favorites") },
                      { href: "/messages" as const, icon: MessageSquare, label: t("messages") },
                      { href: "/credits" as const, icon: CreditCard, label: t("creditCard") },
                    ].map((item) => (
                      <DropdownMenuItem key={item.href} asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="my-1" />
                    {[
                      { href: "/profile" as const, icon: User, label: t("profile") },
                      { href: "/settings" as const, icon: Settings, label: t("settings") },
                    ].map((item) => (
                      <DropdownMenuItem key={item.href} asChild className="rounded-xl px-3 py-2.5 cursor-pointer">
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem onClick={() => signOut()} className="rounded-xl px-3 py-2.5 cursor-pointer text-rose-500 focus:text-rose-500 focus:bg-rose-50">
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="text-sm font-medium">{t("signOut")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-100" />
              )}
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/host/onboarding">
                <Button variant="ghost" className="text-sm font-semibold text-gray-600 hover:text-black">
                  {t("rentYourStudio")}
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-black text-white text-sm font-bold px-8 py-3 rounded-full hover:bg-gray-800 transition-all">
                  {t("login")}
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu — hidden on host pages (they use MobileBottomNav) */}
          {mounted ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className={cn("lg:hidden", pathname.startsWith("/host") && "hidden")}>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col" showCloseButton={false}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Image src="/Lctnships-cropped.png" alt="lcntships" width={120} height={53} className="h-7 w-auto" />
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <span className="material-symbols-outlined text-xl">close</span>
                    </Button>
                  </SheetClose>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-1">
                    {[
                      { href: "/studios" as const, icon: Search, label: t("findStudio") },
                      { href: "/inspiration" as const, icon: Sparkles, label: t("inspiration") },
                      { href: "/blog" as const, icon: BookOpen, label: t("blog") },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                          pathname === item.href
                            ? "bg-gray-100 text-black"
                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {user ? (
                    <>
                      {[
                        { href: "/dashboard" as const, icon: Home, label: t("overview") },
                        { href: "/bookings" as const, icon: Calendar, label: t("myBookings") },
                        { href: "/projects" as const, icon: FolderOpen, label: t("myProjects") },
                        { href: "/favorites" as const, icon: Heart, label: t("favorites") },
                        { href: "/messages" as const, icon: MessageSquare, label: t("messages") },
                        { href: "/profile" as const, icon: User, label: t("profile") },
                        { href: "/settings" as const, icon: Settings, label: t("settings") },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors ${
                            pathname === item.href
                              ? "bg-gray-100 text-black"
                              : "text-gray-600 hover:bg-gray-50 hover:text-black"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { signOut(); setMobileMenuOpen(false) }}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors w-full"
                      >
                        <LogOut className="h-5 w-5" />
                        {t("signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/host/onboarding"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        <Home className="h-5 w-5" />
                        {t("rentYourStudio")}
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        <User className="h-5 w-5" />
                        {t("login")}
                      </Link>
                    </>
                  )}

                  {/* Mobile language switcher */}
                  <div className="mt-4 pt-4 border-t border-gray-100 px-4">
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className={cn("lg:hidden", pathname.startsWith("/host") && "hidden")}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
