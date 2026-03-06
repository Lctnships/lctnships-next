import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6 bg-muted/30">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
