import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Calendar } from "lucide-react"
import { Link } from "@/i18n/routing"
import { formatDateRange } from "@/lib/utils/format-date"
import { formatCurrency } from "@/lib/utils/format-currency"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("HostBookings")
  return { title: t("pageTitle") }
}

export default async function HostBookingsPage() {
  const supabase = await createClient()
  const t = await getTranslations("HostBookings")

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

  const pendingBookings = bookings?.filter((b) => b.status === "pending" || b.status === "pending_approval") || []
  const confirmedBookings = bookings?.filter((b) => b.status === "confirmed" || b.status === "approved") || []
  const completedBookings = bookings?.filter((b) => b.status === "completed" || b.status === "cancelled") || []

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-0.5">{t("subtitle")}</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="pending" className="text-xs md:text-sm">
            {t("pendingTab", { count: pendingBookings.length })}
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="text-xs md:text-sm">
            {t("confirmedTab", { count: confirmedBookings.length })}
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">
            {t("historyTab", { count: completedBookings.length })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 md:mt-6">
          {pendingBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t("noPending")}
              description={t("noPendingDesc")}
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
              title={t("noConfirmed")}
              description={t("noConfirmedDesc")}
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
              title={t("noHistory")}
              description={t("noHistoryDesc")}
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

interface BookingWithRelations {
  id: string
  start_datetime: string
  end_datetime: string
  total_hours: number
  host_payout: number
  status: "pending" | "confirmed" | "cancelled" | "completed" | "paid" | "refunded" | "active" | "archived"
  notes?: string
  studio?: { title?: string }
  renter?: { full_name?: string; avatar_url?: string; email?: string }
}

function BookingRequestCard({ booking, showActions }: { booking: BookingWithRelations; showActions?: boolean }) {
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
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge status={booking.status} />
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    →
                  </span>
                </div>
              )}
            </div>
          </div>

          {booking.notes && (
            <div className="mt-3 p-2.5 md:p-3 bg-muted rounded-lg">
              <p className="text-xs md:text-sm text-muted-foreground">
                <span className="font-medium">{booking.notes}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
