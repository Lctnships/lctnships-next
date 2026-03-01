"use client"

import { useState } from "react"

export function HelpArticleFeedback() {
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value)
    setSubmitted(true)
    // In production, send this to your analytics/API
  }

  if (submitted) {
    return (
      <div className="mt-20 pt-10 border-t border-[#e7ebf3]">
        <div className="bg-[#f6f6f8] rounded-3xl p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-black mb-2">check_circle</span>
          <h4 className="text-xl font-bold text-[#0d121b] mb-1">Bedankt voor je feedback!</h4>
          <p className="text-[#4c669a] text-sm">Je helpt ons om onze hulpartikelen te verbeteren.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-20 pt-10 border-t border-[#e7ebf3]">
      <div className="bg-[#f6f6f8] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-bold text-[#0d121b] mb-1">Was dit artikel nuttig?</h4>
          <p className="text-[#4c669a] text-sm">342 mensen vonden dit nuttig</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => handleFeedback("yes")}
            className="flex items-center gap-2 bg-white border border-[#cfd7e7] px-6 py-3 rounded-2xl hover:bg-gray-100 hover:border-black transition-all group"
          >
            <span className="material-symbols-outlined text-black group-hover:scale-110 transition-transform">
              thumb_up
            </span>
            <span className="font-bold">Ja</span>
          </button>
          <button
            onClick={() => handleFeedback("no")}
            className="flex items-center gap-2 bg-white border border-[#cfd7e7] px-6 py-3 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-all group"
          >
            <span className="material-symbols-outlined text-gray-400 group-hover:text-red-500 group-hover:scale-110 transition-transform">
              thumb_down
            </span>
            <span className="font-bold">Nee</span>
          </button>
        </div>
      </div>
    </div>
  )
}
