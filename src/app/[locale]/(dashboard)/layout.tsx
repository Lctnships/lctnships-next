import { Link } from "@/i18n/routing"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header - only visible below lg */}
        <div className="lg:hidden flex items-center h-14 border-b px-4 bg-background shrink-0">
          <MobileSidebar />
          <Link href="/" className="ml-2 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 14V34" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="font-extrabold tracking-tight">lcntships</span>
          </Link>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
