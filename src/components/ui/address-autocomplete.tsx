"use client"

export interface AddressData {
  street: string
  houseNumber: string
  postalCode: string
  city: string
  country: string
  formatted: string
  lat?: number
  lng?: number
}

interface AddressAutocompleteProps {
  value: AddressData
  onChange: (address: AddressData) => void
  placeholder?: string
}

export function AddressAutocomplete({
  value,
  onChange,
}: AddressAutocompleteProps) {
  const handleFieldChange = (field: keyof AddressData, fieldValue: string) => {
    const newAddress = { ...value, [field]: fieldValue }
    newAddress.formatted = [
      newAddress.street,
      newAddress.houseNumber,
      newAddress.postalCode,
      newAddress.city,
    ]
      .filter(Boolean)
      .join(", ")
    onChange(newAddress)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Straat</label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => handleFieldChange("street", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm shadow-sm"
            placeholder="Straatnaam"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Huisnummer</label>
          <input
            type="text"
            value={value.houseNumber}
            onChange={(e) => handleFieldChange("houseNumber", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm shadow-sm"
            placeholder="123"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Postcode</label>
          <input
            type="text"
            value={value.postalCode}
            onChange={(e) => handleFieldChange("postalCode", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm shadow-sm"
            placeholder="1234 AB"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Plaats</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => handleFieldChange("city", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm shadow-sm"
            placeholder="Amsterdam"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Land</label>
          <input
            type="text"
            value={value.country}
            onChange={(e) => handleFieldChange("country", e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm shadow-sm"
            placeholder="Nederland"
          />
        </div>
      </div>
    </div>
  )
}
