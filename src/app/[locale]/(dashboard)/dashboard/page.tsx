import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Link } from "@/i18n/routing"
import { formatRelativeDate } from "@/lib/utils/format-date"
import { StatusBadge } from "@/components/shared/status-badge"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Dashboard")
  return { title: t("metaTitle") }
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard")
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch all data in parallel instead of sequentially
  const [
    { data: profileData },
    { data: upcomingBookingsData },
    { data: activeProjectsData },
    { count: favoritesCount },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("bookings")
      .select(`*, studio:studios (title, city)`)
      .eq("renter_id", user.id)
      .gte("start_datetime", new Date().toISOString())
      .in("status", ["confirmed", "pending"])
      .order("start_datetime")
      .limit(3),
    supabase
      .from("projects")
      .select("*")
      .eq("owner_id", user.id)
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ])

  const profile = profileData as any
  const upcomingBookings = upcomingBookingsData as any[] | null
  const activeProjects = activeProjectsData as any[] | null

  const firstName = profile?.full_name?.split(" ")[0] || user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || t("welcomeFallback")

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Welcome header */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {t("welcome")}{firstName}!
        </h1>
        <p className="text-gray-500 mt-2 text-[15px]">
          {t("subtitle")}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/studios" as const, icon: "search", label: t("searchStudios") },
          { href: "/bookings" as const, icon: "calendar_month", label: t("bookings") },
          { href: "/projects" as const, icon: "folder_open", label: t("projects") },
          { href: "/favorites" as const, icon: "favorite", label: `${t("favorites")} (${favoritesCount || 0})` },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-center size-10 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined text-[20px] text-gray-700">{item.icon}</span>
              </div>
              <span className="font-semibold text-sm text-gray-800">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming bookings */}
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              <h2 className="font-bold text-lg">{t("upcomingBookingsTitle")}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{t("upcomingBookingsDesc")}</p>
            </div>
            <Link href="/bookings" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
              {t("viewAll")}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="px-6 pb-6 pt-3">
            {!upcomingBookings || upcomingBookings.length === 0 ? (
              <div className="text-center py-10">
                <div className="flex items-center justify-center size-16 rounded-2xl bg-gray-50 mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-gray-300">calendar_month</span>
                </div>
                <p className="text-gray-400 text-sm">{t("noUpcomingBookings")}</p>
                <Link href="/studios" className="inline-block mt-3 text-sm font-semibold text-black hover:underline">
                  {t("discoverStudios")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-white border border-gray-100">
                          <span className="material-symbols-outlined text-[20px] text-gray-500">event</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{booking.studio?.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatRelativeDate(booking.start_datetime)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active projects */}
        <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div>
              <h2 className="font-bold text-lg">{t("activeProjectsTitle")}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{t("activeProjectsDesc")}</p>
            </div>
            <Link href="/projects" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
              {t("viewAll")}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="px-6 pb-6 pt-3">
            {!activeProjects || activeProjects.length === 0 ? (
              <div className="text-center py-10">
                <div className="flex items-center justify-center size-16 rounded-2xl bg-gray-50 mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-gray-300">folder_open</span>
                </div>
                <p className="text-gray-400 text-sm">{t("noActiveProjects")}</p>
                <Link href="/projects" className="inline-block mt-3 text-sm font-semibold text-black hover:underline">
                  {t("createFirstProject")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-white border border-gray-100">
                          <span className="material-symbols-outlined text-[20px] text-gray-500">folder</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{project.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">
                            {project.project_type}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={project.status} variant="project" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
