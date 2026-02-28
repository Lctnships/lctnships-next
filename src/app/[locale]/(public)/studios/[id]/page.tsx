import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { StudioDetailClient } from "./studio-detail-client"

interface StudioDetailPageProps {
  params: Promise<{ id: string }>
}

// Mock studio data for when database is empty
const mockStudioData = {
  id: "mock-1",
  title: "The Daylight Loft Studio",
  location: "Amsterdam Centrum, Netherlands",
  address: "Herengracht 182",
  city: "Amsterdam",
  postal_code: "1016 BR",
  latitude: 52.3676,
  longitude: 4.9041,
  description: "A stunning 200m² daylight studio with floor-to-ceiling windows, exposed brick walls, and a curated collection of vintage furniture. Perfect for fashion editorials, product photography, and video productions.",
  price_per_hour: 75,
  price_per_day: 450,
  avg_rating: 4.92,
  total_reviews: 128,
  is_superhost: true,
  studio_type: "daylight",
  max_guests: 15,
  size_sqm: 200,
  images: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
  ],
  studio_images: [
    { id: "1", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200", is_primary: true },
    { id: "2", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800", is_primary: false },
    { id: "3", url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800", is_primary: false },
    { id: "4", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", is_primary: false },
    { id: "5", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", is_primary: false },
  ],
  studio_amenities: [
    { id: "1", name: "Natural Light", icon: "wb_sunny", description: "Floor-to-ceiling windows" },
    { id: "2", name: "High-Speed WiFi", icon: "wifi", description: "1Gbps fiber connection" },
    { id: "3", name: "Free Parking", icon: "local_parking", description: "2 spots included" },
    { id: "4", name: "Kitchen", icon: "kitchen", description: "Fully equipped" },
    { id: "5", name: "Makeup Room", icon: "meeting_room", description: "With mirrors & lighting" },
    { id: "6", name: "Strobe Lighting", icon: "flash_on", description: "Profoto D1 kit" },
    { id: "7", name: "Cyclorama", icon: "view_in_ar", description: "White infinity wall" },
    { id: "8", name: "Sound System", icon: "speaker", description: "Bluetooth speakers" },
  ],
  equipment: [
    { id: "inc_1", name: "Profoto D1 1000W (x4)", included: true },
    { id: "inc_2", name: "Softboxes & Modifiers", included: true },
    { id: "inc_3", name: "C-Stands & Grip", included: true },
    { id: "opt_1", name: "Phase One IQ4 150MP", included: false, price: 150 },
    { id: "opt_2", name: "Aputure 600D Pro", included: false, price: 75 },
    { id: "opt_3", name: "Fog Machine", included: false, price: 35 },
  ],
  host: {
    id: "host-1",
    full_name: "Studio Amsterdam",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    is_verified: true,
    response_rate: 98,
    response_time: "within an hour",
    created_at: "2019-01-01",
    bio: "Professional studio operators with 15+ years experience in the creative industry.",
  },
  rating_breakdown: {
    cleanliness: 4.9,
    accuracy: 5.0,
    communication: 4.8,
    location: 4.9,
    value: 4.7,
    equipment: 5.0,
  },
}

const mockReviews = [
  {
    id: "1",
    reviewer: {
      full_name: "Sarah M.",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    },
    rating: 5,
    created_at: "2024-12-15",
    comment: "Absolutely stunning space! The natural light is incredible and the host was super helpful with setup.",
  },
  {
    id: "2",
    reviewer: {
      full_name: "James K.",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    },
    rating: 5,
    created_at: "2024-11-20",
    comment: "Perfect for our fashion shoot. All equipment was in great condition. Will definitely book again!",
  },
  {
    id: "3",
    reviewer: {
      full_name: "Emma L.",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    },
    rating: 4,
    created_at: "2024-11-10",
    comment: "Great studio with amazing amenities. The makeup room was a nice bonus for our team.",
  },
]

const mockSimilarStudios = [
  {
    id: "mock-2",
    title: "Industrial Warehouse",
    location: "Rotterdam",
    price_per_hour: 95,
    avg_rating: 4.88,
    images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600"],
  },
  {
    id: "mock-3",
    title: "White Box Gallery",
    location: "Den Haag",
    price_per_hour: 65,
    avg_rating: 4.95,
    images: ["https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600"],
  },
  {
    id: "mock-4",
    title: "Vintage Atelier",
    location: "Utrecht",
    price_per_hour: 85,
    avg_rating: 4.79,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600"],
  },
  {
    id: "mock-5",
    title: "Skyline Penthouse",
    location: "Amsterdam Zuid",
    price_per_hour: 125,
    avg_rating: 4.92,
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"],
  },
]

export async function generateMetadata({ params }: StudioDetailPageProps) {
  const { id } = await params
  const t = await getTranslations("StudioDetail")

  // Check if it's a mock ID
  if (id.startsWith("mock-")) {
    return {
      title: mockStudioData.title,
      description: mockStudioData.description,
    }
  }

  const supabase = await createClient()

  const { data: studio } = await supabase
    .from("studios")
    .select("title, description, city")
    .eq("id", id)
    .single()

  if (!studio) {
    return { title: t("studioNotFound") }
  }

  return {
    title: studio.title,
    description: studio.description || `${studio.title} in ${studio.city}`,
  }
}

export default async function StudioDetailPage({ params }: StudioDetailPageProps) {
  const { id } = await params

  // Check if it's a mock ID - use mock data
  if (id.startsWith("mock-")) {
    return (
      <StudioDetailClient
        studio={mockStudioData as any}
        reviews={mockReviews as any}
        similarStudios={mockSimilarStudios as any}
      />
    )
  }

  const supabase = await createClient()

  const { data: studio } = await supabase
    .from("studios")
    .select(`
      *,
      studio_images (*),
      studio_amenities (*),
      host:users!studios_host_id_fkey (*)
    `)
    .eq("id", id)
    .or("is_published.eq.true,status.eq.active")
    .single()

  if (!studio) {
    // If no studio found, show mock data
    return (
      <StudioDetailClient
        studio={mockStudioData as any}
        reviews={mockReviews as any}
        similarStudios={mockSimilarStudios as any}
      />
    )
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:users!reviews_reviewer_id_fkey (*)
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

  // Add mock equipment and rating breakdown if not in DB
  const studioWithExtras = {
    ...studio,
    equipment: mockStudioData.equipment,
    rating_breakdown: mockStudioData.rating_breakdown,
  }

  return (
    <StudioDetailClient
      studio={studioWithExtras}
      reviews={reviews || mockReviews as any}
      similarStudios={similarStudios && similarStudios.length > 0 ? similarStudios : mockSimilarStudios as any}
    />
  )
}
