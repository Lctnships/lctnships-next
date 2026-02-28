import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Calendar, Building2, Star, TrendingUp, ArrowUpRight } from "lucide-react"
import { Link } from "@/i18n/routing"
import { formatCurrency } from "@/lib/utils/format-currency"
import { formatRelativeDate } from "@/lib/utils/format-date"
import { StatusBadge } from "@/components/shared/status-badge"

export const metadata = {
  title: "Host Dashboard",
}

export default async function HostDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get studios count
  const { count: studiosCount } = await supabase
    .from("studios")
    .select("*", { count: "exact", head: true })
    .eq("host_id", user.id)

  // Get total earnings (completed bookings)
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("host_payout")
    .eq("host_id", user.id)
    .eq("status", "completed")
    .eq("payment_status", "paid")

  const totalEarnings = completedBookings?.reduce((sum, b) => sum + b.host_payout, 0) || 0

  // Get pending payouts
  const { data: pendingPayouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("host_id", user.id)
    .eq("status", "pending")

  const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0

  // Get upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (title),
      renter:users!bookings_renter_id_fkey (full_name)
    `)
    .eq("host_id", user.id)
    .gte("start_datetime", new Date().toISOString())
    .in("status", ["confirmed", "pending"])
    .order("start_datetime")
    .limit(5)

  // Get average rating
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", user.id)
    .eq("review_type", "renter_to_studio")

  const avgRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overzicht van je studio&apos;s en boekingen
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Totale inkomsten</p>
                <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {pendingAmount > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                + {formatCurrency(pendingAmount)} in behandeling
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aankomende boekingen</p>
                <p className="text-2xl font-bold">{upcomingBookings?.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Studio&apos;s</p>
                <p className="text-2xl font-bold">{studiosCount || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gemiddelde rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">
                    {avgRating > 0 ? avgRating.toFixed(1) : "-"}
                  </p>
                  {avgRating > 0 && (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            {reviews && reviews.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {reviews.length} beoordelingen
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Aankomende boekingen</CardTitle>
            <CardDescription>Boekingen voor je studio&apos;s</CardDescription>
          </div>
          <Link href="/host/bookings" className="text-sm text-primary hover:underline flex items-center">
            Bekijk alles
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          {!upcomingBookings || upcomingBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Geen aankomende boekingen
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{booking.studio?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.renter?.full_name} &bull; {formatRelativeDate(booking.start_datetime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">{formatCurrency(booking.host_payout)}</span>
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
