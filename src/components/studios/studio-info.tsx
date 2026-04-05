import { Tables } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Users, Ruler, Clock, CheckCircle } from "lucide-react"
import { STUDIO_TYPES } from "@/lib/constants/studio-types"

interface StudioInfoProps {
  studio: Tables<"studios">
}

export function StudioInfo({ studio }: StudioInfoProps) {
  const studioType = STUDIO_TYPES.find((t) => t.value === studio.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{studioType?.label}</Badge>
          {studio.is_verified && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Geverifieerd
            </Badge>
          )}
          {studio.is_instant_book && (
            <Badge variant="secondary">Instant Book</Badge>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">{studio.title}</h1>
        <div className="flex items-center text-muted-foreground mt-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{studio.city}, {studio.country}</span>
        </div>
      </div>

      <Separator />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {studio.capacity && (
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Max gasten</p>
              <p className="font-medium">{studio.capacity} personen</p>
            </div>
          </div>
        )}
        {studio.size_sqm && (
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Oppervlakte</p>
              <p className="font-medium">{studio.size_sqm} m²</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Min. boeking</p>
            <p className="font-medium">{studio.minimum_hours} uur</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Over deze studio</h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {studio.description || "Geen beschrijving beschikbaar."}
        </p>
      </div>

      {/* Rules */}
      {studio.rules && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-3">Huisregels</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {studio.rules}
            </p>
          </div>
        </>
      )}

      {/* Cancellation policy */}
      <Separator />
      <div>
        <h2 className="text-lg font-semibold mb-3">Annuleringsbeleid</h2>
        <p className="text-muted-foreground">
          {studio.cancellation_policy === "flexible" && (
            "Flexibel: Volledige terugbetaling bij annulering tot 24 uur voor aanvang."
          )}
          {studio.cancellation_policy === "moderate" && (
            "Gemiddeld: Volledige terugbetaling bij annulering tot 5 dagen voor aanvang."
          )}
          {studio.cancellation_policy === "strict" && (
            "Strikt: 50% terugbetaling bij annulering tot 7 dagen voor aanvang."
          )}
        </p>
      </div>
    </div>
  )
}
