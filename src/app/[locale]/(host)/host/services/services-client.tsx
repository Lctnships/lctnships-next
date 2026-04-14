"use client"

import { useState } from "react"
import { toast } from "sonner"

interface Service {
  id: string
  host_id: string
  studio_id: string | null
  name: string
  description: string | null
  price: number
  pricing_unit: "flat" | "per_hour" | "per_session"
  is_active: boolean
  created_at: string
}

interface StudioOption {
  id: string
  title: string
}

interface ServicesClientProps {
  initialServices: Service[]
  studios: StudioOption[]
}

const UNIT_LABEL: Record<Service["pricing_unit"], string> = {
  flat: "per dienst",
  per_hour: "per uur",
  per_session: "per sessie",
}

export function ServicesClient({ initialServices, studios }: ServicesClientProps) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [editing, setEditing] = useState<Partial<Service> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const startNew = () =>
    setEditing({ name: "", description: "", price: 0, pricing_unit: "flat", studio_id: null, is_active: true })

  const studioName = (id: string | null | undefined) =>
    id ? studios.find((s) => s.id === id)?.title ?? "Onbekend" : "Alle studio's"

  const save = async () => {
    if (!editing) return
    setIsSaving(true)
    try {
      const isCreate = !editing.id
      const url = isCreate ? "/api/services" : `/api/services/${editing.id}`
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name?.trim(),
          description: editing.description ?? null,
          price: Number(editing.price),
          pricing_unit: editing.pricing_unit,
          studio_id: editing.studio_id ?? null,
          is_active: editing.is_active ?? true,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Opslaan mislukt")
      const saved = json.service as Service
      setServices((prev) =>
        isCreate ? [saved, ...prev] : prev.map((s) => (s.id === saved.id ? saved : s))
      )
      setEditing(null)
      toast.success(isCreate ? "Dienst aangemaakt" : "Dienst bijgewerkt")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Onbekende fout")
    } finally {
      setIsSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Dienst verwijderen?")) return
    const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(json.error ?? "Verwijderen mislukt")
      return
    }
    setServices((prev) => prev.filter((s) => s.id !== id))
    toast.success("Dienst verwijderd")
  }

  const toggleActive = async (svc: Service) => {
    const res = await fetch(`/api/services/${svc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !svc.is_active }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? "Wijziging mislukt")
      return
    }
    setServices((prev) => prev.map((s) => (s.id === svc.id ? json.service : s)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Diensten</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-0.5">
            Bied extra diensten aan bij je studio boekingen.
          </p>
        </div>
        <button
          onClick={startNew}
          className="rounded-full bg-black text-white px-5 py-2.5 text-sm font-semibold hover:bg-black/90"
        >
          + Nieuwe dienst
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <p className="text-gray-500">Je hebt nog geen diensten aangemaakt.</p>
          <button
            onClick={startNew}
            className="mt-4 rounded-full bg-black text-white px-5 py-2 text-sm font-semibold"
          >
            Maak je eerste dienst
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg truncate">{svc.name}</h3>
                  {!svc.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      Inactief
                    </span>
                  )}
                </div>
                {svc.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{svc.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  €{Number(svc.price).toFixed(2)} {UNIT_LABEL[svc.pricing_unit]} · {studioName(svc.studio_id)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(svc)}
                  className="text-sm rounded-full border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
                >
                  {svc.is_active ? "Deactiveer" : "Activeer"}
                </button>
                <button
                  onClick={() => setEditing(svc)}
                  className="text-sm rounded-full border border-gray-200 px-3 py-1.5 hover:bg-gray-50"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => remove(svc.id)}
                  className="text-sm rounded-full border border-red-200 text-red-700 px-3 py-1.5 hover:bg-red-50"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold">{editing.id ? "Dienst bewerken" : "Nieuwe dienst"}</h2>
            <label className="block text-sm font-medium">
              Naam
              <input
                value={editing.name ?? ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium">
              Beschrijving
              <textarea
                value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Prijs (€)
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editing.price ?? 0}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium">
                Eenheid
                <select
                  value={editing.pricing_unit ?? "flat"}
                  onChange={(e) =>
                    setEditing({ ...editing, pricing_unit: e.target.value as Service["pricing_unit"] })
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                >
                  <option value="flat">Per dienst</option>
                  <option value="per_hour">Per uur</option>
                  <option value="per_session">Per sessie</option>
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium">
              Studio
              <select
                value={editing.studio_id ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, studio_id: e.target.value || null })
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
              >
                <option value="">Alle studio&apos;s</option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.is_active ?? true}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              />
              Actief
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditing(null)}
                disabled={isSaving}
                className="rounded-full px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={save}
                disabled={isSaving}
                className="rounded-full bg-black text-white px-5 py-2 text-sm font-semibold hover:bg-black/90 disabled:opacity-60"
              >
                {isSaving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
