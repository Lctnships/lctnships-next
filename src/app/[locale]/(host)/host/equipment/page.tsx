import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EquipmentClient } from "./equipment-client"

export const metadata = {
  title: "Equipment",
}

export default async function EquipmentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get user's studios for equipment assignment
  const { data: studios } = await supabase
    .from("studios")
    .select("id, title")
    .eq("host_id", user.id)

  const studioIds = (studios || []).map(s => s.id)

  // Get existing equipment for user's studios
  const { data: equipment } = studioIds.length > 0
    ? await supabase
        .from("equipment")
        .select("*, studios(title)")
        .in("studio_id", studioIds)
        .order("created_at", { ascending: false })
    : { data: [] }

  return <EquipmentClient studios={studios || []} equipment={equipment || []} />
}
