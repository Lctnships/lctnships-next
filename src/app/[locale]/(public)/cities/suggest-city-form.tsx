"use client"

import { useState } from "react"
import { toast } from "sonner"

interface SuggestCityFormProps {
  placeholder: string
  buttonText: string
}

export function SuggestCityForm({ placeholder, buttonText }: SuggestCityFormProps) {
  const [cityName, setCityName] = useState("")

  const handleSubmit = () => {
    if (!cityName.trim()) {
      toast.error("Please enter a city name")
      return
    }
    toast.success("Thanks for your suggestion!")
    setCityName("")
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
      <div className="relative w-full max-w-md">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <input
          className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 rounded-full border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-black focus:ring-0 transition-all text-sm font-semibold"
          placeholder={placeholder}
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit()
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-black text-white font-extrabold rounded-full hover:shadow-xl hover:brightness-105 active:scale-95 transition-all text-sm sm:text-base"
      >
        {buttonText}
      </button>
    </div>
  )
}
