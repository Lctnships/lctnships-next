import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { StudioDetailClient } from "./studio-detail-client"
import { SITE_URL, SITE_NAME } from "@/lib/seo"

interface StudioDetailPageProps {
  params: Promise<{ id: string; locale: string }>
}

// First image of a studio, absolute URL, for OG / structured data.
function firstImage(images: unknown): string | null {
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === "string") {
    return images[0]
  }
  return null
}

export async function generateMetadata({ params }: StudioDetailPageProps) {
  const { id, locale } = await params
  const t = await getTranslations("StudioDetail")

  const supabase = await createClient()

  const { data: studio } = await supabase
    .from("studios")
    .select("title, description, city, images, type")
    .eq("id", id)
    .single()

  if (!studio) {
    return { title: t("studioNotFound") }
  }

  const description =
    studio.description || `${studio.title} — ${studio.type || "studio"} in ${studio.city}. Boek deze creatieve ruimte op ${SITE_NAME}.`
  const canonical = `${SITE_URL}/${locale}/studios/${id}`
  const image = firstImage(studio.images)

  return {
    title: studio.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${studio.title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      ...(image ? { images: [{ url: image, alt: studio.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${studio.title} | ${SITE_NAME}`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { id } = await params

  const supabase = await createClient()

  const { data: studio } = await supabase
    .from("studios")
    .select(`
      *,
      studio_images (*),
      studio_amenities (*),
      host:users!studios_host_id_fkey (id, full_name, avatar_url, bio, location, user_type, is_verified, created_at, updated_at)
    `)
    .eq("id", id)
    .or("is_published.eq.true,status.eq.active")
    .single()

  if (!studio) {
    notFound()
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey (id, full_name, avatar_url, is_verified, created_at)
    `)
    .eq("studio_id", id)
    .eq("review_type", "renter_to_studio")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get similar studios
  const { data: similarStudios } = await supabase
    .from("studios")
    .select("id, title, location, price_per_hour, avg_rating, images")
    .neq("id", id)
    .or("is_published.eq.true,status.eq.active")
    .limit(4)

  // Structured data so search engines can show this studio as a rich result
  // (name, image, price, rating). LocalBusiness with an offer + aggregateRating.
  const { locale } = await params
  const studioImage = firstImage(studio.images)
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: studio.title,
    description: studio.description || `${studio.title} in ${studio.city}`,
    url: `${SITE_URL}/${locale}/studios/${id}`,
    ...(studioImage ? { image: studioImage } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: studio.city || undefined,
      streetAddress: studio.address || undefined,
      addressCountry: studio.country || "NL",
    },
    priceRange: studio.price_per_hour ? `€${studio.price_per_hour}/uur` : undefined,
    ...(studio.price_per_hour
      ? {
          makesOffer: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: studio.price_per_hour,
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: studio.price_per_hour,
              priceCurrency: "EUR",
              unitCode: "HUR",
            },
          },
        }
      : {}),
    ...(studio.avg_rating && studio.total_reviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: studio.avg_rating,
            reviewCount: studio.total_reviews,
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so a studio title/description can't break out of the
        // script tag (e.g. "</script>"); JSON.stringify alone doesn't do this.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <StudioDetailClient
        studio={studio}
        reviews={reviews || []}
        similarStudios={similarStudios || []}
      />
    </>
  )
}
