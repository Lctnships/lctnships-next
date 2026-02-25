"use client"

import { useUserContext } from "@/components/providers/user-provider"

/**
 * Primary hook for accessing authenticated user data.
 *
 * Reads from UserProvider context (set in root layout with server-fetched data).
 * No client-side Supabase API calls → no AbortError, instant data.
 */
export function useUser() {
  const ctx = useUserContext()

  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider")
  }

  return ctx
}
