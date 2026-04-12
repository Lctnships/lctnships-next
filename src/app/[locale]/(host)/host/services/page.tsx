import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/shared/empty-state"
import { Briefcase } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations("Navigation")
  return { title: t("services") }
}

export default async function HostServicesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Diensten</h1>
        <p className="text-muted-foreground text-sm md:text-base mt-0.5">
          Bied extra diensten aan bij je studio boekingen
        </p>
      </div>

      <EmptyState
        icon={Briefcase}
        title="Binnenkort beschikbaar"
        description="Bied extra diensten aan zoals fotografie assistenten, catering, lighting setup en meer. Deze feature wordt binnenkort uitgerold."
      />
    </div>
  )
}
