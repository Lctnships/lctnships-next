import { createServiceClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Runs on Vercel cron. Expires:
//   - pending_approval bookings whose 48h request window is past (no host action → 'expired')
//   - approved bookings whose 72h payment deadline is past (renter didn't pay → 'expired')
// Vercel cron uses GET; we accept both methods for manual triggering.
async function run(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const nowIso = new Date().toISOString()

  const { data: expiredRequests, error: e1 } = await supabase
    .from("bookings")
    .update({
      status: "expired",
      payment_status: "none",
      request_expires_at: null,
    })
    .eq("status", "pending_approval")
    .lt("request_expires_at", nowIso)
    .select("id, renter_id")
  if (e1) logger.error("Failed to expire pending_approval bookings", e1)

  const { data: expiredPayments, error: e2 } = await supabase
    .from("bookings")
    .update({
      status: "expired",
      payment_status: "none",
      payment_deadline: null,
    })
    .eq("status", "approved")
    .lt("payment_deadline", nowIso)
    .select("id, renter_id")
  if (e2) logger.error("Failed to expire approved bookings past payment_deadline", e2)

  // Best-effort renter notifications
  const notifyRows = [
    ...(expiredRequests ?? []).map((r) => ({
      user_id: r.renter_id,
      type: "booking_expired",
      title: "Booking request expired",
      message: "The host didn't respond in time. Your request was expired.",
      link: `/bookings/${r.id}`,
    })),
    ...(expiredPayments ?? []).map((r) => ({
      user_id: r.renter_id,
      type: "booking_expired",
      title: "Payment deadline passed",
      message: "Your approved booking expired because payment wasn't completed in time.",
      link: `/bookings/${r.id}`,
    })),
  ]
  if (notifyRows.length > 0) {
    await supabase.from("notifications").insert(notifyRows)
  }

  return NextResponse.json({
    expiredRequests: expiredRequests?.length ?? 0,
    expiredPayments: expiredPayments?.length ?? 0,
  })
}

export const GET = run
export const POST = run
