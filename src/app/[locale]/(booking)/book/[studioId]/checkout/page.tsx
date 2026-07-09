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

  // Profile read via admin client — `email` + `phone` are blocked for the
  // authenticated role by migration 018. Narrow the select to only the fields
  // CheckoutClient uses so the RSC payload doesn't leak bank_iban,
  // stripe_customer_id, two_factor_enabled, etc. into page source.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("id, full_name, email, phone")
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

  // Service selections (svc_<id>=qty)
  const serviceSelections: Record<string, number> = {}
  Object.entries(searchParamsData).forEach(([key, value]) => {
    if (key.startsWith("svc_") && value) {
      serviceSelections[key.replace("svc_", "")] = parseInt(value, 10)
    }
  })
  const serviceIds = Object.keys(serviceSelections)
  let services: { id: string; name: string; price: number; pricing_unit: "flat" | "per_hour" | "per_session" }[] = []
  if (serviceIds.length > 0) {
    const { data } = await supabase
      .from("services")
      .select("id, name, price, pricing_unit")
      .in("id", serviceIds)
      .eq("is_active", true)
    services = data || []
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
      services={services}
      serviceSelections={serviceSelections}
      bookingDetails={bookingDetails}
      projectId={searchParamsData.project || null}
    />
  )
}
