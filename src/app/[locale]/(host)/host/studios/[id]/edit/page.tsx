import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { StudioEditClient } from "./studio-edit-client"

export const metadata = {
  title: "Studio Bewerken",
}

export default async function StudioEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: studio } = await supabase
    .from("studios")
    .select(`
      *,
      studio_images (id, image_url, is_cover, order_index)
    `)
    .eq("id", id)
    .eq("host_id", user.id)
    .single()

  if (!studio) notFound()

  return <StudioEditClient studio={studio} />
}
