"use client"

import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types"

type Profile = Tables<"users">

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single()
        setProfile(profile)
      }

      setIsLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)

        // Never await Supabase calls inside this callback: it runs while the
        // auth client holds its navigator lock, and any query needing the
        // session then deadlocks the whole client. Defer past the lock.
        setTimeout(async () => {
          if (session?.user) {
            const { data: profile } = await supabase
              .from("users")
              .select("*")
              .eq("id", session.user.id)
              .single()
            setProfile(profile)
          } else {
            setProfile(null)
          }

          setIsLoading(false)
        }, 0)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
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
