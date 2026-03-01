"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, TrendingUp, Calendar } from "lucide-react"

interface UserCreditsProps {
  credits: number
  totalPurchased?: number
}

export function UserCredits({ credits, totalPurchased = 0 }: UserCreditsProps) {
  const used = totalPurchased - credits

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Beschikbare Credits
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-black">{credits}</div>
          <p className="text-xs text-muted-foreground mt-1">
            studio dagen beschikbaar
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totaal Gekocht</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalPurchased}</div>
          <p className="text-xs text-muted-foreground mt-1">
            credits aangekocht
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gebruikt</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{used}</div>
          <p className="text-xs text-muted-foreground mt-1">
            boekingen gemaakt
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
