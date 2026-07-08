import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"
import { PUBLIC_USER_COLUMNS } from "@/lib/user-columns"

/**
 * Per-request cached `auth.getUser()`.
 *
 * Wraps the Supabase auth call in React's request-scoped cache, so multiple
 * server components / layouts in the same render share a single auth network
 * round-trip. Middleware already validates the session on every request, so
 * these server-side calls only exist to read the user object.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export type Profile = Tables<"users">

/**
 * Per-request cached profile fetch. Returns null if no user is authenticated.
 * Layout + dashboard pages both call this — cache dedupes to a single query.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from("users")
    .select(PUBLIC_USER_COLUMNS)
    .eq("id", user.id)
    .maybeSingle()
  return data as Profile | null
})
