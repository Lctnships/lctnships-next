import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ServicesClient } from "./services-client"

export async function generateMetadata() {
  const t = await getTranslations("Navigation")
  return { title: t("services") }
}

export default async function HostServicesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [{ data: services }, { data: studios }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("host_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("studios")
      .select("id, title")
      .eq("host_id", user.id)
      .order("title", { ascending: true }),
  ])

  return (
    <ServicesClient
      initialServices={services ?? []}
      studios={studios ?? []}
    />
  )
}
