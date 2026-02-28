import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Calendar, Check, X } from "lucide-react"
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Boekingen Beheren</h1>
        <p className="text-muted-foreground mt-1">
          Bekijk en beheer boekingsaanvragen
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            In afwachting ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Bevestigd ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Geschiedenis ({completedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Geen openstaande aanvragen"
              description="Nieuwe boekingsaanvragen verschijnen hier"
            />
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <BookingRequestCard key={booking.id} booking={booking} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Geen bevestigde boekingen"
              description="Bevestigde boekingen verschijnen hier"
            />
          ) : (
            <div className="space-y-4">
              {confirmedBookings.map((booking) => (
                <BookingRequestCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {completedBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Geen geschiedenis"
              description="Voltooide en geannuleerde boekingen verschijnen hier"
            />
          ) : (
            <div className="space-y-4">
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
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <UserAvatar
              src={booking.renter?.avatar_url}
              name={booking.renter?.full_name}
              size="lg"
            />
            <div>
              <p className="font-semibold">{booking.renter?.full_name}</p>
              <p className="text-sm text-muted-foreground">{booking.studio?.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDateRange(booking.start_datetime, booking.end_datetime)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aangevraagd {formatTimeAgo(booking.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-semibold">{formatCurrency(booking.host_payout)}</p>
              <p className="text-sm text-muted-foreground">{booking.total_hours} uur</p>
            </div>
            {showActions ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-red-600">
                  <X className="h-4 w-4 mr-1" />
                  Afwijzen
                </Button>
                <Button size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Accepteren
                </Button>
              </div>
            ) : (
              <StatusBadge status={booking.status} />
            )}
          </div>
        </div>

        {booking.notes && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Notitie:</span> {booking.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
