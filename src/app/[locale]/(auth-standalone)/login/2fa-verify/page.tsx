import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TwoFactorChallengeClient } from "./challenge-client"

interface PageProps {
  searchParams: Promise<{ redirect?: string }>
}

export default async function TwoFactorVerifyPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // If the user has no factor pending OR is already at AAL2, skip the challenge.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (!aal || aal.currentLevel === aal.nextLevel) {
    redirect(sp.redirect ?? "/dashboard")
  }

  return <TwoFactorChallengeClient redirect={sp.redirect} />
}
