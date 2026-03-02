import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Plus, Building2, Star, Calendar, Settings, Eye, EyeOff } from "lucide-react"
import { Link } from "@/i18n/routing"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils/format-currency"

export const metadata = {
  title: "Mijn Studios",
}

export default async function HostStudiosPage() {
  const supabase = await createClient()

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mijn Studios</h1>
          <p className="text-muted-foreground mt-1">
            Beheer je studio advertenties
          </p>
        </div>
        <Link href="/host/studios/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Studio
          </Button>
        </Link>
      </div>

      {!studios || studios.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nog geen studio's"
          description="Voeg je eerste studio toe en begin met verdienen"
          actionLabel="Studio toevoegen"
          actionHref="/host/studios/new"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => {
            const coverImage = studio.studio_images?.find((img: any) => img.is_cover) ||
              studio.studio_images?.[0]

            return (
              <Card key={studio.id} className="overflow-hidden">
                {/* Image */}
                <div className="relative aspect-video bg-muted">
                  {coverImage ? (
                    <Image
                      src={coverImage.image_url}
                      alt={studio.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Status badge */}
                  <Badge
                    className="absolute top-2 right-2"
                    variant={studio.is_published ? "default" : "secondary"}
                  >
                    {studio.is_published ? (
                      <><Eye className="h-3 w-3 mr-1" /> Gepubliceerd</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" /> Concept</>
                    )}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold truncate">{studio.title}</h3>
                  <p className="text-sm text-muted-foreground">{studio.city}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="font-semibold">
                      {formatCurrency(studio.price_per_hour)}/uur
                    </span>
                    {studio.avg_rating > 0 && (
                      <span className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {studio.avg_rating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {studio.total_bookings} boekingen
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link href={`/host/studios/${studio.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Bewerken
                      </Button>
                    </Link>
                    <Link href="/host/calendar">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/studios/${studio.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
