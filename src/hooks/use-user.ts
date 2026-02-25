"use client"

import { useEffect, useState, useCallback } from "react"
import { User } from "@supabase/supabase-js"
import { createClient, resetClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types"

type Profile = Tables<"users">

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

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
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        setUser(user)
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
      } catch {
        setUser(null)
        setProfile(null)
      }
      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip INITIAL_SESSION - it may contain an expired access token that
        // hasn't been refreshed yet. The getUser() call above handles initial
        // load properly by validating and refreshing the token first.
        if (event === 'INITIAL_SESSION') return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id)
          setProfile(profileData)
        } else {
          setProfile(null)
        }

        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = async () => {
    // Clear client-side session (localStorage)
    await supabase.auth.signOut()
    // Clear server-side session (cookies) via API route
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    setProfile(null)
    // Reset the singleton client so next page load starts fresh
    resetClient()
    // Hard redirect to fully clear in-memory state
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
