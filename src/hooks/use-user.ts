"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types"

type Profile = Tables<"users">

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const mountedRef = useRef(true)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        return null
      }
      return data
    } catch {
      return null
    }
  }, [supabase])

  useEffect(() => {
    mountedRef.current = true

    // Use onAuthStateChange as the single source of truth.
    // INITIAL_SESSION fires immediately with the current session from cookies
    // — no network request needed, so it won't get aborted.
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
  }, [supabase, fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    window.location.href = "/"
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (data) {
      setProfile(data)
    }

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
