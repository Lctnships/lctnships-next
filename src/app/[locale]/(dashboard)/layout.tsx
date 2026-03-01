import { Link } from "@/i18n/routing"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import Image from "next/image"

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
          <Link href="/" className="ml-2 flex items-center">
            <Image src="/Lctnships-cropped.png" alt="lcntships" width={120} height={53} className="h-7 w-auto" />
          </Link>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
