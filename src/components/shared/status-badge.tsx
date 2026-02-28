import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed"
type PaymentStatus = "pending" | "paid" | "refunded"
type ProjectStatus = "active" | "completed" | "archived"

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus | ProjectStatus
  variant?: "booking" | "payment" | "project"
}

const statusConfig = {
  booking: {
    pending: { label: "In afwachting", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    confirmed: { label: "Bevestigd", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    cancelled: { label: "Geannuleerd", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    completed: { label: "Voltooid", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  },
  payment: {
    pending: { label: "In afwachting", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
    paid: { label: "Betaald", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    refunded: { label: "Terugbetaald", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  },
  project: {
    active: { label: "Actief", className: "bg-green-100 text-green-800 hover:bg-green-100" },
    completed: { label: "Voltooid", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
    archived: { label: "Gearchiveerd", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  },
}

export function StatusBadge({ status, variant = "booking" }: StatusBadgeProps) {
  const variantConfig = statusConfig[variant] as Record<string, { label: string; className: string }>
  const config = variantConfig[status]

  if (!config) return null

  return (
    <Badge variant="secondary" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
