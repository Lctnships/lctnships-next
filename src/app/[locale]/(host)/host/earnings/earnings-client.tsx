"use client"

import { useState } from "react"
import { Link, useRouter } from "@/i18n/routing"

interface Transaction {
  id: string
  type: "booking" | "payout" | "refund"
  description: string
  guest: string
  amount: number
  date: string
  status: "completed" | "pending"
}

interface MonthlyData {
  month: string
  earnings: number
}

interface Studio {
  id: string
  title: string
  earnings: number
  bookings: number
  image: string
}

interface EarningsData {
  totalBalance: number
  pendingPayout: number
  thisMonth: number
  lastMonth: number
  monthlyGrowth: number
  yearToDate: number
}

interface EarningsClientProps {
  earnings: EarningsData
  transactions: Transaction[]
  monthlyData: MonthlyData[]
  studios: Studio[]
}

type TimeFilter = "week" | "month" | "year" | "all"

export function EarningsClient({
  earnings,
  transactions,
  monthlyData,
  studios,
}: EarningsClientProps) {
  const router = useRouter()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("nl-NL", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const maxEarning = Math.max(...monthlyData.map((d) => d.earnings))

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inkomsten & Omzet</h1>
          <p className="text-gray-500 mt-1">Beheer je inkomsten en uitbetalingen</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-gray-200 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Exporteren
          </button>
          <button
            onClick={() => router.push("/host/payouts")}
            className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">account_balance</span>
            Uitbetaling Aanvragen
          </button>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2">
        {(["week", "month", "year", "all"] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
              timeFilter === filter
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {filter === "week" && "Deze Week"}
            {filter === "month" && "Deze Maand"}
            {filter === "year" && "Dit Jaar"}
            {filter === "all" && "Alles"}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-black/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-black">account_balance_wallet</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Beschikbaar Saldo</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(earnings.totalBalance)}</p>
          <p className="text-sm text-gray-500 mt-2">Klaar om op te nemen</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">schedule</span>
            </div>
            <span className="text-sm font-medium text-gray-500">In Afwachting</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(earnings.pendingPayout)}</p>
          <p className="text-sm text-gray-500 mt-2">Verwerking in 2-3 dagen</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">trending_up</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Deze Maand</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(earnings.thisMonth)}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-500 text-sm font-bold flex items-center">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
              {earnings.monthlyGrowth}%
            </span>
            <span className="text-sm text-gray-500">t.o.v. vorige maand</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">calendar_month</span>
            </div>
            <span className="text-sm font-medium text-gray-500">Dit Jaar</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(earnings.yearToDate)}</p>
          <p className="text-sm text-gray-500 mt-2">Totale inkomsten in 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Omzet Overzicht</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-black" />
                <span className="text-sm text-gray-500">Inkomsten</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-2">
            {monthlyData.map((data, index) => {
              const height = maxEarning > 0 ? (data.earnings / maxEarning) * 100 : 0
              const isCurrentMonth = index === 8 // September
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isCurrentMonth ? "bg-black" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: "4px" }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(data.earnings)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Studios */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Best Presterende Studio's</h2>
          <div className="space-y-4">
            {studios.map((studio, index) => (
              <Link
                key={studio.id}
                href={`/host/studios/${studio.id}`}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                <div
                  className="size-12 rounded-xl bg-cover bg-center bg-gray-200"
                  style={{ backgroundImage: `url("${studio.image}")` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{studio.title}</p>
                  <p className="text-sm text-gray-500">{studio.bookings} boekingen</p>
                </div>
                <span className="font-bold text-black">{formatCurrency(studio.earnings)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Recente Transacties</h2>
          <Link
            href="/host/transactions"
            className="text-sm font-bold text-black hover:underline"
          >
            Alles Bekijken
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Transactie
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Gast
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bedrag
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center ${
                          txn.type === "booking"
                            ? "bg-green-100"
                            : txn.type === "payout"
                            ? "bg-blue-100"
                            : "bg-red-100"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${
                            txn.type === "booking"
                              ? "text-green-600"
                              : txn.type === "payout"
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {txn.type === "booking"
                            ? "calendar_month"
                            : txn.type === "payout"
                            ? "account_balance"
                            : "undo"}
                        </span>
                      </div>
                      <span className="font-medium">{txn.description}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-500">{txn.guest || "—"}</td>
                  <td className="py-4 px-4 text-gray-500">{formatDate(txn.date)}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        txn.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className={`font-bold ${
                        txn.amount >= 0 ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      {txn.amount >= 0 ? "+" : ""}
                      {formatCurrency(txn.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Uitbetalingsinstellingen</h3>
            <p className="text-gray-300">
              Beheer je uitbetalingsmethoden en plan automatische overboekingen
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white/10 rounded-full font-bold text-sm hover:bg-white/20 transition-colors">
              Bekijk Geschiedenis
            </button>
            <button className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors">
              Methoden Beheren
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
