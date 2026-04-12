import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProjectWorkspaceClient } from "./project-workspace-client"

interface BookingStudioRelation {
  title?: string
  location?: string
}

interface MemberUserRelation {
  id: string
  full_name?: string
  avatar_url?: string
}

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

  // Fetch all project sub-data in parallel
  const [
    { data: notes },
    { data: storyboards },
    { data: shotlist },
    { data: files },
    { data: moodboard },
    { data: locations },
  ] = await Promise.all([
    supabase
      .from("project_notes")
      .select("id, title, content, created_by, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_storyboards")
      .select("id, title, description, image_url, order_index")
      .eq("project_id", id)
      .order("order_index"),
    supabase
      .from("project_shotlist")
      .select("id, shot_description, is_completed, order_index")
      .eq("project_id", id)
      .order("order_index"),
    supabase
      .from("project_files")
      .select("id, file_name, file_url, file_type, file_size, folder, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_moodboard_items")
      .select("id, image_url, caption, order_index")
      .eq("project_id", id)
      .order("order_index"),
    supabase
      .from("project_locations")
      .select("id, name, address, notes, is_studio, linked_studio_id")
      .eq("project_id", id),
  ])

  const bookingsData = (bookings || []).map((b) => ({
    id: b.id,
    studio_title: (b.studio as unknown as BookingStudioRelation)?.title || "Studio",
    studio_location: (b.studio as unknown as BookingStudioRelation)?.location || "",
    date: b.start_datetime,
    start_time: new Date(b.start_datetime).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" }),
    end_time: new Date(b.end_datetime).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" }),
    status: b.status,
  }))

  const teamData = (members || []).map((m) => ({
    id: (m.user as unknown as MemberUserRelation)?.id,
    full_name: (m.user as unknown as MemberUserRelation)?.full_name || "Team Member",
    role: m.role,
    avatar_url: (m.user as unknown as MemberUserRelation)?.avatar_url,
    is_online: false,
  }))

  // Map DB rows to client-component interfaces
  const notesData = (notes || []).map((n) => ({
    id: n.id,
    title: n.title || "",
    content: n.content || "",
  }))

  const storyboardData = (storyboards || []).map((s) => ({
    id: s.id,
    scene: `Scene ${(s.order_index || 0) + 1}`,
    title: s.title || "",
    description: s.description || "",
    image_url: s.image_url || "",
    location: "",
  }))

  const shotlistData = (shotlist || []).map((s) => ({
    id: s.id,
    code: `SH-${String((s.order_index || 0) + 1).padStart(3, "0")}`,
    description: s.shot_description || "",
    assignee: { name: "", avatar_url: "" },
    status: s.is_completed ? "completed" : "pending",
    session: "",
  }))

  const filesData = (files || []).map((f) => ({
    id: f.id,
    name: f.file_name || "",
    type: f.file_type || "",
    size: f.file_size ? `${Math.round(f.file_size / 1024)} KB` : "0 KB",
    modified: f.created_at ? new Date(f.created_at).toLocaleDateString(dateLocale) : "",
  }))

  return (
    <ProjectWorkspaceClient
      project={project}
      bookings={bookingsData}
      teamMembers={teamData}
      notes={notesData}
      storyboardFrames={storyboardData}
      shotlist={shotlistData}
      files={filesData}
    />
  )
}
