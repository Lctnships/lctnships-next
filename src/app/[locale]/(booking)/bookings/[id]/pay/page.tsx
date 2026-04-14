import { createClient, createServiceClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PayClient } from "./pay-client"

interface PayPageProps {
  params: Promise<{ id: string }>
}

export default async function PayPage({ params }: PayPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/bookings/${id}/pay`)

  // Ownership check via user client.
  const { data: ownershipRow } = await supabase
    .from("bookings")
    .select("id, renter_id, status")
    .eq("id", id)
    .eq("renter_id", user.id)
    .single()
  if (!ownershipRow) redirect("/bookings")

  // Only 'approved' bookings can be paid via this link.
  if (ownershipRow.status !== "approved") {
    redirect(`/bookings/${id}`)
  }

  // Full row via service client (financial + joined studio columns).
  const admin = await createServiceClient()
  const { data: booking } = await admin
    .from("bookings")
    .select(`
      id, total_amount, total_hours, start_datetime, end_datetime,
      payment_deadline, booking_number,
      studio:studios (id, title, city, location, price_per_hour)
    `)
    .eq("id", id)
    .single()
  if (!booking) redirect("/bookings")

  const studioArr = booking.studio as unknown as Array<{
    id: string; title: string; city?: string; location?: string; price_per_hour: number
  }> | null
  const studio = Array.isArray(studioArr) ? studioArr[0] ?? null : (studioArr as unknown as null)

  return <PayClient booking={{ ...booking, studio }} />
}
