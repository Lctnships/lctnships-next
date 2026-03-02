import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PrivacySettingsClient } from "@/app/[locale]/(dashboard)/settings/privacy/privacy-settings-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Privacy")
  return { title: t("metaTitle") }
}

// Mock notification settings
const mockNotificationSettings = {
  newBookings: { email: true, sms: true, push: false },
  messages: { email: true, sms: false, push: true },
  platformUpdates: { email: true, sms: false, push: false },
  reviews: { email: true, sms: false, push: true },
}

const mockPrivacySettings = {
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

  const notificationSettings = userSettings?.notification_preferences || mockNotificationSettings
  const privacySettings = userSettings?.privacy_settings || mockPrivacySettings

  return (
    <PrivacySettingsClient
      notificationSettings={notificationSettings}
      privacySettings={privacySettings}
      settingsHref="/host/settings"
    />
  )
}
