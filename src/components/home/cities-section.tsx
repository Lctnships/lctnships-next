import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export async function CitiesSection() {
  const supabase = await createClient()

  const { data: studios } = await supabase
    .from("studios")
    .select("city")
    .eq("status", "active")

  const cityCounts = new Map<string, number>()
  if (studios) {
    for (const studio of studios) {
      if (studio.city) {
        const city = studio.city
        cityCounts.set(city, (cityCounts.get(city) || 0) + 1)
      }
    }
  }

  const cities = Array.from(cityCounts.entries())
    .map(([name, count]) => ({
      name,
      studios: count,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }))
    .sort((a, b) => b.studios - a.studios)
    .slice(0, 6)

  if (cities.length === 0) {
    return null
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Ontdek studio&apos;s bij jou in de buurt</h2>
          <p className="mt-2 text-muted-foreground">
            Vind creatieve ruimtes in de grootste steden van Nederland
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link key={city.slug} href={`/studios?city=${city.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg">{city.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {city.studios} studio&apos;s
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
