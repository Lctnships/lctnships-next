import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Calendar, Check, X } from "lucide-react"
import { Link } from "@/i18n/routing"
import { formatDateRange, formatTimeAgo } from "@/lib/utils/format-date"
import { formatCurrency } from "@/lib/utils/format-currency"

export const metadata = {
  title: "Boekingen Beheren",
}

export default async function HostBookingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (title),
      renter:users!bookings_renter_id_fkey (full_name, avatar_url, email)
    `)
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  const pendingBookings = bookings?.filter((b) => b.status === "pending") || []
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed") || []
  const completedBookings = bookings?.filter((b) => b.status === "completed" || b.status === "cancelled") || []

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Boekingen</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-0.5">
          Bekijk en beheer boekingsaanvragen
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="pending" className="text-xs md:text-sm">
            Openstaand ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs md:text-sm">
            Bevestigd ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">
            Geschiedenis ({completedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 md:mt-6">
          {pendingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Geen openstaande aanvragen"
              description="Nieuwe boekingsaanvragen verschijnen hier"
            />
          ) : (
            <div className="space-y-3 md:space-y-4">
              {pendingBookings.map((booking) => (
                <BookingRequestCard key={booking.id} booking={booking} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-4 md:mt-6">
          {confirmedBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Geen bevestigde boekingen"
              description="Bevestigde boekingen verschijnen hier"
            />
          ) : (
            <div className="space-y-3 md:space-y-4">
              {confirmedBookings.map((booking) => (
                <BookingRequestCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 md:mt-6">
          {completedBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Geen geschiedenis"
              description="Voltooide en geannuleerde boekingen verschijnen hier"
            />
          ) : (
            <div className="space-y-3 md:space-y-4">
              {completedBookings.map((booking) => (
                <BookingRequestCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingRequestCard({ booking, showActions }: { booking: any; showActions?: boolean }) {
  return (
    <Link href={`/host/bookings/${booking.id}`} className="block">
      <Card className="transition-colors hover:border-black/20 shadow-none border">
        <CardContent className="p-3.5 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <UserAvatar
              src={booking.renter?.avatar_url}
              name={booking.renter?.full_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base truncate">{booking.renter?.full_name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{booking.studio?.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm md:text-lg font-semibold">{formatCurrency(booking.host_payout)}</p>
                  <p className="text-xs text-muted-foreground">{booking.total_hours} uur</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground truncate">
                  {formatDateRange(booking.start_datetime, booking.end_datetime)}
                </p>
                {!showActions && <StatusBadge status={booking.status} />}
              </div>

              {showActions && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="text-red-600 flex-1 md:flex-none h-8 text-xs md:text-sm">
                    <X className="h-3.5 w-3.5 mr-1" />
                    Afwijzen
                  </Button>
                  <Button size="sm" className="flex-1 md:flex-none h-8 text-xs md:text-sm">
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Accepteren
                  </Button>
                </div>
              )}
            </div>
          </div>

          {booking.notes && (
            <div className="mt-3 p-2.5 md:p-3 bg-muted rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground">
                <span className="font-medium">Notitie:</span> {booking.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
