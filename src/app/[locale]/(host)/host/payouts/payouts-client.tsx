"use client"

import { useState, useEffect } from "react"
import { Link, useRouter } from "@/i18n/routing"

interface BankDetails {
  accountHolderName: string
  iban: string
  bic: string
}

interface PayoutRecord {
  id: string
  date: string
  reference: string
  amount: number
  status: "success" | "pending"
}

interface PayoutsClientProps {
  stripeConnected: boolean
  bankDetails: BankDetails
  payoutHistory: PayoutRecord[]
}

export function PayoutsClient({
  stripeConnected: initialStripeConnected,
  bankDetails: initialBankDetails,
  payoutHistory,
}: PayoutsClientProps) {
  const router = useRouter()
  const [stripeConnected, setStripeConnected] = useState(initialStripeConnected)
  const [stripeStatus, setStripeStatus] = useState<{
    chargesEnabled?: boolean
    payoutsEnabled?: boolean
  }>({})
  const [bankDetails, setBankDetails] = useState(initialBankDetails)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkStripeStatus()
  }, [])

  const checkStripeStatus = async () => {
    try {
      const response = await fetch("/api/stripe/connect")
      const data = await response.json()
      if (data.connected) {
        setStripeConnected(true)
        setStripeStatus({
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
        })
      }
    } catch (err) {
      console.error("Failed to check Stripe status:", err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect Stripe")
      }

      // Redirect to Stripe Connect onboarding
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
      setIsConnecting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/users/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_account_name: bankDetails.accountHolderName,
          bank_iban: bankDetails.iban,
          bank_bic: bankDetails.bic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save bank details")
      }

      setSuccess("Bankgegevens succesvol opgeslagen!")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/host/dashboard" className="text-gray-500 text-sm font-medium">
            Dashboard
          </Link>
          <span className="text-gray-500 text-sm font-medium">/</span>
          <span className="text-sm font-medium">Uitbetalingsinstellingen</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight">Uitbetalingsinstellingen</h1>
        <p className="text-gray-500 text-base mt-2">
          Stel in hoe en wanneer je betalingen voor je studioboekingen ontvangt.
        </p>
      </div>

      <div className="space-y-6">
        {/* Stripe Integration Card */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-6">
              <div className="size-16 rounded-2xl bg-[#635bff] flex items-center justify-center text-white shadow-lg shadow-[#635bff]/20">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold">Uitbetalingsmethode</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      stripeConnected
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {stripeConnected ? "Verbonden" : "Niet Verbonden"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                  We werken samen met Stripe voor veilige, snelle uitbetalingen. Verbind je account om
                  automatisch betalingen te ontvangen in meer dan 40 landen.
                </p>
              </div>
            </div>
            <button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="bg-black hover:bg-black/90 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  <span>Verbinden...</span>
                </>
              ) : (
                <>
                  <span>{stripeConnected ? "Stripe Beheren" : "Verbinden met Stripe"}</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Bank Account Details Card */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-black">account_balance</span>
            <h3 className="text-xl font-bold">Bankrekeninggegevens</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold ml-1">Rekeninghouder</label>
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) =>
                  setBankDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))
                }
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black"
                placeholder="bijv. Creative Spaces BV"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold ml-1">BIC / SWIFT Code</label>
              <input
                type="text"
                value={bankDetails.bic}
                onChange={(e) => setBankDetails((prev) => ({ ...prev, bic: e.target.value }))}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black"
                placeholder="ABNANL2AXXX"
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-bold ml-1">IBAN</label>
              <input
                type="text"
                value={bankDetails.iban}
                onChange={(e) => setBankDetails((prev) => ({ ...prev, iban: e.target.value }))}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black"
                placeholder="NL00 ABNA 0000 0000 00"
              />
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 bg-black/5 rounded-xl">
            <span className="material-symbols-outlined text-black text-xl">info</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              Je bankgegevens worden versleuteld en veilig opgeslagen. We gebruiken deze gegevens alleen
              om handmatige uitbetalingen te verwerken als Stripe-integratie niet beschikbaar is voor jouw regio.
            </p>
          </div>
        </section>

        {/* Payout History Card */}
        <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-black">history</span>
              <h3 className="text-xl font-bold">Recente Uitbetalingen</h3>
            </div>
            <Link href="/host/earnings" className="text-black text-sm font-bold hover:underline">
              Bekijk alle geschiedenis
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Referentie
                  </th>
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Bedrag
                  </th>
                  <th className="py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payoutHistory.map((payout) => (
                  <tr key={payout.id}>
                    <td className="py-4 text-sm text-gray-600">{payout.date}</td>
                    <td className="py-4 text-sm text-gray-500">{payout.reference}</td>
                    <td className="py-4 text-sm font-bold">{formatCurrency(payout.amount)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payout.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            payout.status === "success" ? "bg-green-600" : "bg-blue-600"
                          }`}
                        />
                        {payout.status === "success" ? "Geslaagd" : "In Afwachting"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600">
            <span className="material-symbols-outlined">error</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-600">
            <span className="material-symbols-outlined">check_circle</span>
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Save Action */}
        <div className="flex items-center justify-between p-8 bg-gray-900 rounded-[2rem] shadow-xl text-white">
          <div className="flex flex-col">
            <p className="text-sm font-medium opacity-80">Klaar om af te ronden?</p>
            <p className="text-xs opacity-60">Controleer je bankgegevens voordat je opslaat.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-white text-gray-900 hover:bg-gray-100 font-black py-4 px-10 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Opslaan...
              </>
            ) : (
              "Uitbetalingsinstellingen Opslaan"
            )}
          </button>
        </div>

        {/* Security Badges */}
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined">verified_user</span>
              <span className="text-xs font-bold uppercase tracking-wider">Stripe Beveiligd</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined">lock</span>
              <span className="text-xs font-bold uppercase tracking-wider">SSL Versleuteld</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined">security</span>
              <span className="text-xs font-bold uppercase tracking-wider">PCI Compliant</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs">
            © 2024 LCTNSHIPS Inc. Alle financiele verwerking is beveiligd door Stripe API.
          </p>
        </div>
      </div>
    </div>
  )
}
