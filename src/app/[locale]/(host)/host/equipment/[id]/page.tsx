import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { EquipmentDetailClient } from "./equipment-detail-client"

export const metadata = {
  title: "Equipment Detail",
}

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get equipment with studio info
  const { data: item } = await supabase
    .from("equipment")
    .select("*, studios(id, title, host_id)")
    .eq("id", id)
    .single()

  if (!item) notFound()

  // Verify ownership
  if (item.studios?.host_id !== user.id) notFound()

  // Get all user's studios for reassignment
  const { data: studios } = await supabase
    .from("studios")
    .select("id, title")
    .eq("host_id", user.id)

  return <EquipmentDetailClient item={item} studios={studios || []} />
}
