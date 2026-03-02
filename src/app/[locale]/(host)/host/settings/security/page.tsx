import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SecuritySettingsClient } from "@/app/[locale]/(dashboard)/settings/security/security-settings-client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("Security")
  return { title: t("metaTitle") }
}

// Mock logged-in devices
const mockDevices = [
  {
    id: "device-1",
    name: "MacBook Pro M2",
    type: "laptop" as const,
    location: "Amsterdam, Netherlands",
    browser: "Safari on macOS",
    isCurrent: true,
  },
  {
    id: "device-2",
    name: "iPhone 15 Pro",
    type: "phone" as const,
    location: "Amsterdam, Netherlands",
    browser: "LCTNSHIPS App",
    isCurrent: false,
  },
  {
    id: "device-3",
    name: "Windows Workstation",
    type: "desktop" as const,
    location: "Rotterdam, Netherlands",
    browser: "Chrome on Windows",
    isCurrent: false,
  },
]

export default async function HostSecuritySettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userSettings } = await supabase
    .from("user_settings")
    .select("two_factor_enabled")
    .eq("user_id", user.id)
    .single()

  const twoFactorEnabled = userSettings?.two_factor_enabled ?? false

  return (
    <SecuritySettingsClient
      devices={mockDevices}
      twoFactorEnabled={twoFactorEnabled}
      settingsHref="/host/settings"
    />
  )
}
