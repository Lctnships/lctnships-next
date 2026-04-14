// Single source of truth for available booking durations.
// Used by studio detail → session details → checkout so the user never
// lands on a page where their previously-selected duration isn't offered.

export interface BookingBlock {
  duration_hours: number
  price: number
  sort_order?: number
}

export interface DurationStudio {
  booking_mode?: "flexible" | "fixed_blocks" | null
  booking_blocks?: BookingBlock[] | null
  minimum_hours?: number | null
  maximum_hours?: number | null
  price_per_hour?: number | null
}

// Default options used when a flexible studio doesn't restrict further.
export const FLEXIBLE_DURATION_HOURS = [1, 2, 4, 8] as const

/**
 * Returns the sorted list of available durations (in hours) for a studio.
 * - fixed_blocks: uses the studio's configured blocks
 * - flexible: FLEXIBLE_DURATION_HOURS filtered by minimum_hours/maximum_hours
 */
export function getAvailableDurations(studio: DurationStudio): number[] {
  if (studio.booking_mode === "fixed_blocks" && studio.booking_blocks && studio.booking_blocks.length > 0) {
    return [...studio.booking_blocks]
      .sort((a, b) => (a.sort_order ?? a.duration_hours) - (b.sort_order ?? b.duration_hours))
      .map((b) => b.duration_hours)
  }
  const min = studio.minimum_hours ?? 1
  const max = studio.maximum_hours ?? 12
  return FLEXIBLE_DURATION_HOURS.filter((h) => h >= min && h <= max)
}

/**
 * Snap an arbitrary hour value to the nearest available duration for this studio.
 * Keeps studio detail → session handoff consistent even when the URL param drifts.
 */
export function snapToAvailable(studio: DurationStudio, requested: number): number {
  const available = getAvailableDurations(studio)
  if (available.length === 0) return requested
  if (available.includes(requested)) return requested
  // Find closest available duration
  return available.reduce((best, h) =>
    Math.abs(h - requested) < Math.abs(best - requested) ? h : best
  )
}

export function priceForDuration(studio: DurationStudio, hours: number): number {
  if (studio.booking_mode === "fixed_blocks" && studio.booking_blocks) {
    const match = studio.booking_blocks.find((b) => b.duration_hours === hours)
    if (match) return match.price
  }
  return (studio.price_per_hour ?? 0) * hours
}
