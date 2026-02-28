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

// Mock project data
const mockProject = {
  id: "proj-1",
  title: "Summer '24 Lookbook Shoot",
  project_type: "photoshoot",
  description: "High-fashion editorial photoshoot for Summer collection featuring sustainable fashion pieces",
  cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
  status: "active",
  created_at: "2024-01-15",
  updated_at: new Date().toISOString(),
}

const mockBookings = [
  {
    id: "book-1",
    studio_title: "Neon Loft | Studio A",
    studio_location: "East Side Arts District",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    start_time: "10:00 AM",
    end_time: "06:00 PM",
    status: "confirmed",
  },
  {
    id: "book-2",
    studio_title: "The Sound Stage | Hall C",
    studio_location: "Downtown Industrial",
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    start_time: "02:00 PM",
    end_time: "10:00 PM",
    status: "confirmed",
  },
  {
    id: "book-3",
    studio_title: "Minimalist Patio",
    studio_location: "North Hills",
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    start_time: "08:00 AM",
    end_time: "12:00 PM",
    status: "pending",
  },
]

const mockTeamMembers = [
  {
    id: "member-1",
    full_name: "Alex Rivers",
    role: "Creative Director",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    is_online: true,
  },
  {
    id: "member-2",
    full_name: "Sarah Chen",
    role: "Photographer",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    is_online: true,
  },
  {
    id: "member-3",
    full_name: "Marcus Thorne",
    role: "Lead Stylist",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    is_online: false,
  },
  {
    id: "member-4",
    full_name: "Jenna Ortiz",
    role: "Producer",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    is_online: true,
  },
]

const mockNotes = [
  {
    id: "note-1",
    title: "Catering Reminder",
    content: "Confirm vegan options for Jenna and the stylist team by Friday EOD.",
  },
  {
    id: "note-2",
    title: "Equipment Check",
    content: "Verify the rental of the 85mm prime lens from the gear shop.",
  },
]

const mockStoryboardFrames = [
  {
    id: "frame-1",
    scene: "Scene 01",
    title: "Morning Arrival",
    description: "Model entering the loft as the morning light breaks through the large industrial windows. Wide angle shot.",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    location: "Neon Loft | Studio A",
  },
  {
    id: "frame-2",
    scene: "Scene 02",
    title: "Portrait: Summer Glow",
    description: "Tight close-up using reflectors to enhance golden hour lighting effects. Focus on eyewear collection.",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
    location: "The Sound Stage | Hall C",
  },
  {
    id: "frame-3",
    scene: "Scene 03",
    title: "Lifestyle Garden Shot",
    description: "Overhead drone-style perspective of models in the patio area. Focus on outdoor apparel durability.",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600",
    location: "Minimalist Patio",
  },
]

const mockShotlist = [
  {
    id: "shot-1",
    code: "S01-E01",
    description: "Wide shot of model walking through neon pillars",
    assignee: { name: "Alex R.", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
    status: "completed",
    session: "Session 01: Neon Loft | Studio A",
  },
  {
    id: "shot-2",
    code: "S01-E02",
    description: "Close-up of holographic accessories",
    assignee: { name: "Sarah C.", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    status: "completed",
    session: "Session 01: Neon Loft | Studio A",
  },
  {
    id: "shot-3",
    code: "S02-E01",
    description: "Slow pan across the studio pedestals",
    assignee: { name: "Marcus T.", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    status: "in_progress",
    session: "Session 02: The Sound Stage | Hall C",
  },
  {
    id: "shot-4",
    code: "S02-E02",
    description: "Close-up of product on pedestal with rim lighting",
    assignee: { name: "Jenna O.", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    status: "pending",
    session: "Session 02: The Sound Stage | Hall C",
  },
]

const mockFiles = [
  {
    id: "file-1",
    name: "Production_Schedule_V2.pdf",
    type: "pdf",
    size: "1.2 MB",
    modified: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "file-2",
    name: "Model_Releases.docx",
    type: "docx",
    size: "456 KB",
    modified: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "file-3",
    name: "Location_Survey_01.jpg",
    type: "image",
    size: "4.8 MB",
    modified: new Date(Date.now() - 172800000).toISOString(),
  },
]

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

  // Use mock data if no real data
  const projectData = project || mockProject
  const bookingsData = bookings && bookings.length > 0
    ? bookings.map((b) => ({
        id: b.id,
        studio_title: (b.studio as any)?.title || "Studio",
        studio_location: (b.studio as any)?.location || "",
        date: b.start_datetime,
        start_time: new Date(b.start_datetime).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" }),
        end_time: new Date(b.end_datetime).toLocaleTimeString(dateLocale, { hour: "numeric", minute: "2-digit" }),
        status: b.status,
      }))
    : mockBookings

  const teamData = members && members.length > 0
    ? members.map((m) => ({
        id: (m.user as any)?.id,
        full_name: (m.user as any)?.full_name || "Team Member",
        role: m.role,
        avatar_url: (m.user as any)?.avatar_url,
        is_online: Math.random() > 0.5, // Mock online status
      }))
    : mockTeamMembers

  return (
    <ProjectWorkspaceClient
      project={projectData}
      bookings={bookingsData}
      teamMembers={teamData}
      notes={mockNotes}
      storyboardFrames={mockStoryboardFrames}
      shotlist={mockShotlist}
      files={mockFiles}
    />
  )
}
