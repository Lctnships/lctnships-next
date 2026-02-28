import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FolderOpen, Heart, Search, ArrowRight } from "lucide-react"
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

  const { data: profileData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  const profile = profileData as any

  // Get upcoming bookings
  const { data: upcomingBookingsData } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (title, city)
    `)
    .eq("renter_id", user.id)
    .gte("start_datetime", new Date().toISOString())
    .in("status", ["confirmed", "pending"])
    .order("start_datetime")
    .limit(3)

  const upcomingBookings = upcomingBookingsData as any[] | null

  // Get active projects
  const { data: activeProjectsData } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(3)

  const activeProjects = activeProjectsData as any[] | null

  // Get favorites count
  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold">
          {t("welcome")}{profile?.full_name?.split(" ")[0] || t("welcomeFallback")}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/studios">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{t("searchStudios")}</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/bookings">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{t("bookings")}</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/projects">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{t("projects")}</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/favorites">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">
                {t("favorites")} ({favoritesCount || 0})
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upcoming bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("upcomingBookingsTitle")}</CardTitle>
              <CardDescription>{t("upcomingBookingsDesc")}</CardDescription>
            </div>
            <Link href="/bookings">
              <Button variant="ghost" size="sm">
                {t("viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!upcomingBookings || upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("noUpcomingBookings")}</p>
                <Link href="/studios">
                  <Button variant="link">{t("discoverStudios")}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{booking.studio?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeDate(booking.start_datetime)}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("activeProjectsTitle")}</CardTitle>
              <CardDescription>{t("activeProjectsDesc")}</CardDescription>
            </div>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                {t("viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!activeProjects || activeProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("noActiveProjects")}</p>
                <Link href="/projects">
                  <Button variant="link">{t("createFirstProject")}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {project.project_type}
                        </p>
                      </div>
                      <StatusBadge status={project.status} variant="project" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
