import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { CheckoutClient } from "./checkout-client"

interface CheckoutPageProps {
  params: Promise<{ studioId: string }>
  searchParams: Promise<{
    date?: string
    start?: string
    duration?: string
    [key: string]: string | undefined
  }>
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { studioId } = await params
  const searchParamsData = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/book/${studioId}/checkout`)
  }

  // Profile read via admin client — sensitive columns (phone, email,
  // stripe_customer_id) are blocked for the authenticated role by migration 018.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single()

  // Get studio
  const { data: studio } = await supabase
    .from("studios")
    .select(`
      *,
      studio_images (image_url, is_cover)
    `)
    .eq("id", studioId)
    .single()

  if (!studio) {
    redirect("/studios")
  }

  // Parse equipment selections from query params
  const equipmentSelections: Record<string, number> = {}
  Object.entries(searchParamsData).forEach(([key, value]) => {
    if (key.startsWith("eq_") && value) {
      const equipmentId = key.replace("eq_", "")
      equipmentSelections[equipmentId] = parseInt(value, 10)
    }
  })

  // Get selected equipment details
  const equipmentIds = Object.keys(equipmentSelections)
  let equipment: { id: string; name: string; price_per_day: number }[] = []

  if (equipmentIds.length > 0) {
    const { data: equipmentData } = await supabase
      .from("equipment")
      .select("*")
      .in("id", equipmentIds)

    equipment = equipmentData || []
  }

  // Mock equipment if real ones not found
  if (equipmentIds.length > 0 && equipment.length === 0) {
    const mockEquipment: Record<string, { id: string; name: string; price_per_day: number }> = {
      eq1: { id: "eq1", name: "Professional Lighting Kit", price_per_day: 45 },
      eq2: { id: "eq2", name: "Seamless Paper Backdrop", price_per_day: 25 },
      eq3: { id: "eq3", name: "Studio Assistant", price_per_day: 75 },
      eq4: { id: "eq4", name: "Catering Pack", price_per_day: 55 },
    }
    equipment = equipmentIds
      .map(id => mockEquipment[id])
      .filter(Boolean)
  }

  const bookingDetails = {
    date: searchParamsData.date || new Date().toISOString().split("T")[0],
    startTime: searchParamsData.start || "10:00",
    duration: parseInt(searchParamsData.duration || "2", 10),
  }

  return (
    <CheckoutClient
      studio={studio}
      profile={profile}
      equipment={equipment}
      equipmentSelections={equipmentSelections}
      bookingDetails={bookingDetails}
    />
  )
}
