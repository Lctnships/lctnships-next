import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { EditProfileClient } from "./edit-profile-client"

export async function generateMetadata() {
  const t = await getTranslations("EditProfile")
  return {
    title: t("metaTitle"),
  }
}

export default async function EditProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Admin client for sensitive columns (phone, email) — migration 018 blocks
  // authenticated from reading these. User identity verified above.
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("users")
    .select("id, full_name, email, avatar_url, bio, location, phone, user_type, is_verified")
    .eq("id", user.id)
    .single()

  // Build profile data with defaults
  const profileData = {
    id: user.id,
    full_name: profile?.full_name || "",
    email: profile?.email || user.email || "",
    avatar_url: profile?.avatar_url || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    phone: profile?.phone || "",
    user_type: profile?.user_type || "renter",
  }

  return <EditProfileClient profile={profileData} />
}
