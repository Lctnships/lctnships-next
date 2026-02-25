"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types"
import { useUserContext } from "@/components/providers/user-provider"

type Profile = Tables<"users">

/**
 * Primary hook for accessing authenticated user data.
 *
 * Inside dashboard pages (wrapped by UserProvider): reads from server-fetched context.
 * No client-side API calls needed → no AbortError possible.
 *
 * Outside dashboard (no provider): falls back to client-side onAuthStateChange.
 */
export function useUser() {
  const ctx = useUserContext()

  // All hooks must always be called (React rules), even if ctx is available.
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(!ctx) // Immediately done if context exists
  const supabase = createClient()
  const mountedRef = useRef(true)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (error) return null
      return data
    } catch {
      return null
    }
  }, [supabase])

  useEffect(() => {
    // Skip client-side auth entirely when UserProvider is present
    if (ctx) return

    mountedRef.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id)
          if (mountedRef.current) setProfile(profileData)
        } else {
          setProfile(null)
        }

        if (mountedRef.current) setIsLoading(false)
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [ctx, supabase, fetchProfile])

  // When UserProvider is available, use server-fetched data
  if (ctx) return ctx

  // Fallback: client-side data
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = "/"
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { data: null, error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (data) setProfile(data)
    return { data, error }
  }

  return {
    user,
    profile,
    isLoading,
    signOut,
    updateProfile,
  }
}
