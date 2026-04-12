import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EarningsClient } from "./earnings-client"

interface BookingStudioRelation {
  title?: string
}

interface BookingRenterRelation {
  full_name?: string
}

interface EarningsStudioRelation {
  id: string
  title?: string
  images?: string[]
  studio_images?: { image_url?: string }[]
}

import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("HostEarnings")
  return { title: t("pageTitle") }
}

export default async function EarningsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Run all independent queries in parallel. completedBookings includes
  // studio data so we don't need a separate studioEarnings query below.
  const [
    { data: completedBookings },
    { data: pendingPayouts },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select(`
        host_payout,
        created_at,
        start_datetime,
        studio:studios (id, title, images, studio_images(image_url))
      `)
      .eq("host_id", user.id)
      .in("status", ["confirmed", "completed"])
      .eq("payment_status", "paid"),
    supabase
      .from("payouts")
      .select("amount")
      .eq("host_id", user.id)
      .eq("status", "pending"),
    supabase
      .from("bookings")
      .select(`
        id,
        host_payout,
        status,
        payment_status,
        created_at,
        studio:studios (title),
        renter:users!bookings_renter_id_fkey (full_name)
      `)
      .eq("host_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  // Calculate real earnings
  const totalEarnings = completedBookings?.reduce((sum, b) => sum + (b.host_payout || 0), 0) || 0
  const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0

  // Calculate thisMonth and lastMonth from real transactions
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  const thisMonth = completedBookings?.reduce((sum, b) => {
    const bookingDate = new Date(b.created_at)
    if (bookingDate >= thisMonthStart) {
      return sum + (b.host_payout || 0)
    }
    return sum
  }, 0) || 0

  const lastMonth = completedBookings?.reduce((sum, b) => {
    const bookingDate = new Date(b.created_at)
    if (bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd) {
      return sum + (b.host_payout || 0)
    }
    return sum
  }, 0) || 0

  const monthlyGrowth = lastMonth > 0
    ? Math.round(((thisMonth - lastMonth) / lastMonth) * 1000) / 10
    : 0

  const earningsData = {
    totalBalance: totalEarnings + pendingAmount,
    pendingPayout: pendingAmount,
    thisMonth,
    lastMonth,
    monthlyGrowth,
    yearToDate: totalEarnings,
  }

  const transactions = recentBookings
    ? recentBookings.map((b) => ({
        id: b.id,
        type: "booking" as const,
        description: `${(b.studio as unknown as BookingStudioRelation)?.title || "Studio"} - Booking`,
        guest: (b.renter as unknown as BookingRenterRelation)?.full_name || "Guest",
        amount: b.host_payout || 0,
        date: b.created_at,
        status: (b.status === "completed" ? "completed" : "pending") as "completed" | "pending",
      }))
    : []

  // Build monthly data from completed bookings
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyData = monthNames.map((month, index) => {
    const monthEarnings = completedBookings?.reduce((sum, b) => {
      const bookingDate = new Date(b.created_at)
      if (bookingDate.getFullYear() === now.getFullYear() && bookingDate.getMonth() === index) {
        return sum + (b.host_payout || 0)
      }
      return sum
    }, 0) || 0
    return { month, earnings: monthEarnings }
  })

  // Aggregate by studio from the already-fetched completedBookings
  const studioMap = new Map<string, { id: string; title: string; earnings: number; bookings: number; image: string }>()
  completedBookings?.forEach((b) => {
    const studio = b.studio as unknown as EarningsStudioRelation | null
    if (!studio) return
    const existing = studioMap.get(studio.id)
    const image = studio.images?.[0] ||
      studio.studio_images?.[0]?.image_url ||
      ""
    if (existing) {
      existing.earnings += b.host_payout || 0
      existing.bookings += 1
    } else {
      studioMap.set(studio.id, {
        id: studio.id,
        title: studio.title || "Studio",
        earnings: b.host_payout || 0,
        bookings: 1,
        image,
      })
    }
  })
  const studios = Array.from(studioMap.values())

  return (
    <EarningsClient
      earnings={earningsData}
      transactions={transactions}
      monthlyData={monthlyData}
      studios={studios}
    />
  )
}
