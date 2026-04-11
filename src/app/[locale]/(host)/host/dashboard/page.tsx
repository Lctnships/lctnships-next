import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Calendar, Building2, Star, ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatRelativeDate } from "@/lib/utils/format-date"
import { StatusBadge } from "@/components/shared/status-badge"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("HostDashboard")
  return { title: t("pageTitle") }
}

export default async function HostDashboardPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const t = await getTranslations("HostDashboard")

  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  // Run all dashboard queries in parallel instead of sequentially
  const [
    { count: studiosCount },
    { data: completedBookings },
    { data: pendingPayouts },
    { data: upcomingBookings },
    { data: reviews },
  ] = await Promise.all([
    supabase
      .from("studios")
      .select("*", { count: "exact", head: true })
      .eq("host_id", user.id),
    supabase
      .from("bookings")
      .select("host_payout")
      .eq("host_id", user.id)
      .eq("status", "completed")
      .eq("payment_status", "paid"),
    supabase
      .from("payouts")
      .select("amount")
      .eq("host_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select(`
        *,
        studio:studios (title),
        renter:users!bookings_renter_id_fkey (full_name)
      `)
      .eq("host_id", user.id)
      .gte("start_datetime", nowIso)
      .in("status", ["confirmed", "pending"])
      .order("start_datetime")
      .limit(5),
    supabase
      .from("reviews")
      .select("rating")
      .eq("reviewee_id", user.id)
      .eq("review_type", "renter_to_studio"),
  ])

  const totalEarnings = completedBookings?.reduce((sum, b) => sum + b.host_payout, 0) || 0
  const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0
  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-5 md:space-y-8">
      {/* Header — compact on mobile */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-0.5">{t("subtitle")}</p>
      </div>

      {/* Stats — 2x2 grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="shadow-none border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">{t("totalEarnings")}</p>
                <p className="text-lg md:text-2xl font-bold mt-0.5 truncate">{formatCurrency(totalEarnings)}</p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-green-100 flex-shrink-0">
                <DollarSign className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
            {pendingAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5 truncate">
                {t("pendingAmount", { amount: formatCurrency(pendingAmount) })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t("upcomingBookings")}</p>
                <p className="text-lg md:text-2xl font-bold mt-0.5">{upcomingBookings?.length || 0}</p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-blue-100 flex-shrink-0">
                <Calendar className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t("studios")}</p>
                <p className="text-lg md:text-2xl font-bold mt-0.5">{studiosCount || 0}</p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-purple-100 flex-shrink-0">
                <Building2 className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t("avgRating")}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-lg md:text-2xl font-bold">
                    {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                  </p>
                  {avgRating > 0 && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-yellow-100 flex-shrink-0">
                <Star className="h-4 w-4 md:h-6 md:w-6 text-yellow-600" />
              </div>
            </div>
            {reviews && reviews.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {t("reviewsCount", { count: reviews.length })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings — compact on mobile */}
      <Card className="shadow-none border">
        <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6 py-4 md:py-6">
          <div>
            <CardTitle className="text-base md:text-lg">{t("upcomingBookingsTitle")}</CardTitle>
            <CardDescription className="text-xs md:text-sm">{t("bookingsForStudios")}</CardDescription>
          </div>
          <Link href="/host/bookings" className="text-xs md:text-sm text-black hover:underline flex items-center flex-shrink-0">
            {t("viewAll")}
            <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
          </Link>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-4 md:pb-6 pt-0">
          {!upcomingBookings || upcomingBookings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              {t("noUpcomingBookings")}
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 md:p-4 border rounded-lg gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">{booking.studio?.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {booking.renter?.full_name} &bull; {formatRelativeDate(booking.start_datetime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                    <span className="font-semibold text-sm md:text-base">{formatCurrency(booking.host_payout)}</span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
