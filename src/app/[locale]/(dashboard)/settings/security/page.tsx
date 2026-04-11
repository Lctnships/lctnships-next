import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { SecuritySettingsClient } from "./security-settings-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Security")
  return { title: t("metaTitle") }
}

export default async function SecuritySettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Admin client for two_factor_enabled — migration 018 blocks it from authenticated.
  const admin = createAdminClient()
  const { data: userData } = await admin
    .from("users")
    .select("two_factor_enabled")
    .eq("id", user.id)
    .single()

  const twoFactorEnabled = userData?.two_factor_enabled ?? false

  // Get real sessions from user_sessions table
  const { data: sessions } = await supabase
    .from("user_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("last_active_at", { ascending: false })

  const devices = (sessions || []).map((session) => ({
    id: session.id,
    name: session.device_name || "Unknown Device",
    type: (session.device_type || "desktop") as "laptop" | "phone" | "desktop" | "tablet",
    location: session.location || session.ip_address || "Unknown",
    browser: session.browser || "Unknown Browser",
    isCurrent: session.is_current ?? false,
  }))

  return (
    <SecuritySettingsClient
      devices={devices}
      twoFactorEnabled={twoFactorEnabled}
    />
  )
}
