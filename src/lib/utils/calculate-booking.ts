// 15% platform fee, split from the listing price (not added on top).
// Renter pays subtotal. Platform keeps 15%, host gets 85%.
const PLATFORM_FEE_PERCENTAGE = 0.15

export interface BookingCalculation {
  totalHours: number
  subtotal: number
  serviceFee: number
  totalAmount: number
  hostPayout: number
}

export function calculateBooking(
  pricePerHour: number,
  startDateTime: Date,
  endDateTime: Date
): BookingCalculation {
  const diffMs = endDateTime.getTime() - startDateTime.getTime()
  const totalHours = Math.ceil(diffMs / (1000 * 60 * 60))

  const subtotal = pricePerHour * totalHours
  const totalAmount = subtotal
  const serviceFee = subtotal * PLATFORM_FEE_PERCENTAGE
  const hostPayout = subtotal * (1 - PLATFORM_FEE_PERCENTAGE)

  return {
    totalHours,
    subtotal: Math.round(subtotal * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    hostPayout: Math.round(hostPayout * 100) / 100,
  }
}
