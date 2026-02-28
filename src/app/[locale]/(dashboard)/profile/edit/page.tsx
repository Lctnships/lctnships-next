import { createClient } from "@/lib/supabase/server"
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

  const { data: profile } = await supabase
    .from("users")
    .select("*")
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
