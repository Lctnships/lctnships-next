"use client"

import { useState, useEffect, useRef, useCallback } from "react"

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

interface AddressSuggestion {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface AddressAutocompleteProps {
  value: AddressData
  onChange: (address: AddressData) => void
  placeholder?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Zoek je adres...",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isManualMode, setIsManualMode] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch suggestions from Google Places API
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`
      )
      const data = await response.json()
      if (data.predictions) {
        setSuggestions(data.predictions)
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  const handleQueryChange = (input: string) => {
    setQuery(input)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(input)
    }, 300)
  }

  // Get place details when user selects a suggestion
  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    setIsLoading(true)
    setIsOpen(false)
    setQuery(suggestion.description)

    try {
      const response = await fetch(
        `/api/places/details?place_id=${suggestion.place_id}`
      )
      const data = await response.json()

      if (data.result) {
        const components = data.result.address_components || []
        const addressData: AddressData = {
          street: "",
          houseNumber: "",
          postalCode: "",
          city: "",
          country: "",
          formatted: data.result.formatted_address || suggestion.description,
          lat: data.result.geometry?.location?.lat,
          lng: data.result.geometry?.location?.lng,
        }

        // Parse address components
        for (const component of components) {
          const types = component.types
          if (types.includes("street_number")) {
            addressData.houseNumber = component.long_name
          } else if (types.includes("route")) {
            addressData.street = component.long_name
          } else if (types.includes("postal_code")) {
            addressData.postalCode = component.long_name
          } else if (types.includes("locality")) {
            addressData.city = component.long_name
          } else if (types.includes("country")) {
            addressData.country = component.long_name
          }
        }

        onChange(addressData)
        setIsManualMode(true) // Show detailed fields after selection
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle manual field changes
  const handleFieldChange = (field: keyof AddressData, fieldValue: string) => {
    const newAddress = { ...value, [field]: fieldValue }
    // Update formatted address
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

  // Use current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocatie wordt niet ondersteund door je browser")
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/places/geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
          )
          const data = await response.json()

          if (data.results?.[0]) {
            const result = data.results[0]
            const components = result.address_components || []
            const addressData: AddressData = {
              street: "",
              houseNumber: "",
              postalCode: "",
              city: "",
              country: "",
              formatted: result.formatted_address,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            for (const component of components) {
              const types = component.types
              if (types.includes("street_number")) {
                addressData.houseNumber = component.long_name
              } else if (types.includes("route")) {
                addressData.street = component.long_name
              } else if (types.includes("postal_code")) {
                addressData.postalCode = component.long_name
              } else if (types.includes("locality")) {
                addressData.city = component.long_name
              } else if (types.includes("country")) {
                addressData.country = component.long_name
              }
            }

            onChange(addressData)
            setQuery(result.formatted_address)
            setIsManualMode(true)
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error)
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsLoading(false)
        alert("Kon je locatie niet bepalen. Controleer je instellingen.")
      }
    )
  }

  return (
    <div ref={wrapperRef} className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-4 text-gray-400">
          location_on
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          className="w-full bg-white border border-gray-200 rounded-xl h-14 pl-12 pr-24 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all shadow-sm placeholder:text-gray-400"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="absolute right-3 top-2.5 flex items-center gap-1 px-3 py-2 text-xs font-semibold text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-sm">my_location</span>
          )}
          <span className="hidden sm:inline">Gebruik locatie</span>
        </button>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
              >
                <span className="material-symbols-outlined text-gray-400 mt-0.5">location_on</span>
                <div>
                  <p className="font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-gray-500">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Address Fields */}
      {isManualMode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="sm:col-span-2 flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            <span className="text-sm font-medium text-gray-600">Adres gevonden - controleer de gegevens</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Straat</label>
            <input
              type="text"
              value={value.street}
              onChange={(e) => handleFieldChange("street", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg h-11 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm"
              placeholder="Straatnaam"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Huisnummer</label>
            <input
              type="text"
              value={value.houseNumber}
              onChange={(e) => handleFieldChange("houseNumber", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg h-11 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm"
              placeholder="123"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Postcode</label>
            <input
              type="text"
              value={value.postalCode}
              onChange={(e) => handleFieldChange("postalCode", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg h-11 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm"
              placeholder="1234 AB"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Plaats</label>
            <input
              type="text"
              value={value.city}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg h-11 px-4 text-gray-900 focus:ring-2 focus:ring-black focus:border-black transition-all text-sm"
              placeholder="Amsterdam"
            />
          </div>
        </div>
      )}

      {/* Manual Entry Toggle */}
      {!isManualMode && (
        <button
          type="button"
          onClick={() => setIsManualMode(true)}
          className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1 self-start"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Adres handmatig invoeren
        </button>
      )}
    </div>
  )
}
