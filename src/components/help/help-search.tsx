"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"

export function HelpSearch() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/help/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-3 relative">
      <form onSubmit={handleSearch}>
        <label className="flex flex-col min-w-40 h-16 w-full group">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white border border-[#e7ebf3] shadow-xl shadow-[#2b6cee10] transition-all focus-within:ring-2 focus-within:ring-black/20">
            <div className="text-black flex items-center justify-center pl-6 pr-2">
              <span className="material-symbols-outlined text-3xl">search</span>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#0d121b] focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#4c669a] px-4 text-lg font-normal leading-normal"
              placeholder="Zoek artikelen, gidsen of helponderwerpen..."
            />
            <div className="flex items-center pr-4">
              <span className="bg-gray-100 text-black text-xs font-bold px-2 py-1 rounded-md">
                CMD + K
              </span>
            </div>
          </div>
        </label>
      </form>
    </div>
  )
}
