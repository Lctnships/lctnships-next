"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

interface CreditTransaction {
  id: string
  type: "purchase" | "use" | "refund" | "expire"
  credits: number
  description: string
  created_at: string
}

interface CreditTransactionsProps {
  transactions: CreditTransaction[]
}

const typeConfig = {
  purchase: {
    icon: ArrowDownLeft,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Aankoop",
  },
  use: {
    icon: ArrowUpRight,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "Gebruikt",
  },
  refund: {
    icon: RotateCcw,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Terugbetaling",
  },
  expire: {
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Verlopen",
  },
}

export function CreditTransactions({ transactions }: CreditTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transactiegeschiedenis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nog geen transacties
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transactiegeschiedenis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => {
            const config = typeConfig[tx.type]
            const Icon = config.icon

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(tx.created_at), {
                        addSuffix: true,
                        locale: nl,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-semibold ${
                      tx.credits > 0 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {tx.credits > 0 ? "+" : ""}
                    {tx.credits}
                  </span>
                  <p className="text-xs text-muted-foreground">credits</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
