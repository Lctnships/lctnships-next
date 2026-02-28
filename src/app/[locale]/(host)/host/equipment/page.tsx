import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EquipmentClient } from "./equipment-client"

export const metadata = {
  title: "Add Equipment",
}

export default async function AddEquipmentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get user's studios for equipment assignment
  const { data: studios } = await supabase
    .from("studios")
    .select("id, title")
    .eq("host_id", user.id)

  return <EquipmentClient studios={studios || []} />
}
