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

  // Equipment + services available for this studio (services include host-wide).
  const [{ data: equipment }, { data: services }] = await Promise.all([
    supabase
      .from("equipment")
      .select("*")
      .eq("studio_id", studioId)
      .eq("is_available", true),
    supabase
      .from("services")
      .select("id, name, description, price, pricing_unit, studio_id")
      .eq("is_active", true)
      .or(`studio_id.eq.${studioId},studio_id.is.null`)
      .order("price", { ascending: true }),
  ])

  // Parse pre-selected services from URL (svc_<id>=1)
  const initialServices: Record<string, number> = {}
  Object.entries(allParams).forEach(([key, value]) => {
    if (key.startsWith("svc_") && value) {
      initialServices[key.replace("svc_", "")] = parseInt(value) || 1
    }
  })

  return (
    <SessionDetailsClient
      studio={studio}
      equipment={equipment || []}
      services={services || []}
      initialDate={date}
      initialTime={start}
      initialDuration={duration ? parseInt(duration) : undefined}
      initialEquipment={Object.keys(initialEquipment).length > 0 ? initialEquipment : undefined}
      initialServices={Object.keys(initialServices).length > 0 ? initialServices : undefined}
    />
  )
}
