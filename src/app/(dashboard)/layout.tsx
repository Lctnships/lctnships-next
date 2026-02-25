import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { UserProvider } from "@/components/providers/user-provider"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Fetch user server-side — the middleware already validated & refreshed the session,
  // so this is guaranteed to succeed for authenticated users.
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
    profile = data
  }

  return (
    <UserProvider initialUser={user} initialProfile={profile}>
      <div className="h-screen flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}
