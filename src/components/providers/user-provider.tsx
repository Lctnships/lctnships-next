"use client"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { User } from "@supabase/supabase-js"
import { createClient, resetClient } from "@/lib/supabase/client"
import { Tables } from "@/types/database.types"

type Profile = Tables<"users">

type UserContextType = {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: Profile | null; error: Error | null }>
}

const UserContext = createContext<UserContextType | null>(null)

/**
 * Server-to-client auth bridge.
 * Receives the initial user + profile fetched server-side (no client API call needed).
 * Then subscribes to onAuthStateChange for subsequent changes (sign-out, token refresh).
 */
export function UserProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode
  initialUser: User | null
  initialProfile: Profile | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [isLoading] = useState(false) // Never loading — server already fetched
  const supabase = createClient()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return

        // Skip INITIAL_SESSION — we already have server data
        if (event === "INITIAL_SESSION") return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle()
          if (mountedRef.current) setProfile(data)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    await supabase.auth.signOut()
    resetClient()
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

  return (
    <UserContext.Provider value={{ user, profile, isLoading, signOut, updateProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}
