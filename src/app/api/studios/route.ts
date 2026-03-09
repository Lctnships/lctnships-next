import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { getFromCache, setInCache, createCacheKey, cacheTTL, invalidateCache } from "@/lib/cache"

// GET /api/studios - List studios with filtering and search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Query parameters
    const search = searchParams.get("search")
    const city = searchParams.get("city")
    const type = searchParams.get("type")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const date = searchParams.get("date")
    const amenities = searchParams.get("amenities")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "12"
    const hostId = searchParams.get("hostId")

    // Generate cache key (skip caching for date-specific queries)
    const cacheKey = !date
      ? createCacheKey("studios", {
          search: search || undefined,
          city: city || undefined,
          type: type || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          amenities: amenities || undefined,
          sortBy,
          sortOrder,
          page,
          limit,
          hostId: hostId || undefined,
        })
      : null

    // Check cache first (only for non-date queries)
    if (cacheKey) {
      const cached = await getFromCache<{ studios: unknown[]; pagination: unknown }>(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: { "X-Cache": "HIT" },
        })
      }
    }

    const supabase = await createClient()
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    // Optimized select - only fetch needed fields
    let query = supabase
      .from("studios")
      .select(
        `
        id,
        title,
        description,
        type,
        city,
        price_per_hour,
        daily_rate,
        avg_rating,
        total_reviews,
        is_featured,
        amenities,
        images,
        studio_images (id, image_url, is_cover, display_order),
        host:users!studios_host_id_fkey (id, full_name, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("is_published", true)

    // Filter by host
    if (hostId) {
      query = query.eq("host_id", hostId)
    }

    // Search filter - use text search for better performance
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`
      )
    }

    // City filter
    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    // Type filter
    if (type) {
      query = query.eq("type", type)
    }

    // Price range filter
    if (minPrice) {
      query = query.gte("price_per_hour", parseFloat(minPrice))
    }
    if (maxPrice) {
      query = query.lte("price_per_hour", parseFloat(maxPrice))
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(",")
      if (amenityList.length > 0) {
        query = query.contains("amenities", amenityList)
      }
    }

    // Sorting - validate field
    const validSortFields = ["created_at", "price_per_hour", "avg_rating", "title"]
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at"
    query = query.order(sortField, { ascending: sortOrder === "asc" })

    // Pagination
    const from = (pageNum - 1) * limitNum
    const to = from + limitNum - 1
    query = query.range(from, to)

    const { data: studios, error, count } = await query

    if (error) throw error

    // If date is provided, filter out studios with conflicting bookings
    let availableStudios = studios
    if (date && studios && studios.length > 0) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const studioIds = studios.map((s) => s.id)

      // Optimized query - only select studio_id
      const { data: bookedStudios } = await supabase
        .from("bookings")
        .select("studio_id")
        .in("studio_id", studioIds)
        .neq("status", "cancelled")
        .gte("start_datetime", startOfDay.toISOString())
        .lte("start_datetime", endOfDay.toISOString())

      const bookedIds = new Set(bookedStudios?.map((b) => b.studio_id))
      availableStudios = studios.filter((s) => !bookedIds.has(s.id))
    }

    const result = {
      studios: availableStudios,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    }

    // Cache the result (30 seconds for search queries, 60 for browsing)
    if (cacheKey) {
      const ttl = search ? cacheTTL.SHORT : cacheTTL.STANDARD
      await setInCache(cacheKey, result, ttl)
    }

    return NextResponse.json(result, {
      headers: { "X-Cache": "MISS" },
    })
  } catch (error: unknown) {
    logger.error("Error fetching studios", error)
    return NextResponse.json({ error: "Failed to fetch studios" }, { status: 500 })
  }
}

// POST /api/studios - Create a new studio
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      location,
      address,
      city,
      country,
      latitude,
      longitude,
      price_per_hour,
      minimum_hours,
      maximum_hours,
      amenities,
      rules,
      cancellation_policy,
      entry_code,
      wifi_password,
      access_instructions,
    } = body

    // Validate required fields
    if (!title || !type || !price_per_hour) {
      return NextResponse.json(
        { error: "Title, type, and hourly rate are required" },
        { status: 400 }
      )
    }

    // Validate price is positive
    if (price_per_hour <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      )
    }

    const { data: studio, error } = await supabase
      .from("studios")
      .insert({
        owner_id: user.id,
        host_id: user.id,
        title,
        description,
        type,
        location: location || city || "",
        address,
        city,
        country,
        latitude,
        longitude,
        price_per_hour,
        minimum_hours: minimum_hours || 1,
        maximum_hours: maximum_hours || 12,
        amenities: amenities || [],
        rules: rules || [],
        cancellation_policy: cancellation_policy || "flexible",
        entry_code,
        wifi_password,
        access_instructions,
        is_published: false,
      })
      .select("id, title, type, city, price_per_hour, is_published, created_at")
      .single()

    if (error) throw error

    // Invalidate cache when new studio is created
    await invalidateCache("studios:")
    if (studio?.id) {
      await invalidateCache(`studios:${studio.id}`)
    }

    return NextResponse.json({ studio }, { status: 201 })
  } catch (error: unknown) {
    logger.error("Error creating studio", error)
    return NextResponse.json({ error: "Failed to create studio" }, { status: 500 })
  }
}
