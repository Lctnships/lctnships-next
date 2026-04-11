import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExtendSessionClient } from "./extend-client"

interface ExtendPageProps {
  params: Promise<{ id: string }>
}

export default async function ExtendPage({ params }: ExtendPageProps) {
  const { id: bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/bookings/${bookingId}/extend`)
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      *,
      studio:studios (
        id,
        title,
        price_per_hour,
        booking_mode,
        booking_blocks,
        allow_extensions,
        max_extension_hours,
        city
      ),
      booking_equipment (
        id,
        quantity,
        equipment (id, name, price_per_day)
      )
    `)
    .eq("id", bookingId)
    .single()

  if (bookingError || !booking) {
    redirect("/bookings")
  }

  if (booking.renter_id !== user.id) {
    redirect("/bookings")
  }

  if (booking.status !== 'confirmed') {
    redirect(`/bookings/${bookingId}`)
  }

  const { data: availabilityData } = await supabase.rpc('get_extension_availability', {
    p_booking_id: bookingId
  })

  const availableHours = availabilityData?.[0]?.available_hours || 0

  if (availableHours < 0.5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">block</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Verlengen niet mogelijk</h1>
          <p className="text-gray-600">Er is geen beschikbare tijd om deze sessie te verlengen.</p>
        </div>
      </div>
    )
  }

  return <ExtendSessionClient booking={booking} availableHours={availableHours} />
}