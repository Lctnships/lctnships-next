import { createClient } from "@/lib/supabase/server"
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

  // Get user's security settings
  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("two_factor_enabled")
    .eq("user_id", user.id)
    .single()

  const twoFactorEnabled = userSettings?.two_factor_enabled ?? false

  return (
    <SecuritySettingsClient
      devices={[]}
      twoFactorEnabled={twoFactorEnabled}
    />
  )
}
