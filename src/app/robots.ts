import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/bookings",
          "/projects",
          "/favorites",
          "/messages",
          "/notifications",
          "/profile",
          "/settings",
          "/credits",
          "/host/dashboard",
          "/host/bookings",
          "/host/studios",
          "/host/calendar",
          "/host/earnings",
          "/host/equipment",
          "/host/messages",
          "/host/settings",
          "/host/onboarding",
          "/book/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
