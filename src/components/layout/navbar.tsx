"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, Sparkles, BookOpen, Home, Calendar, FolderOpen, Heart, MessageSquare, User, Settings, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { useUser } from "@/hooks/use-user"
import { useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const { user, profile, signOut, isLoading } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image src="/Lctnships-cropped.png" alt="lcntships" width={140} height={62} className="h-8 md:h-9 w-auto" priority />
        </Link>

        {/* Desktop Navigation - Absolutely centered */}
        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link
            href="/studios"
            className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            Find a Studio
          </Link>
          <Link
            href="/inspiration"
            className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            Inspiration
          </Link>
          <Link
            href="/blog"
            className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            Blog
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
          ) : user ? (
            <>
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary text-white">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && (
                        <p className="font-medium">{profile.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">Mijn Boekingen</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/projects">Mijn Projecten</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">Favorieten</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">Berichten</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/credits">Strippenkaart</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profiel</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Instellingen</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    Uitloggen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/host/onboarding">
                <Button variant="ghost" className="text-sm font-semibold text-gray-600 hover:text-black">
                  List your Studio
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-primary text-white text-sm font-bold px-8 py-3 rounded-full hover:bg-gray-800 transition-all">
                  Inloggen
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
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
                    { href: "/studios", icon: Search, label: "Find a Studio" },
                    { href: "/inspiration", icon: Sparkles, label: "Inspiration" },
                    { href: "/blog", icon: BookOpen, label: "Blog" },
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
                      { href: "/dashboard", icon: Home, label: "Dashboard" },
                      { href: "/bookings", icon: Calendar, label: "Mijn Boekingen" },
                      { href: "/projects", icon: FolderOpen, label: "Mijn Projecten" },
                      { href: "/favorites", icon: Heart, label: "Favorieten" },
                      { href: "/messages", icon: MessageSquare, label: "Berichten" },
                      { href: "/profile", icon: User, label: "Profiel" },
                      { href: "/settings", icon: Settings, label: "Instellingen" },
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
                      Uitloggen
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
                      List your Studio
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      <User className="h-5 w-5" />
                      Inloggen
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
