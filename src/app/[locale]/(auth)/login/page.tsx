import { LoginForm } from "@/components/auth/login-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export const metadata = {
  title: "Inloggen",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
