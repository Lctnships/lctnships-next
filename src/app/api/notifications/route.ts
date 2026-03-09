import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

// GET /api/notifications - Get user's notifications
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread_only") === "true"
    const requestedLimit = parseInt(searchParams.get("limit") || "50")
    // Validate and cap the limit to prevent DoS
    const limit = Math.min(Math.max(1, isNaN(requestedLimit) ? 50 : requestedLimit), 100)

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq("is_read", false)
    }

    const { data, error } = await query

    if (error) throw error

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    return NextResponse.json({
      notifications: data,
      unread_count: unreadCount || 0,
    })
  } catch (error: unknown) {
    logger.error("Error fetching notifications", error, { route: "GET /api/notifications" })
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notification_ids, mark_all } = body

    if (mark_all) {
      // Mark all as read
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)
    } else if (notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0) {
      // Validate notification_ids are valid UUIDs and limit batch size
      const validIds = notification_ids
        .filter((id): id is string => typeof id === "string" && /^[0-9a-f-]{36}$/i.test(id))
        .slice(0, 100) // Limit to 100 IDs per request

      if (validIds.length > 0) {
        // Mark specific notifications as read
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .in("id", validIds)
      }
    }

    return NextResponse.json({ message: "Notifications marked as read" })
  } catch (error: unknown) {
    logger.error("Error updating notifications", error, { route: "PATCH /api/notifications" })
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")
    const deleteAll = searchParams.get("all") === "true"

    if (deleteAll) {
      await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)
    } else if (notificationId) {
      await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", user.id)
    }

    return NextResponse.json({ message: "Notification(s) deleted" })
  } catch (error: unknown) {
    logger.error("Error deleting notifications", error, { route: "DELETE /api/notifications" })
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    )
  }
}
