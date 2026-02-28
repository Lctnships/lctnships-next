import { Tables } from "@/types/database.types"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Star } from "lucide-react"
import { formatTimeAgo } from "@/lib/utils/format-date"

type Review = Tables<"reviews"> & {
  reviewer?: Tables<"users">
}

interface StudioReviewsProps {
  reviews: Review[]
  avgRating: number
  totalReviews: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export function StudioReviews({ reviews, avgRating, totalReviews }: StudioReviewsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="text-xl font-semibold">{avgRating.toFixed(1)}</span>
        <span className="text-muted-foreground">
          ({totalReviews} {totalReviews === 1 ? "beoordeling" : "beoordelingen"})
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">Nog geen reviews.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <UserAvatar
                    src={review.reviewer?.avatar_url}
                    name={review.reviewer?.full_name}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {review.reviewer?.full_name || "Anoniem"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(review.created_at)}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm">{review.comment}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
