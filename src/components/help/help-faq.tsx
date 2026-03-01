"use client"

import { useState } from "react"

interface Question {
  question: string
  answer: string
}

interface HelpFAQProps {
  questions: Question[]
}

export function HelpFAQ({ questions }: HelpFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-[#e7ebf3] overflow-hidden group"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-5 flex items-center justify-between text-left group-hover:bg-gray-100 transition-colors"
          >
            <span className="text-[#0d121b] font-semibold">{item.question}</span>
            <span className={`material-symbols-outlined text-black transition-transform ${openIndex === index ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
          {openIndex === index && (
            <div className="px-6 pb-5 text-[#4c669a] text-sm leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
