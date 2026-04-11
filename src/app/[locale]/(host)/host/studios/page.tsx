import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { Plus, Building2 } from "lucide-react"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"
import { StudiosListClient } from "./studios-list-client"

export async function generateMetadata() {
  const t = await getTranslations("HostStudios")
  return { title: t("pageTitle") }
}

export default async function HostStudiosPage() {
  const supabase = await createClient()
  const t = await getTranslations("HostStudios")

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: studios } = await supabase
    .from("studios")
    .select(`
      *,
      studio_images (image_url, is_cover)
    `)
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-0.5">{t("subtitle")}</p>
        </div>
        <Link href="/host/studios/new">
          <Button size="sm" className="md:size-default h-9 text-xs md:text-sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span>{t("newStudio")}</span>
          </Button>
        </Link>
      </div>

      {!studios || studios.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t("noStudios")}
          description={t("noStudiosDesc")}
          actionLabel={t("addStudio")}
          actionHref="/host/studios/new"
        />
      ) : (
        <StudiosListClient studios={studios} />
      )}
    </div>
  )
}
