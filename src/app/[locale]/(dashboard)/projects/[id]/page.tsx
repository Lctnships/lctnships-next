import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProjectWorkspaceClient } from "./project-workspace-client"

export async function generateMetadata() {
  const t = await getTranslations("ProjectWorkspace")
  return {
    title: t("metaTitle"),
  }
}


export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const dateLocale = locale === "nl" ? "nl-NL" : locale === "es" ? "es-ES" : "en-US"
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Try to get real project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  // Get project bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      start_datetime,
      end_datetime,
      status,
      studio:studios (title, location)
    `)
    .eq("project_id", id)
    .order("start_datetime")

  // Get team members
  const { data: members } = await supabase
    .from("project_members")
    .select(`
      role,
      user:users (id, full_name, avatar_url)
    `)
    .eq("project_id", id)

  if (!project) return notFound()

  const bookingsData = (bookings || []).map((b) => ({
    id: b.id,
    studio_title: (b.studio as any)?.title || "Studio",
    studio_location: (b.studio as any)?.location || "",
    date: b.start_datetime,
    start_time: new Date(b.start_datetime).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" }),
    end_time: new Date(b.end_datetime).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" }),
    status: b.status,
  }))

  const teamData = (members || []).map((m) => ({
    id: (m.user as any)?.id,
    full_name: (m.user as any)?.full_name || "Team Member",
    role: m.role,
    avatar_url: (m.user as any)?.avatar_url,
    is_online: false,
  }))

  return (
    <ProjectWorkspaceClient
      project={project}
      bookings={bookingsData}
      teamMembers={teamData}
      notes={[]}
      storyboardFrames={[]}
      shotlist={[]}
      files={[]}
    />
  )
}
