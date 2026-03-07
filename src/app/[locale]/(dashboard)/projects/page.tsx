import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProjectsClient } from "./projects-client"

export async function generateMetadata() {
  const t = await getTranslations("Projects")
  return {
    title: t("metaTitle"),
  }
}


export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get real projects
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      project_members (count),
      bookings:bookings (count)
    `)
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false })

  const projectsData = (projects || []).map((p) => ({
    id: p.id,
    title: p.title,
    project_type: p.project_type || "photoshoot",
    description: p.description,
    cover_image_url: p.cover_image_url,
    status: p.status || "active",
    updated_at: p.updated_at,
    bookings_count: (p.bookings as { count: number }[])?.[0]?.count || 0,
    members_count: (p.project_members as { count: number }[])?.[0]?.count || 0,
  }))

  return <ProjectsClient projects={projectsData} />
}
