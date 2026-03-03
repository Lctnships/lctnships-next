import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/projects - List user's projects
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ projects: projects || [] })
  } catch (error: any) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      )
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        title: body.title.trim(),
        project_type: body.project_type || "photoshoot",
        description: body.description?.trim() || null,
        cover_image_url: body.cover_image_url || null,
        owner_id: user.id,
        status: "active",
      })
      .select()
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 500 }
    )
  }
}
