import { Navbar } from "@/components/layout/navbar"

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  )
}
