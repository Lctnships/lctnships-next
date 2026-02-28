import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EarningsClient } from "./earnings-client"

export const metadata = {
  title: "Earnings & Revenue",
}

// Mock earnings data for demo
const mockEarnings = {
  totalBalance: 8750.00,
  pendingPayout: 2340.00,
  thisMonth: 4280.00,
  lastMonth: 3920.00,
  monthlyGrowth: 9.2,
  yearToDate: 42580.00,
}

const mockTransactions = [
  {
    id: "txn-1",
    type: "booking" as const,
    description: "Industrial Loft NYC - Full Day Booking",
    guest: "Sarah Mitchell",
    amount: 1200.00,
    date: new Date().toISOString(),
    status: "completed" as const,
  },
  {
    id: "txn-2",
    type: "booking" as const,
    description: "Industrial Loft NYC - Half Day",
    guest: "Mike Chen",
    amount: 650.00,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "completed" as const,
  },
  {
    id: "txn-3",
    type: "payout" as const,
    description: "Payout to Bank Account ****4892",
    guest: "",
    amount: -3500.00,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: "completed" as const,
  },
  {
    id: "txn-4",
    type: "booking" as const,
    description: "Mid-Century Modern Studio - 2 Days",
    guest: "Emma Johnson",
    amount: 1800.00,
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: "completed" as const,
  },
  {
    id: "txn-5",
    type: "booking" as const,
    description: "White Box Studio - Commercial Shoot",
    guest: "James Wilson",
    amount: 2200.00,
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    status: "pending" as const,
  },
  {
    id: "txn-6",
    type: "refund" as const,
    description: "Refund - Skyline Rooftop Cancellation",
    guest: "Alex Brown",
    amount: -450.00,
    date: new Date(Date.now() - 86400000 * 12).toISOString(),
    status: "completed" as const,
  },
]

const mockMonthlyData = [
  { month: "Jan", earnings: 3200 },
  { month: "Feb", earnings: 2800 },
  { month: "Mar", earnings: 4100 },
  { month: "Apr", earnings: 3600 },
  { month: "May", earnings: 4800 },
  { month: "Jun", earnings: 5200 },
  { month: "Jul", earnings: 4900 },
  { month: "Aug", earnings: 5600 },
  { month: "Sep", earnings: 4280 },
  { month: "Oct", earnings: 0 },
  { month: "Nov", earnings: 0 },
  { month: "Dec", earnings: 0 },
]

const mockStudios = [
  {
    id: "studio-1",
    title: "Industrial Loft NYC",
    earnings: 18500,
    bookings: 45,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200",
  },
  {
    id: "studio-2",
    title: "Mid-Century Modern",
    earnings: 12300,
    bookings: 32,
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200",
  },
  {
    id: "studio-3",
    title: "White Box Studio",
    earnings: 8900,
    bookings: 28,
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=200",
  },
]

export default async function EarningsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get real earnings data
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("host_payout, created_at, start_datetime")
    .eq("host_id", user.id)
    .eq("status", "completed")
    .eq("payment_status", "paid")

  // Get pending payouts
  const { data: pendingPayouts } = await supabase
    .from("payouts")
    .select("amount")
    .eq("host_id", user.id)
    .eq("status", "pending")

  // Get recent transactions
  const { data: recentBookings } = await supabase
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
    .limit(10)

  // Calculate real earnings or use mock data
  const totalEarnings = completedBookings?.reduce((sum, b) => sum + (b.host_payout || 0), 0) || 0
  const pendingAmount = pendingPayouts?.reduce((sum, p) => sum + p.amount, 0) || 0

  // If no real data, use mock data
  const hasRealData = totalEarnings > 0 || (recentBookings && recentBookings.length > 0)

  const earningsData = hasRealData
    ? {
        totalBalance: totalEarnings + pendingAmount,
        pendingPayout: pendingAmount,
        thisMonth: mockEarnings.thisMonth, // Would calculate from completedBookings
        lastMonth: mockEarnings.lastMonth,
        monthlyGrowth: mockEarnings.monthlyGrowth,
        yearToDate: totalEarnings,
      }
    : mockEarnings

  const transactions = hasRealData && recentBookings
    ? recentBookings.map((b) => ({
        id: b.id,
        type: "booking" as const,
        description: `${(b.studio as any)?.title || "Studio"} - Booking`,
        guest: (b.renter as any)?.full_name || "Guest",
        amount: b.host_payout || 0,
        date: b.created_at,
        status: (b.status === "completed" ? "completed" : "pending") as "completed" | "pending",
      }))
    : mockTransactions

  return (
    <EarningsClient
      earnings={earningsData}
      transactions={transactions}
      monthlyData={mockMonthlyData}
      studios={mockStudios}
    />
  )
}
