import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PrivacySettingsClient } from "@/app/[locale]/(dashboard)/settings/privacy/privacy-settings-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Privacy")
  return { title: t("metaTitle") }
}

// Defaults for users who haven't saved settings yet. These are real defaults,
// not mock data — the user sees these on first visit until they change something.
const DEFAULT_NOTIFICATION_SETTINGS = {
  newBookings: { email: true, sms: true, push: false },
  messages: { email: true, sms: false, push: true },
  platformUpdates: { email: true, sms: false, push: false },
  reviews: { email: true, sms: false, push: true },
}

const DEFAULT_PRIVACY_SETTINGS = {
  profileVisibility: "marketplace",
  showPortfolioToUnregistered: true,
}

export default async function HostPrivacySettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("notification_preferences, privacy_settings")
    .eq("user_id", user.id)
    .single()

  const notificationSettings = userSettings?.notification_preferences || DEFAULT_NOTIFICATION_SETTINGS
  const privacySettings = userSettings?.privacy_settings || DEFAULT_PRIVACY_SETTINGS

  return (
    <PrivacySettingsClient
      notificationSettings={notificationSettings}
      privacySettings={privacySettings}
      settingsHref="/host/settings"
    />
  )
}
