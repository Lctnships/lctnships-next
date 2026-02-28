import { Link } from "@/i18n/routing"
import { Tables } from "@/types/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/shared/user-avatar"
import { MessageSquare, CheckCircle } from "lucide-react"

interface StudioHostCardProps {
  host: Tables<"users">
}

export function StudioHostCard({ host }: StudioHostCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            src={host.avatar_url}
            name={host.full_name}
            size="lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{host.full_name}</h3>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Host</p>
            {host.location && (
              <p className="text-sm text-muted-foreground mt-1">{host.location}</p>
            )}
          </div>
        </div>

        {host.bio && (
          <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
            {host.bio}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Link href={`/u/${host.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Bekijk profiel
            </Button>
          </Link>
          <Button variant="outline" size="icon">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
