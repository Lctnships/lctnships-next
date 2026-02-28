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

// Mock projects for demo
const mockProjects = [
  {
    id: "proj-1",
    title: "Vogue Spring Editorial",
    project_type: "editorial",
    description: "High-fashion editorial photoshoot for Spring collection",
    cover_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    status: "active",
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    bookings_count: 4,
    members_count: 6,
  },
  {
    id: "proj-2",
    title: "Midnight Album Cover",
    project_type: "music",
    description: "Atmospheric album cover photography for upcoming release",
    cover_image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    status: "active",
    updated_at: new Date(Date.now() - 18000000).toISOString(),
    bookings_count: 2,
    members_count: 3,
  },
  {
    id: "proj-3",
    title: "Tech Podcast S2",
    project_type: "podcast",
    description: "Season 2 recording sessions for weekly tech podcast",
    cover_image_url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800",
    status: "active",
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    bookings_count: 12,
    members_count: 2,
  },
  {
    id: "proj-4",
    title: "Summer Fashion Week",
    project_type: "event",
    description: "Vibrant outdoor fashion runway event coverage",
    cover_image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800",
    status: "active",
    updated_at: new Date(Date.now() - 10800000).toISOString(),
    bookings_count: 8,
    members_count: 15,
  },
  {
    id: "proj-5",
    title: "Architectural Digest Feature",
    project_type: "architecture",
    description: "Minimalist architectural interior photography",
    cover_image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    status: "active",
    updated_at: new Date(Date.now() - 21600000).toISOString(),
    bookings_count: 3,
    members_count: 4,
  },
  {
    id: "proj-6",
    title: "Short Film: The Horizon",
    project_type: "film",
    description: "Cinematic short film production with dramatic landscapes",
    cover_image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
    status: "completed",
    updated_at: new Date(Date.now() - 604800000).toISOString(),
    bookings_count: 5,
    members_count: 10,
  },
]

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

  // Transform real data or use mock
  const projectsData = projects && projects.length > 0
    ? projects.map((p) => ({
        id: p.id,
        title: p.title,
        project_type: p.project_type || "photoshoot",
        description: p.description,
        cover_image_url: p.cover_image_url,
        status: p.status || "active",
        updated_at: p.updated_at,
        bookings_count: (p.bookings as any)?.[0]?.count || 0,
        members_count: (p.project_members as any)?.[0]?.count || 0,
      }))
    : mockProjects

  return <ProjectsClient projects={projectsData} />
}
