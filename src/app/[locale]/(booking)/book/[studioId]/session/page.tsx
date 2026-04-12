import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionDetailsClient } from "./session-details-client"

interface SessionPageProps {
  params: Promise<{ studioId: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const { studioId } = await params
  const allParams = await searchParams
  const { date, start, duration } = allParams

  // Parse pre-selected equipment from URL params (eq_opt_1=1, eq_opt_2=1, etc.)
  const initialEquipment: Record<string, number> = {}
  Object.entries(allParams).forEach(([key, value]) => {
    if (key.startsWith("eq_") && value) {
      const eqId = key.replace("eq_", "")
      initialEquipment[eqId] = parseInt(value) || 1
    }
  })
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const paramStr = new URLSearchParams(allParams as Record<string, string>).toString()
    redirect(`/login?redirect=/book/${studioId}/session${paramStr ? `?${paramStr}` : ""}`)
  }

  // Get studio with images
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

  // Get available equipment for this studio
  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .eq("studio_id", studioId)
    .eq("is_available", true)

  return (
    <SessionDetailsClient
      studio={studio}
      equipment={equipment || []}
      initialDate={date}
      initialTime={start}
      initialDuration={duration ? parseInt(duration) : undefined}
      initialEquipment={Object.keys(initialEquipment).length > 0 ? initialEquipment : undefined}
    />
  )
}
