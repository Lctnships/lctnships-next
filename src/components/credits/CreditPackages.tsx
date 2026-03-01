"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, Crown, Building2 } from "lucide-react"

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  price_per_day: number
  discount_percent: number
  description: string
}

interface CreditPackagesProps {
  packages: CreditPackage[]
}

const packageIcons: Record<string, React.ReactNode> = {
  Starter: <Zap className="h-6 w-6" />,
  Popular: <Sparkles className="h-6 w-6" />,
  Pro: <Crown className="h-6 w-6" />,
  Studio: <Building2 className="h-6 w-6" />,
}

export function CreditPackages({ packages }: CreditPackagesProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)

    try {
      const response = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout")
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Purchase error:", error)
      alert("Er ging iets mis. Probeer het opnieuw.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map((pkg) => {
        const isPopular = pkg.name === "Popular"

        return (
          <Card
            key={pkg.id}
            className={`relative transition-all hover:shadow-lg ${
              isPopular ? "border-black ring-2 ring-black/20" : ""
            }`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-black text-white px-4">
                  Meest gekozen
                </Badge>
              </div>
            )}

            <CardHeader className="pt-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isPopular
                      ? "bg-gray-100 text-black"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {packageIcons[pkg.name] || <Zap className="h-6 w-6" />}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
              </div>
              <p className="text-muted-foreground text-sm">{pkg.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">€{pkg.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  voor {pkg.credits} studio dagen
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prijs per dag</span>
                  <span className="font-medium">€{pkg.price_per_day}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Korting</span>
                  <span className="font-medium text-green-600">
                    {pkg.discount_percent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Geldigheid</span>
                  <span className="font-medium">Onbeperkt</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Alle studio types</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Flexibel inzetbaar</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Geen vervaldate</span>
                </div>
              </div>

              <Button
                className={`w-full ${isPopular ? "" : "variant-outline"}`}
                variant={isPopular ? "default" : "outline"}
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
              >
                {loading === pkg.id ? "Laden..." : "Kopen"}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
