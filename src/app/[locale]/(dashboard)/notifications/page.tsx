import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/server"
import NotificationsClient, { type Notification } from "./notifications-client"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, message, link, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  const notifications = (data ?? []) as Notification[]
  const t = await getTranslations("Notifications")

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12">
        <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-2xl shadow-black/10 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-transparent z-10" />
            <div
              className="bg-center bg-no-repeat bg-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=800')`,
              }}
            />
            <div className="absolute -top-10 -right-10 size-40 bg-gray-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 size-40 bg-gray-100 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">{t("emptyTitle")}</h1>
            <p className="text-gray-500 text-base font-medium max-w-[420px] leading-relaxed">
              {t("emptyDescription")}
            </p>
          </div>

          <div className="mt-4">
            <Link
              href="/studios"
              className="group flex items-center justify-center gap-2 min-w-[220px] bg-black text-white py-4 px-8 rounded-full font-bold text-sm tracking-wide shadow-lg shadow-black/10 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <span>{t("emptyCta")}</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <NotificationsClient initialNotifications={notifications} />
}
